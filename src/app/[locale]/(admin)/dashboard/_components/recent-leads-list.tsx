import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR, enUS, es } from "date-fns/locale"
import { User } from "lucide-react"

interface Lead {
    id: string
    name: string
    created_at: string
    source: string | null
}

interface RecentLeadsListProps {
    leads: Lead[]
    locale: string
}

const localesMap: Record<string, any> = {
    "pt-br": ptBR,
    "pt-pt": ptBR,
    "en": enUS,
    "es": es,
}

export function RecentLeadsList({ leads, locale }: RecentLeadsListProps) {
    const dateLocale = localesMap[locale] || enUS

    return (
        <div className="space-y-3">
            {leads.length === 0 ? (
                <div className="text-[11px] text-muted-foreground py-4 text-center">No recent leads</div>
            ) : (
                leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60 border border-primary/5">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground/80 leading-tight truncate max-w-[120px]">
                                    {lead.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 leading-tight">
                                    {lead.source || "Direct"}
                                </span>
                            </div>
                        </div>
                        <div className="text-[9px] font-medium text-muted-foreground/40 tabular-nums">
                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: dateLocale })}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
