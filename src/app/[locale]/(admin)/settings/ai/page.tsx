import { getAIPrompts } from "@/app/actions/ai-settings"
import AISettingsClient from "./_components/ai-settings-client"

export default async function AISettingsPage() {
    const prompts = await getAIPrompts()
    return <AISettingsClient prompts={prompts} />
}
