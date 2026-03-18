import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'

function parseEnvFile(filePath) {
    if (!existsSync(filePath)) {
        return {}
    }

    const content = readFileSync(filePath, 'utf8')
    const parsed = {}

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) {
            continue
        }

        const separatorIndex = line.indexOf('=')
        if (separatorIndex === -1) {
            continue
        }

        const key = line.slice(0, separatorIndex).trim()
        let value = line.slice(separatorIndex + 1)

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }

        parsed[key] = value
    }

    return parsed
}

function parseProjectRef(url) {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname || ''
        return host.split('.')[0] || ''
    } catch {
        return ''
    }
}

function runCommand(command, args, options = {}) {
    try {
        const stdout = execFileSync(command, args, {
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            env: process.env,
            timeout: options.timeoutMs
        }) || ''

        if (!options.capture && stdout.trim()) {
            console.log(stdout.trim())
        }

        return stdout
    } catch (error) {
        const isTimeout = error?.code === 'ETIMEDOUT' || /timed out/i.test(String(error?.message || ''))
        const stdout = typeof error.stdout === 'string' ? error.stdout : (error.stdout ? String(error.stdout) : '')
        const stderr = typeof error.stderr === 'string' ? error.stderr : (error.stderr ? String(error.stderr) : '')
        const combined = [stdout, stderr].filter(Boolean).join('\n').trim()

        if (combined) {
            console.error(combined)
        }

        const timeoutHint = isTimeout && options.timeoutMs
            ? `\nTimed out after ${options.timeoutMs}ms. Increase SCHEMA_SYNC_TIMEOUT_MS (or SCHEMA_SYNC_DUMP_TIMEOUT_MS for dumps).`
            : ''

        throw new Error(`Command failed: ${command} ${args.join(' ')}${timeoutHint}${combined ? `\n${combined}` : ''}`)
    }
}

function runSupabase(args, options = {}) {
    console.log(`Running: supabase ${args.join(' ')}`)
    return runCommand('supabase', args, options)
}

function parseRepairCommands(logOutput) {
    const regex = /supabase migration repair --status (reverted|applied)\s+([0-9]{8,})/g
    const commands = []
    let match = regex.exec(logOutput)
    while (match) {
        commands.push({ status: match[1], version: match[2] })
        match = regex.exec(logOutput)
    }
    return commands
}

function applyRepairCommands(commands) {
    for (const command of commands) {
        console.log(`Applying migration repair: ${command.status} ${command.version}`)
        runSupabase(['migration', 'repair', '--status', command.status, command.version], { timeoutMs })
    }
}

function timestamp() {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

function hasSqlStatements(sql) {
    const normalized = sql
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('--'))
        .join('\n')
        .trim()

    return normalized.length > 0
}

const rootPath = process.cwd()
const sourceEnvFile = resolve(rootPath, process.env.SOURCE_ENV_FILE || '.env.local')
const sourceEnv = parseEnvFile(sourceEnvFile)

const sourceUrl = process.env.SOURCE_SUPABASE_URL || sourceEnv.NEXT_PUBLIC_SUPABASE_URL
const sourceProjectRef = process.env.SOURCE_PROJECT_REF || parseProjectRef(sourceUrl || '')
const sourceDbPassword = process.env.SOURCE_DB_PASSWORD || process.env.POSTGRES_DATABASE_PASSWORD || sourceEnv.POSTGRES_DATABASE_PASSWORD
const migrationPrefix = process.env.SCHEMA_SYNC_PREFIX || 'source_auth_storage_sync'
const writeAuthStorageDiff = process.env.SCHEMA_SYNC_INCLUDE_AUTH_STORAGE !== 'false'
const checkOnly = process.env.CHECK_ONLY === 'true'
const autoMigrationRepair = process.env.AUTO_MIGRATION_REPAIR !== 'false'
const timeoutMs = Number(process.env.SCHEMA_SYNC_TIMEOUT_MS || 300000)
const dumpTimeoutMs = Number(process.env.SCHEMA_SYNC_DUMP_TIMEOUT_MS || Math.max(timeoutMs, 900000))
const debugDbPull = process.env.SCHEMA_SYNC_DEBUG_DB_PULL !== 'false'
const fallbackToDump = process.env.SCHEMA_SYNC_FALLBACK_DUMP !== 'false'
const includeAuthStorageInDump = process.env.SCHEMA_SYNC_DUMP_INCLUDE_AUTH_STORAGE !== 'false'

if (!sourceProjectRef) {
    throw new Error(`Missing source project ref. Checked SOURCE_PROJECT_REF and URL in ${sourceEnvFile}`)
}

if (!sourceDbPassword) {
    throw new Error(`Missing source DB password. Checked SOURCE_DB_PASSWORD, POSTGRES_DATABASE_PASSWORD, and ${sourceEnvFile}`)
}

console.log(`Schema sync source project: ${sourceProjectRef}`)
console.log(`Source env file: ${sourceEnvFile}`)
console.log(`Mode: ${checkOnly ? 'check' : 'sync'}`)
console.log(`Auto migration repair: ${autoMigrationRepair ? 'enabled' : 'disabled'}`)
console.log(`Command timeout (ms): ${timeoutMs}`)
console.log(`Dump timeout (ms): ${dumpTimeoutMs}`)
console.log(`DB pull debug: ${debugDbPull ? 'enabled' : 'disabled'}`)
console.log(`Fallback to schema dump: ${fallbackToDump ? 'enabled' : 'disabled'}`)

runSupabase(['link', '--project-ref', sourceProjectRef, '--password', sourceDbPassword], { timeoutMs })

function runDbPull() {
    console.log('Starting remote schema pull. This can take a few minutes on unstable connections.')
    const args = debugDbPull ? ['--debug', 'db', 'pull'] : ['db', 'pull']
    return runSupabase(args, { timeoutMs })
}

function createSnapshotMigrationFromDump() {
    const migrationsDir = join(rootPath, 'supabase', 'migrations')
    const tempDir = join(rootPath, 'supabase', '.temp')
    mkdirSync(migrationsDir, { recursive: true })
    mkdirSync(tempDir, { recursive: true })

    const filePath = join(migrationsDir, `${timestamp()}_${migrationPrefix}_snapshot.sql`)
    const schemas = includeAuthStorageInDump ? ['public', 'auth', 'storage'] : ['public']
    const tempFiles = []

    try {
        for (const schema of schemas) {
            const tempFile = join(tempDir, `${Date.now()}_${schema}_dump.sql`)
            tempFiles.push(tempFile)
            runSupabase(['db', 'dump', '--linked', '--schema', schema, '--file', tempFile], { timeoutMs: dumpTimeoutMs })
            const sql = readFileSync(tempFile, 'utf8')
            appendFileSync(filePath, sql.endsWith('\n') ? sql : `${sql}\n`)
        }
    } catch (error) {
        rmSync(filePath, { force: true })
        throw error
    } finally {
        for (const tempFile of tempFiles) {
            rmSync(tempFile, { force: true })
        }
    }

    console.log(`Created snapshot migration from source DB: ${filePath}`)
}

let usedDumpFallback = false
try {
    runDbPull()
} catch (error) {
    if (!autoMigrationRepair && !(fallbackToDump && !checkOnly)) {
        throw error
    }
    try {
        const repairCommands = parseRepairCommands(String(error.message || ''))
        if (repairCommands.length > 0 && autoMigrationRepair) {
            console.log(`Detected migration history drift. Running ${repairCommands.length} repair commands.`)
            applyRepairCommands(repairCommands)
            runDbPull()
        } else {
            throw error
        }
    } catch (retryError) {
        if (fallbackToDump && !checkOnly) {
            console.log('Falling back to schema dump snapshot because db pull did not complete.')
            createSnapshotMigrationFromDump()
            usedDumpFallback = true
        } else {
            throw retryError
        }
    }
}

if (writeAuthStorageDiff && !usedDumpFallback) {
    const diffSql = runSupabase(['db', 'diff', '--linked', '--schema', 'auth,storage'], { capture: true, timeoutMs })
    if (hasSqlStatements(diffSql)) {
        const migrationsDir = join(rootPath, 'supabase', 'migrations')
        mkdirSync(migrationsDir, { recursive: true })
        const filePath = join(migrationsDir, `${timestamp()}_${migrationPrefix}.sql`)
        if (!checkOnly) {
            writeFileSync(filePath, `${diffSql.trim()}\n`, 'utf8')
            console.log(`Created auth/storage migration: ${filePath}`)
        } else {
            console.log('Auth/storage drift detected')
            console.log(diffSql.trim())
            process.exit(2)
        }
    } else {
        console.log('No auth/storage drift detected')
    }
}

console.log('Schema migration sync step completed')
