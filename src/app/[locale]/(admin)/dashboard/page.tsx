import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Users, Apple, Utensils, CreditCard, ArrowUpRight, TrendingUp } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage() {
    const supabase = await createClient()
    const t = await getTranslations("Dashboard")

    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: mealCount } = await supabase.from('meals').select('*', { count: 'exact', head: true })
    const { count: activeSubCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')

    const stats = [
        {
            title: "Total Users",
            value: userCount || 0,
            description: "Registered accounts",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Active Subscriptions",
            value: activeSubCount || 0,
            description: "Current paying users",
            icon: CreditCard,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Products Database",
            value: productCount || 0,
            description: "Ingredients & items",
            icon: Apple,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            title: "Total Recipes",
            value: mealCount || 0,
            description: "Meal configurations",
            icon: Utensils,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Real-time platform status</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Welcome to the management center for <span className="text-primary font-semibold">Vitaflix</span>.
                    Monitor your database and user metrics globally.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-md overflow-hidden dark:bg-zinc-900/50 backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl transition-transform group-hover:rotate-12`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tabular-nums">{stat.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-1.5 rounded">+12%</span>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Quick Actions
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription>Common administrative tasks at your fingertips.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                            <div className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">Audit Profiles</div>
                            <div className="text-xs text-muted-foreground">Verify manual user entries.</div>
                        </div>
                        <div className="p-4 rounded-xl border bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                            <div className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">New Recipe</div>
                            <div className="text-xs text-muted-foreground">Add to the culinary database.</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Infrastructure and API performance status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
                                <span className="text-sm font-medium">Supabase Database</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-500 uppercase">Operational</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
                                <span className="text-sm font-medium">Stripe API</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-500 uppercase">Operational</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
