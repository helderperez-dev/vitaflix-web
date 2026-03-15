import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Users, Apple, Utensils, CreditCard, Activity, Target, PieChart as PieChartIcon, TrendingUp, History, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import { GrowthChart, GrowthData } from "./_components/growth-chart"
import { LeadsFunnelChart, FunnelData } from "./_components/leads-funnel-chart"
import { MealsDistributionChart, MealsData } from "./_components/meals-distribution-chart"
import { RecentLeadsList } from "./_components/recent-leads-list"
import { RecentUsersList } from "./_components/recent-users-list"

export default async function DashboardPage({ params }: { params: { locale: string } }) {
    const { locale } = await params
    const supabase = await createClient()
    const t = await getTranslations("Dashboard")

    // Async fetches for data
    const [
        { count: userCount },
        { count: productCount },
        { count: mealCount },
        { count: activeSubCount },
        { data: funnels },
        { data: leadsDataFetch },
        { data: allMeals },
        { data: rawRecentUsers },
        { data: rawRecentLeads }
    ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('meals').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('lead_funnels').select('id, name'),
        supabase.from('leads').select('funnel_id'),
        supabase.from('meals').select('is_public'),
        supabase.from('users').select('id, full_name, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('id, name, created_at, source').order('created_at', { ascending: false }).limit(5)
    ])

    const stats = [
        {
            title: t("activeUsers"),
            value: userCount || 0,
            icon: Users,
            trend: "+12.5%",
            color: "text-primary",
            bg: "bg-primary/5"
        },
        {
            title: t("activeSubs"),
            value: activeSubCount || 0,
            icon: CreditCard,
            trend: "+5.2%",
            color: "text-primary",
            bg: "bg-primary/5"
        },
        {
            title: t("products"),
            value: productCount || 0,
            icon: Apple,
            trend: "+18%",
            color: "text-primary",
            bg: "bg-primary/5"
        },
        {
            title: t("meals"),
            value: mealCount || 0,
            icon: Utensils,
            trend: "+24%",
            color: "text-primary",
            bg: "bg-primary/5"
        }
    ]

    // Aggregates for chart
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const startDateStr = fourteenDaysAgo.toISOString()

    const { data: chartUsersRaw } = await supabase.from('users').select('created_at').gte('created_at', startDateStr)
    const { data: chartLeadsRaw } = await supabase.from('leads').select('created_at').gte('created_at', startDateStr)

    const userGrowthMap = new Map<string, number>()
    const leadGrowthMap = new Map<string, number>()

    for (let i = 0; i <= 14; i++) {
        const d = new Date(fourteenDaysAgo)
        d.setDate(d.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        userGrowthMap.set(dateStr, 0)
        leadGrowthMap.set(dateStr, 0)
    }

    chartUsersRaw?.forEach(u => {
        if (!u.created_at) return
        const dateStr = new Date(u.created_at).toISOString().split('T')[0]
        if (userGrowthMap.has(dateStr)) userGrowthMap.set(dateStr, userGrowthMap.get(dateStr)! + 1)
    })
    chartLeadsRaw?.forEach(l => {
        const dateStr = new Date(l.created_at).toISOString().split('T')[0]
        if (leadGrowthMap.has(dateStr)) leadGrowthMap.set(dateStr, leadGrowthMap.get(dateStr)! + 1)
    })

    const userGrowthData: GrowthData[] = Array.from(userGrowthMap.entries()).map(([date, value]) => ({ date, value }))
    const leadGrowthData: GrowthData[] = Array.from(leadGrowthMap.entries()).map(([date, value]) => ({ date, value }))

    // Formatted Chart Data (Funnels)
    const leadsFunnelData: FunnelData[] = (funnels || []).map((f) => ({
        funnel: f.name || t("defaultFunnel"),
        count: leadsDataFetch?.filter(l => l.funnel_id === f.id).length || 0
    }))
    const unassignedCount = leadsDataFetch?.filter(l => !l.funnel_id).length || 0
    if (unassignedCount > 0) leadsFunnelData.push({ funnel: t("unassigned"), count: unassignedCount })
    leadsFunnelData.sort((a, b) => b.count - a.count)

    const mealsData: MealsData[] = [
        { category: t("publicItems"), count: allMeals?.filter(m => m.is_public).length || 0, fill: "oklch(0.61 0.13 168)" },
        { category: t("draftItems"), count: allMeals?.filter(m => !m.is_public).length || 0, fill: "oklch(0.24 0.05 240)" }
    ]

    return (
        <div className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 pb-12">

                {/* Header Stats Grid */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="border-border/60 bg-card shadow-none min-h-[70px] flex flex-col justify-center">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 px-4">
                                <CardTitle className="text-[11px] font-semibold text-muted-foreground/80 tracking-tight">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn("p-1 rounded-sm bg-primary/5 text-primary/70 border border-primary/5")}>
                                    <stat.icon className="h-3 w-3" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-3 pt-0">
                                <div className="text-lg font-bold tracking-tight tabular-nums flex items-center justify-between">
                                    {stat.value}
                                    <div className="flex items-center gap-0.5 text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-lg border border-primary/10 tracking-tight">
                                        <TrendingUp className="h-2 w-2" />
                                        {stat.trend}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Primary Visualization - Growth Trends (Split) */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/60 bg-card shadow-none overflow-hidden">
                        <CardHeader className="border-b border-border/50 py-2 px-6 bg-muted/3">
                            <CardTitle className="text-[12px] font-bold flex items-center gap-2 text-foreground/90">
                                {t("userGrowth")}
                                <Activity className="h-3 w-3 text-primary/40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-6">
                            <GrowthChart id="user-growth" data={userGrowthData} color="oklch(0.61 0.13 168)" locale={locale} />
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card shadow-none overflow-hidden">
                        <CardHeader className="border-b border-border/50 py-2 px-6 bg-muted/3">
                            <CardTitle className="text-[12px] font-bold flex items-center gap-2 text-foreground/90">
                                {t("leadVolume")}
                                <TrendingUp className="h-3 w-3 text-primary/40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-6">
                            <GrowthChart id="lead-volume" data={leadGrowthData} color="oklch(0.24 0.05 240)" locale={locale} />
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Visualization - Distribution */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/60 bg-card shadow-none overflow-hidden">
                        <CardHeader className="border-b border-border/50 py-2 px-6 bg-muted/3">
                            <CardTitle className="text-[12px] font-bold flex items-center gap-2 text-foreground/90">
                                {t("leadFunnels")}
                                <Target className="h-3 w-3 text-primary/40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 overflow-hidden">
                            <LeadsFunnelChart data={leadsFunnelData} title="" description="" />
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card shadow-none overflow-hidden">
                        <CardHeader className="border-b border-border/50 py-2 px-6 bg-muted/3">
                            <CardTitle className="text-[12px] font-bold flex items-center gap-2 text-foreground/90">
                                {t("mealCatalog")}
                                <PieChartIcon className="h-3 w-3 text-primary/40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 flex justify-center items-center overflow-hidden">
                            <MealsDistributionChart data={mealsData} title="" description="" />
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row - Additional Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/60 bg-card shadow-none overflow-hidden">
                        <CardHeader className="border-b border-border/50 py-2 px-6 bg-muted/3">
                            <CardTitle className="text-[12px] font-bold flex items-center gap-2 text-foreground/90">
                                {t("recentLeads")}
                                <History className="h-3 w-3 text-primary/40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <RecentLeadsList
                                leads={rawRecentLeads || []}
                                locale={locale}
                                emptyText={t("noRecentLeads")}
                                directLabel={t("direct")}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card shadow-none overflow-hidden">
                        <CardHeader className="border-b border-border/50 py-2 px-6 bg-muted/3">
                            <CardTitle className="text-[12px] font-bold flex items-center gap-2 text-foreground/90">
                                {t("latestRegistrations")}
                                <ListChecks className="h-3 w-3 text-primary/40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <RecentUsersList users={rawRecentUsers || []} locale={locale} emptyText={t("noRecentUsers")} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
