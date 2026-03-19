"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail, sendSms, sendPush } from "@/lib/notifications"
import { getMediaUrl } from "@/lib/utils"

export async function sendBroadcastAction(formData: FormData) {
    const supabase = await createClient()

    const channel = formData.get("channel") as string
    const targetGroup = formData.get("targetGroup") as string
    const title = formData.get("title") as string
    const body = formData.get("body") as string
    const html = formData.get("html") as string
    const attachments = formData.getAll("attachments") as string[]
    const media_url = formData.get("media_url") as string
    const action_link = formData.get("action_link") as string

    if (!title || !body || !channel) {
        return { success: false, error: "Missing required fields." }
    }

    try {
        let targets: { id?: string, email: string, phone: string | null, push_token: string | null, display_name?: string | null }[] = []

        const targetType = formData.get("targetType") as string // "everyone", "group", "specific-user", "manual"
        const targetValue = formData.get("targetValue") as string

        if (targetType === "everyone") {
            const { data, error } = await supabase.from("users").select("id, email, phone, push_token, display_name")
            if (error) throw error
            targets = data || []
        } else if (targetType === "group") {
            const { data, error } = await supabase
                .from("user_group_members")
                .select("user_id, users(email, phone, push_token, display_name)")
                .eq("group_id", targetValue)
            if (error) throw error
            targets = data?.map((m: any) => ({
                id: m.user_id,
                email: m.users.email,
                phone: m.users.phone,
                push_token: m.users.push_token,
                display_name: m.users.display_name
            })) || []
        } else if (targetType === "specific-user") {
            const { data, error } = await supabase
                .from("users")
                .select("id, email, phone, push_token, display_name")
                .eq("id", targetValue)
                .single()
            if (error) throw error
            if (data) targets = [data]
        } else if (targetType === "manual") {
            const manualEmail = formData.get("manualEmail") as string
            const manualPhone = formData.get("manualPhone") as string
            targets = [{
                email: manualEmail,
                phone: manualPhone,
                push_token: null // Push requires a registered token, can't be manual unless we have it
            }]
        }

        if (targets.length === 0) {
            return { success: false, error: "No users found in the selected group." }
        }

        const parsePlaceholders = (text: string | null, target: any) => {
            if (!text) return text;
            const userName = target.display_name || target.email?.split('@')[0] || "User";
            const firstName = userName.split(' ')[0];

            return text
                .replace(/\{\{user\.name\}\}/g, userName)
                .replace(/\{\{user_name\}\}/g, userName)
                .replace(/\{\{first_name\}\}/g, firstName)
                .replace(/\{\{user\.email\}\}/g, target.email || "")
                .replace(/\{\{user_email\}\}/g, target.email || "")
                .replace(/\{\{app_name\}\}/g, "Vitaflix")
                .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
        };

        // Insert records into local DB
        const dbNotifications = targets.map(target => ({
            user_id: target.id || null,
            target: (channel === 'sms' ? target.phone : target.email) || null,
            title: parsePlaceholders(title, target)!,
            body: parsePlaceholders(body, target)!,
            html: parsePlaceholders(html, target) || null,
            attachments: attachments || [],
            channel: channel as any,
            media_url: media_url || null,
            metadata: action_link ? { action_link } : null,
            status: "pending" as any
        }))

        // We can't use .eq('user_id', ...) easily for manual targets if multiple exist, 
        // but for manual it's usually one or small batch.

        const { data: insertedRecords, error: insertError } = await supabase
            .from("notifications")
            .insert(dbNotifications)
            .select()

        if (insertError) throw insertError

        // External Delivery
        const sendPromises = dbNotifications.map(async (notif, index) => {
            const target = targets[index];
            let res: { success: boolean; error?: string } = { success: false, error: "Unknown channel" };

            if (channel === "email" && target.email) {
                const formattedAttachments = attachments.map(url => ({
                    filename: url.split('/').pop() || "attachment",
                    path: getMediaUrl(url)
                }));
                res = await sendEmail({ to: target.email, subject: notif.title, body: notif.body, html: notif.html || undefined, attachments: formattedAttachments });
            } else if (channel === "sms" && target.phone) {
                res = await sendSms({ to: target.phone, body: `${notif.title}\n\n${notif.body}` });
            } else if (channel === "push" && target.push_token) {
                res = await sendPush({ token: target.push_token, title: notif.title, body: notif.body, data: media_url ? { image: getMediaUrl(media_url) } : undefined });
            } else if (channel === "app" && target.id) {
                res = { success: true };
            }

            // Update status in DB using the inserted ID
            const recordId = (insertedRecords as any[])[index]?.id;
            if (recordId) {
                await supabase
                    .from("notifications")
                    .update({
                        status: res.success ? "sent" : "failed",
                        error_message: res.error || null
                    })
                    .eq("id", recordId)
            }
        });

        // We use Promise.allSettled to not fail the whole broadcast if one user fails
        await Promise.allSettled(sendPromises);

        revalidatePath("/notifications")
        return { success: true }
    } catch (error: any) {
        console.error("Broadcast Error:", error)
        return { success: false, error: error.message }
    }
}

// System Trigger Helper
// Call this from anywhere in your backend (e.g. after user signs up: triggerAppEvent('user_signup', { userId: auth.user.id }))
export async function triggerAppEvent(actionType: string, context: { userId: string, data?: Record<string, string> }) {
    const supabase = await createClient()

    try {
        const { data: trigger, error: triggerError } = await supabase
            .from("notification_triggers")
            .select("*")
            .eq("action_type", actionType)
            .eq("is_active", true)
            .single()

        if (triggerError || !trigger) {
            return
        }

        // Fetch user info for external channels
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("email, phone, push_token")
            .eq("id", context.userId)
            .single()

        if (userError || !user) {
            return
        }

        let title = trigger.title_template
        let body = trigger.body_template
        let html = trigger.html_template

        if (context.data) {
            Object.entries(context.data).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g')
                title = title.replace(regex, value)
                body = body.replace(regex, value)
                if (html) html = html.replace(regex, value)
            })
        }

        const sendPromises = trigger.channels.map(async (channel: string) => {
            // Log in DB first (as pending)
            const { data: notification, error: insertError } = await supabase
                .from("notifications")
                .insert([{
                    user_id: context.userId,
                    title,
                    body,
                    html: html || null,
                    channel: channel as any,
                    status: "pending" as any
                }])
                .select()
                .single()

            if (insertError) return

            let res: { success: boolean; error?: string } = { success: false };

            if (channel === "email") {
                const result = await sendEmail({ to: user.email, subject: title, body, html: html || undefined });
                res = { success: result.success, error: result.error };
            } else if (channel === "sms" && user.phone) {
                const result = await sendSms({ to: user.phone, body: `${title}\n\n${body}` });
                res = { success: result.success, error: result.error };
            } else if (channel === "push" && user.push_token) {
                const result = await sendPush({ token: user.push_token, title, body });
                res = { success: result.success, error: result.error };
            } else if (channel === "app") {
                res = { success: true };
            }

            // Update status
            const { error: updateError } = await supabase
                .from("notifications")
                .update({
                    status: res.success ? "sent" : "failed",
                    error_message: res.error || null
                })
                .eq("id", notification.id)
        })

        await Promise.allSettled(sendPromises);
        return true
    } catch (err) {
        console.error("Error evaluating trigger:", err)
        return false
    }
}

export async function saveGroupAction(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get("id") as string | null
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) return { success: false, error: "Name is required" }

    let groupId = id

    if (id) {
        // Update existing group
        const { error } = await supabase
            .from("user_groups")
            .update({ name, description })
            .eq("id", id)
        if (error) return { success: false, error: error.message }
    } else {
        // Insert new group
        const { data, error } = await supabase
            .from("user_groups")
            .insert([{ name, description }])
            .select("id")
            .single()
        if (error) return { success: false, error: error.message }
        groupId = data?.id
    }

    revalidatePath("/notifications")
    return { success: true, groupId }
}

export async function getGroupMembersAction(groupId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("user_group_members")
        .select("user_id")
        .eq("group_id", groupId)
    if (error) return { success: false, error: error.message, members: [] }
    return { success: true, members: (data || []).map((m: any) => m.user_id) }
}

export async function saveGroupMembersAction(groupId: string, userIds: string[]) {
    const supabase = await createClient()

    // Delete all existing members for this group
    const { error: deleteError } = await supabase
        .from("user_group_members")
        .delete()
        .eq("group_id", groupId)
    if (deleteError) return { success: false, error: deleteError.message }

    // Insert new members if any
    if (userIds.length > 0) {
        const rows = userIds.map((userId) => ({ group_id: groupId, user_id: userId }))
        const { error: insertError } = await supabase
            .from("user_group_members")
            .insert(rows)
        if (insertError) return { success: false, error: insertError.message }
    }

    revalidatePath("/notifications")
    return { success: true }
}

export async function saveTriggerAction(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get("name") as string
    const action_type = formData.get("action_type") as string
    const channels = formData.getAll("channels") as string[]
    const title_template = formData.get("title_template") as string
    const body_template = formData.get("body_template") as string
    const html_template = formData.get("html_template") as string

    if (!name || !action_type || !title_template || !body_template) {
        return { success: false, error: "Required fields missing" }
    }

    const { error } = await supabase.from("notification_triggers").insert([{
        name,
        action_type,
        channels: channels.length > 0 ? channels : ['app'],
        title_template,
        body_template,
        html_template: html_template || null,
        is_active: true
    }])

    if (error) return { success: false, error: error.message }

    revalidatePath("/notifications")
    return { success: true }
}

export async function retryNotificationAction(notificationId: string) {
    const supabase = await createClient()

    try {
        const { data: notification, error: fetchError } = await supabase
            .from("notifications")
            .select("*")
            .eq("id", notificationId)
            .single()

        if (fetchError || !notification) throw new Error("Notification not found")

        let targetEmail = notification.target
        let targetPhone = notification.target
        let pushToken = null

        if (notification.user_id) {
            const { data: user } = await supabase
                .from("users")
                .select("email, phone, push_token")
                .eq("id", notification.user_id)
                .single()
            if (user) {
                if (user.email) targetEmail = user.email
                if (user.phone) targetPhone = user.phone
                pushToken = user.push_token
            }
        }

        let res: { success: boolean; error?: string } = { success: false, error: "Unknown channel" };

        if (notification.channel === "email" && targetEmail) {
            const formattedAttachments = (notification.attachments as string[] || []).map(url => ({
                filename: url.split('/').pop() || "attachment",
                path: url
            }));
            res = await sendEmail({
                to: targetEmail,
                subject: notification.title,
                body: notification.body,
                html: notification.html || undefined,
                attachments: formattedAttachments
            });
        } else if (notification.channel === "sms" && targetPhone) {
            res = await sendSms({ to: targetPhone, body: `${notification.title}\n\n${notification.body}` });
        } else if (notification.channel === "push" && pushToken) {
            res = await sendPush({ token: pushToken, title: notification.title, body: notification.body });
        } else if (notification.channel === "app") {
            res = { success: true };
        }

        await supabase
            .from("notifications")
            .update({
                status: res.success ? "sent" : "failed",
                error_message: res.error || null,
                created_at: new Date().toISOString()
            })
            .eq("id", notificationId)

        revalidatePath("/notifications")
        return { success: res.success, error: res.error }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function uploadNotificationImageAction(formData: FormData) {
    const supabase = await createClient()
    const file = formData.get("file") as File

    if (!file) {
        return { success: false, error: "No file provided" }
    }

    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `notifications/${fileName}`

        const { data, error } = await supabase.storage
            .from("vitaflix")
            .upload(filePath, file)

        if (error) {
            // Check if bucket exists, if not maybe it's the issue
            if (error.message.includes("not found")) {
                return { success: false, error: "Storage bucket 'vitaflix' not found. Please ensure it is created in Supabase dashboard." }
            }
            throw error
        }

        const { data: { publicUrl } } = supabase.storage
            .from("vitaflix")
            .getPublicUrl(filePath)

        return { success: true, url: publicUrl }
    } catch (error: any) {
        console.error("Upload Error:", error)
        return { success: false, error: error.message }
    }
}
