import { LocaleSetting } from "@/components/settings/locale-setting"
import { getDefaultLocale } from "@/app/actions/settings"
import { Settings, ShieldCheck, Database, Globe, CalendarRange } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DayConfigManager } from "@/components/plans/day-config-manager"

export default async function SettingsPage() {
    const defaultLocale = await getDefaultLocale()

    return (
        <div className="h-full overflow-y-auto p-8 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto space-y-10">
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

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-8">
                        <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all">
                            <Settings className="w-4 h-4 mr-2 inline-block opacity-50" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all">
                            <CalendarRange className="w-4 h-4 mr-2 inline-block opacity-50" />
                            Plans Setup
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="focus-visible:outline-none focus-visible:ring-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                            <div className="p-8 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-2 bg-muted/5">
                                <div className="p-3 bg-muted rounded-full">
                                    <Database className="w-8 h-8 text-muted-foreground/60" />
                                </div>
                                <span className="font-bold text-muted-foreground">Stripe & Auth hooks disabled</span>
                                <span className="text-sm text-muted-foreground/60">Managed natively by platform admin.</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="plans" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarRange className="w-5 h-5" />
                                <h2 className="text-lg font-bold tracking-tight uppercase">Plan System Settings</h2>
                            </div>
                            <p className="text-muted-foreground text-sm">Define how many meals users can select and categorize their daily sequence.</p>
                        </div>
                        <div className="grid gap-8">
                            <DayConfigManager />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
