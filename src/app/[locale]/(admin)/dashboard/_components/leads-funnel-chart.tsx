"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export type FunnelData = {
    funnel: string
    count: number
    fill?: string
}

interface LeadsFunnelChartProps {
    data: FunnelData[]
    title: string
    description: string
}

const chartConfig = {
    count: {
        label: "Leads",
        color: "oklch(0.61 0.13 168)", // Brand Primary
    },
} satisfies ChartConfig

export function LeadsFunnelChart({ data, title, description }: LeadsFunnelChartProps) {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 min-h-[160px] -ml-4">
                <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            accessibilityLayer
                            data={data}
                            layout="vertical"
                            margin={{ right: 40, left: 0 }}
                        >
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="var(--color-count)" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid horizontal={false} stroke="hsl(var(--muted-foreground)/0.1)" strokeDasharray="4 4" />
                            <YAxis
                                dataKey="funnel"
                                type="category"
                                tickLine={false}
                                tickMargin={12}
                                axisLine={false}
                                style={{ fontSize: '10px', fontWeight: 600, fill: 'hsl(var(--muted-foreground)/0.6)' }}
                                width={90}
                            />
                            <XAxis dataKey="count" type="number" hide />
                            <ChartTooltip
                                cursor={{ fill: 'hsl(var(--muted-foreground)/0.05)' }}
                                content={<ChartTooltipContent indicator="line" className="bg-popover border-border/50" />}
                            />
                            <Bar
                                dataKey="count"
                                layout="vertical"
                                fill="url(#barGradient)"
                                radius={[0, 6, 6, 0]}
                                barSize={20}
                            >
                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    offset={12}
                                    className="fill-foreground/80 font-bold text-[10px]"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    )
}
