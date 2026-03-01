import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Users, Apple, Utensils, CreditCard, Activity, CheckCircle2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
    const supabase = await createClient()
    const t = await getTranslations("Dashboard")

    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: mealCount } = await supabase.from('meals').select('*', { count: 'exact', head: true })
    const { count: activeSubCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')

    const stats = [
        {
            title: t("activeUsers"),
            value: userCount || 0,
            description: "Registered & Verified",
            icon: Users,
            trend: "+12.5%",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: t("activeSubs"),
            value: activeSubCount || 0,
            description: "Revenue Generating",
            icon: CreditCard,
            trend: "+5.2%",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            title: t("inventory"),
            value: productCount || 0,
            description: "Items in library",
            icon: Apple,
            trend: "+18%",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: t("recipes"),
            value: mealCount || 0,
            description: "Culinary collection",
            icon: Utensils,
            trend: "+24%",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ]

    return (
        <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
            {/* Content area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 pb-12">
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <Card key={stat.title}
                            className="relative overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-300 flex items-center justify-center", stat.bg, stat.color)}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight tabular-nums flex items-baseline gap-2">
                                    {stat.value}
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.25 rounded-full inline-flex tracking-tight">
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-1 opacity-70">
                                    {stat.description}
                                </p>
                            </CardContent>
                            <div className={cn("absolute bottom-0 left-0 h-0.5 transition-all duration-500 w-0 group-hover:w-full", stat.color.replace('text-', 'bg-'))} />
                        </Card>
                    ))}
                </div>

                {/* Main Content Sections */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Activity Visualization */}
                    <Card className="lg:col-span-2 border-border/40 shadow-sm overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/20 pb-4 bg-muted/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        Analytics
                                        <Activity className="h-4 w-4 text-primary" />
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/40">{t("engagementIndex")}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-1.5 overflow-hidden p-1">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted border border-border/40" />
                                        ))}
                                    </div>
                                    <div className="h-4 w-px bg-border/40 mx-1" />
                                    <button className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline">{t("viewReport")}</button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[280px] flex items-end justify-between p-8 pt-12 relative">
                            <div className="absolute inset-0 bg-grid-slate-200/[0.03] [mask-image:radial-gradient(white,transparent)] pointer-events-none" />
                            {Array.from({ length: 14 }).map((_, i) => {
                                const height = 15 + Math.random() * 75;
                                return (
                                    <div key={i} className="group relative flex flex-col items-center flex-1 mx-1 lg:mx-2 h-full justify-end">
                                        <div
                                            className="w-full bg-primary/10 group-hover:bg-primary/25 rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative overflow-hidden ring-1 ring-primary/20 ring-inset"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute inset-x-0 top-0 h-1 bg-primary/40 group-hover:bg-primary/60 transition-colors" />
                                        </div>
                                        <div className="mt-4 text-[9px] font-bold text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">D{i + 1}</div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>

                    {/* Sidebar Components */}
                    <div className="space-y-6">
                        {/* System Health Status */}
                        <Card className="border-border/40 shadow-md bg-secondary text-secondary-foreground relative group overflow-hidden border-none shadow-secondary/20">
                            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                <ShieldCheck className="h-24 w-24" />
                            </div>
                            <CardHeader className="pb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{t("systemIntegrity")}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 relative z-10">
                                {[
                                    { name: "Database Cluster", status: "Nominal" },
                                    { name: "Edge Network", status: "Optimal" },
                                    { name: "API Gateway", status: "Nominal" }
                                ].map((s) => (
                                    <div key={s.name} className="flex justify-between items-center bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:bg-white/[0.07] transition-all group/item">
                                        <span className="text-[11px] font-semibold tracking-tight opacity-80 group-hover/item:opacity-100">{s.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(19,165,126,0.8)]" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/90">{s.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Action Area */}
                        <Card className="border-border/30 bg-card rounded-2xl overflow-hidden border-dashed border-2 p-1 group hover:border-primary/30 transition-colors">
                            <div className="bg-muted/30 rounded-[0.9rem] p-6 text-center space-y-5 group-hover:bg-muted/50 transition-all">
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">Administrative Duty</p>
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("maintenanceMode")}</CardTitle>
                                </div>
                                <button className="w-full bg-foreground text-background dark:bg-primary dark:text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/20">
                                    {t("deployScan")}
                                </button>
                                <p className="text-[9px] text-muted-foreground/50 font-medium italic">{t("nextScan")}</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

