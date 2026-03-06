import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminUser(email: string) {
    console.log(`Creating admin user for: ${email}...`)

    // 1. Create user in Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'TemporaryPassword123!', // User should reset this
        email_confirm: true
    })

    if (authError) {
        if (authError.message.includes('already exists')) {
            console.log('User already exists in Auth. Proceeding to update role...')
            // Get user ID
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const user = existingUsers.users.find(u => u.email === email)
            if (user) {
                await updatePublicUser(user.id, email)
            }
        } else {
            console.error('Error creating auth user:', authError.message)
            return
        }
    } else if (authUser.user) {
        console.log('Auth user created successfully.')
        await updatePublicUser(authUser.user.id, email)
    }
}

async function updatePublicUser(id: string, email: string) {
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id,
            email,
            role: 'admin',
            display_name: 'Helder Perez',
            extra_data_complete: true
        })

    if (upsertError) {
        console.error('Error upserting public user:', upsertError.message)
    } else {
        console.log(`Successfully set ${email} as ADMIN.`)
    }
}

const targetEmail = 'helder.perez@avynta.com'
createAdminUser(targetEmail)
