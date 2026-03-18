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
const defaultConflictColumn = process.env.DEFAULT_CONFLICT_COLUMN || 'id'
const autoDiscoverTables = process.env.AUTO_DISCOVER_TABLES !== 'false'
const excludedTables = (process.env.CATALOG_EXCLUDE_TABLES || '')
    .split(',')
    .map((table) => table.trim())
    .filter(Boolean)

const conflictByTable = {
    store_markets: 'id',
    countries: 'id',
    measurement_units: 'id',
    tags: 'id',
    dietary_tags: 'id',
    meal_categories: 'id',
    product_groups: 'id',
    meal_plan_sizes: 'id',
    wellness_objectives: 'id',
    user_roles: 'id',
    brands: 'id',
    products: 'id',
    meals: 'id',
    meal_options: 'id',
    meal_day_configurations: 'id',
    brand_store_markets: 'brand_id,store_market_id',
    product_tags: 'product_id,tag_id',
    product_brands: 'product_id,brand_id',
    product_group_links: 'product_id,group_id',
    product_countries: 'product_id,country_id',
    meal_category_links: 'meal_id,category_id',
    meal_dietary_tags: 'meal_id,dietary_tag_id',
    meal_countries: 'meal_id,country_id'
}
const defaultCatalogTables = Object.keys(conflictByTable)

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

const batchSize = Number(process.env.CATALOG_BATCH_SIZE || 500)
const configuredTables = (process.env.CATALOG_TABLES || '')
    .split(',')
    .map((table) => table.trim())
    .filter(Boolean)

function applyTableExclusions(tables) {
    if (excludedTables.length === 0) {
        return tables
    }

    const blocked = new Set(excludedTables)
    return tables.filter((table) => !blocked.has(table))
}

async function discoverPublicTables() {
    const { data, error } = await source
        .schema('information_schema')
        .from('tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')

    if (error) {
        throw new Error(`Failed discovering public tables: ${error.message}`)
    }

    return (data || [])
        .map((row) => row.table_name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
}

async function resolveTables() {
    if (configuredTables.length > 0) {
        const selected = applyTableExclusions(configuredTables)
        if (selected.length === 0) {
            throw new Error('All configured tables are excluded by CATALOG_EXCLUDE_TABLES.')
        }
        return selected
    }

    if (!autoDiscoverTables) {
        throw new Error('No tables selected. Use CATALOG_TABLES or enable AUTO_DISCOVER_TABLES.')
    }

    let discovered = []
    try {
        discovered = await discoverPublicTables()
    } catch (error) {
        console.log(`Table auto-discovery failed, using default catalog tables. Reason: ${error.message}`)
        discovered = defaultCatalogTables
    }

    const selected = applyTableExclusions(discovered)
    if (selected.length === 0) {
        throw new Error('No public tables found after exclusions.')
    }
    return selected
}

function printHeader(tables) {
    console.log('Catalog sync setup')
    console.log(`Direction: ${direction}`)
    console.log(`Source file: ${sourceEnvFile}`)
    console.log(`Target file: ${targetEnvFile}`)
    console.log(`Mode: ${dryRun ? 'dry-run' : 'execute'}`)
    console.log(`Tables: ${tables.join(', ')}`)
    console.log(`Batch size: ${batchSize}`)
    console.log(`Default conflict column: ${defaultConflictColumn}`)
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

async function getTableCount(client, table) {
    const { count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true })

    if (error) {
        throw new Error(`Failed counting ${table}: ${error.message}`)
    }

    return count || 0
}

async function createPlan(tables) {
    const plan = []

    for (const table of tables) {
        const sourceCount = await getTableCount(source, table)
        const targetCount = await getTableCount(target, table)
        plan.push({ table, sourceCount, targetCount })
    }

    return plan
}

async function readBatch(table, from) {
    const to = from + batchSize - 1
    const { data, error } = await source
        .from(table)
        .select('*')
        .range(from, to)

    if (error) {
        throw new Error(`Failed reading ${table}: ${error.message}`)
    }

    return data || []
}

async function upsertBatch(table, rows) {
    if (rows.length === 0) {
        return
    }

    const onConflict = conflictByTable[table] || defaultConflictColumn
    if (verbose && !conflictByTable[table] && defaultConflictColumn) {
        console.log(`Using default conflict column for ${table}: ${onConflict}`)
    }

    const options = onConflict ? { onConflict } : undefined
    const query = target.from(table)
    const { error } = options ? await query.upsert(rows, options) : await query.upsert(rows)

    if (error) {
        throw new Error(`Failed upserting ${table}: ${error.message}`)
    }
}

async function syncTable(table) {
    if (dryRun) {
        const total = await getTableCount(source, table)
        console.log(`Planned ${table}: ${total} rows`)
        return total
    }

    let offset = 0
    let total = 0

    while (true) {
        const rows = await readBatch(table, offset)
        if (rows.length === 0) {
            break
        }

        await upsertBatch(table, rows)
        total += rows.length
        offset += rows.length

        if (rows.length < batchSize) {
            break
        }
    }

    console.log(`Synced ${table}: ${total} rows`)
    return total
}

async function main() {
    const tables = await resolveTables()
    printHeader(tables)
    const plan = await createPlan(tables)

    console.log('Plan summary')
    for (const item of plan) {
        console.log(`${item.table}: source=${item.sourceCount} target=${item.targetCount}`)
    }

    await confirmExecution()

    let totalRowsSynced = 0
    for (const table of tables) {
        const synced = await syncTable(table)
        totalRowsSynced += synced
    }

    if (dryRun) {
        console.log('Dry-run completed. No target data was changed.')
        return
    }

    if (verbose) {
        console.log(`Total rows synced: ${totalRowsSynced}`)
    }

    console.log('Catalog sync completed')
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
