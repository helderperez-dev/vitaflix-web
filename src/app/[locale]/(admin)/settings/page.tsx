import { LocaleSetting } from "@/components/settings/locale-setting"
import { getDefaultLocale } from "@/app/actions/settings"
import { Settings, ShieldCheck, Database, Globe } from "lucide-react"

export default async function SettingsPage() {
    const defaultLocale = await getDefaultLocale()

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Control Center</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">Settings</h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                    Manage the core identity and behavior of the <span className="text-primary font-bold">Vitaflix</span> platform.
                    Configure global constants and user replication rules.
                </p>
            </div>

            <div className="grid gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-5 h-5" />
                        <h2 className="text-lg font-bold tracking-tight uppercase">Internationalization</h2>
                    </div>
                    <LocaleSetting initialLocale={defaultLocale} />
                </div>

                <div className="space-y-4 opacity-70 cursor-not-allowed">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="w-5 h-5" />
                        <h2 className="text-lg font-bold tracking-tight uppercase">Infrastructure</h2>
                    </div>
                    <div className="p-8 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                            <Database className="w-8 h-8 text-muted-foreground/60" />
                        </div>
                        <span className="font-bold text-muted-foreground">Stripe & Auth hooks disabled</span>
                        <span className="text-sm text-muted-foreground/60">Managed natively by platform admin.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
