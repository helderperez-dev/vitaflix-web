
import { DictionaryManager } from "@/components/settings/dictionary-manager"

export default function SystemHubPage() {
    return (
        <div className="h-full flex flex-col pt-0 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-background">
                <DictionaryManager />
            </div>
        </div>
    )
}
