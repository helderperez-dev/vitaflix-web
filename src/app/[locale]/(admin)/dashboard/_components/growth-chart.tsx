"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export type GrowthData = {
    date: string
    value: number
}

interface GrowthChartProps {
    id: string
    data: GrowthData[]
    color?: string
    locale: string
}

const chartConfig = {
    value: {
        label: "Total",
    },
} satisfies ChartConfig

export function GrowthChart({ id, data, color = "var(--color-value)", locale }: GrowthChartProps) {
    const gradientId = `fill-${id}`

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 min-h-[160px] -ml-6">
                <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={10}
                                tickFormatter={(str) => {
                                    const date = new Date(str)
                                    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
                                }}
                                style={{ fontSize: '9px', fontWeight: 500, fill: 'hsl(var(--muted-foreground)/0.4)' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                domain={[0, "dataMax"]}
                                style={{ fontSize: '9px', fontWeight: 500, fill: 'hsl(var(--muted-foreground)/0.4)' }}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" className="bg-popover border-border/50" />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                animationBegin={0}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    )
}
