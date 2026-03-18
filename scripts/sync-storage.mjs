import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

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

const rootPath = process.cwd()
const sourceEnvFile = resolve(rootPath, process.env.SOURCE_ENV_FILE || '.env.local')
const targetEnvFile = resolve(rootPath, process.env.TARGET_ENV_FILE || '.env')
const sourceFileEnv = parseEnvFile(sourceEnvFile)
const targetFileEnv = parseEnvFile(targetEnvFile)

const sourceSupabaseUrl = process.env.SOURCE_SUPABASE_URL || sourceFileEnv.NEXT_PUBLIC_SUPABASE_URL
const sourceServiceRoleKey = process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY || sourceFileEnv.SUPABASE_SERVICE_ROLE_KEY
const targetSupabaseUrl = process.env.TARGET_SUPABASE_URL || targetFileEnv.NEXT_PUBLIC_SUPABASE_URL
const targetServiceRoleKey = process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY || targetFileEnv.SUPABASE_SERVICE_ROLE_KEY

if (!sourceSupabaseUrl || !sourceServiceRoleKey) {
    throw new Error(`Missing source Supabase credentials. Checked SOURCE_* env vars and file ${sourceEnvFile}`)
}

if (!targetSupabaseUrl || !targetServiceRoleKey) {
    throw new Error(`Missing target Supabase credentials. Checked TARGET_* env vars and file ${targetEnvFile}`)
}

const dryRun = process.env.DRY_RUN !== 'false'
const verbose = process.env.VERBOSE !== 'false'
const autoConfirm = process.env.AUTO_CONFIRM === 'true'
const direction = process.env.SYNC_DIRECTION || `${sourceEnvFile} -> ${targetEnvFile}`

const source = createClient(
    sourceSupabaseUrl,
    sourceServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const target = createClient(
    targetSupabaseUrl,
    targetServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const bucketFilter = (process.env.STORAGE_BUCKETS || '')
    .split(',')
    .map((bucket) => bucket.trim())
    .filter(Boolean)

function printHeader() {
    console.log('Storage sync setup')
    console.log(`Direction: ${direction}`)
    console.log(`Source file: ${sourceEnvFile}`)
    console.log(`Target file: ${targetEnvFile}`)
    console.log(`Mode: ${dryRun ? 'dry-run' : 'execute'}`)
    console.log(`Bucket filter: ${bucketFilter.length > 0 ? bucketFilter.join(', ') : 'all'}`)
}

async function confirmExecution() {
    if (dryRun || autoConfirm) {
        return
    }

    const phrase = `APPLY ${direction}`
    console.log(`Confirmation required. Type the exact phrase to continue:`)
    console.log(phrase)
    const rl = createInterface({ input, output })
    const answer = await rl.question('> ')
    rl.close()

    if (answer !== phrase) {
        throw new Error('Confirmation phrase mismatch. Aborted.')
    }
}

async function ensureBucket(bucket) {
    if (dryRun) {
        return
    }

    const { data: targetBuckets, error: targetError } = await target.storage.listBuckets()
    if (targetError) {
        throw new Error(`Failed to list target buckets: ${targetError.message}`)
    }

    const exists = targetBuckets.some((targetBucket) => targetBucket.id === bucket.id)
    if (exists) {
        return
    }

    const { error: createError } = await target.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit || undefined,
        allowedMimeTypes: bucket.allowed_mime_types || undefined
    })

    if (createError) {
        throw new Error(`Failed to create bucket ${bucket.id}: ${createError.message}`)
    }
}

async function listFiles(bucketId, prefix = '') {
    const files = []
    let offset = 0

    while (true) {
        const { data, error } = await source.storage.from(bucketId).list(prefix, {
            limit: 100,
            offset,
            sortBy: { column: 'name', order: 'asc' }
        })

        if (error) {
            throw new Error(`Failed listing ${bucketId}/${prefix}: ${error.message}`)
        }

        if (!data || data.length === 0) {
            break
        }

        for (const item of data) {
            const itemPath = prefix ? `${prefix}/${item.name}` : item.name
            if (item.id) {
                files.push({
                    path: itemPath,
                    metadata: item.metadata || {}
                })
            } else {
                const childFiles = await listFiles(bucketId, itemPath)
                files.push(...childFiles)
            }
        }

        if (data.length < 100) {
            break
        }

        offset += data.length
    }

    return files
}

async function syncFile(bucketId, file) {
    if (dryRun) {
        return
    }

    const { data: blob, error: downloadError } = await source.storage.from(bucketId).download(file.path)
    if (downloadError) {
        throw new Error(`Failed downloading ${bucketId}/${file.path}: ${downloadError.message}`)
    }

    const uploadOptions = {
        upsert: true,
        contentType: file.metadata.mimetype || undefined,
        cacheControl: file.metadata.cacheControl || undefined
    }

    const { error: uploadError } = await target.storage.from(bucketId).upload(file.path, blob, uploadOptions)
    if (uploadError) {
        throw new Error(`Failed uploading ${bucketId}/${file.path}: ${uploadError.message}`)
    }
}

async function syncBucket(bucket) {
    await ensureBucket(bucket)
    const files = await listFiles(bucket.id)

    for (const file of files) {
        await syncFile(bucket.id, file)
    }

    const action = dryRun ? 'Planned' : 'Synced'
    console.log(`${action} bucket ${bucket.id}: ${files.length} files`)
    return files.length
}

async function main() {
    printHeader()
    const { data: sourceBuckets, error } = await source.storage.listBuckets()
    if (error) {
        throw new Error(`Failed to list source buckets: ${error.message}`)
    }

    const buckets = bucketFilter.length > 0
        ? sourceBuckets.filter((bucket) => bucketFilter.includes(bucket.id))
        : sourceBuckets

    if (buckets.length === 0) {
        throw new Error('No buckets selected for sync.')
    }

    console.log('Plan summary')
    for (const bucket of buckets) {
        const files = await listFiles(bucket.id)
        console.log(`${bucket.id}: source_files=${files.length}`)
    }

    await confirmExecution()

    let totalFilesSynced = 0
    for (const bucket of buckets) {
        const synced = await syncBucket(bucket)
        totalFilesSynced += synced
    }

    if (dryRun) {
        console.log('Dry-run completed. No target storage was changed.')
        return
    }

    if (verbose) {
        console.log(`Total files synced: ${totalFilesSynced}`)
    }

    console.log('Storage sync completed')
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
