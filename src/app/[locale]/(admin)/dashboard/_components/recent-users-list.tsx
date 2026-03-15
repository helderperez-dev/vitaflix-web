import { formatDistanceToNow } from "date-fns"
import { ptBR, enUS, es } from "date-fns/locale"
import { Mail, CheckCircle2, Clock } from "lucide-react"

interface UserItem {
    id: string
    full_name: string | null
    email: string
    created_at: string
}

interface RecentUsersListProps {
    users: UserItem[]
    locale: string
    emptyText: string
}

const localesMap: Record<string, any> = {
    "pt-br": ptBR,
    "pt-pt": ptBR,
    "en": enUS,
    "es": es,
}

export function RecentUsersList({ users, locale, emptyText }: RecentUsersListProps) {
    const dateLocale = localesMap[locale] || enUS

    return (
        <div className="space-y-3">
            {users.length === 0 ? (
                <div className="text-[11px] text-muted-foreground py-4 text-center">{emptyText}</div>
            ) : (
                users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-sm bg-primary/5 flex items-center justify-center text-primary/60 border border-primary/5">
                                <Mail className="h-3 w-3" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground/80 leading-tight truncate max-w-[120px]">
                                    {user.full_name || user.email.split('@')[0]}
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 leading-tight">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-2.5 w-2.5 text-primary/30" />
                            <div className="text-[9px] font-medium text-muted-foreground/40 tabular-nums">
                                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: dateLocale })}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
