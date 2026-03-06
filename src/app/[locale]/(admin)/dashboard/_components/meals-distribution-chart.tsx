"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export type MealsData = {
    category: string
    count: number
    fill: string
}

interface MealsDistributionChartProps {
    data: MealsData[]
    title: string
    description: string
}

const chartConfig = {
    count: {
        label: "Meals",
    },
} satisfies ChartConfig

export function MealsDistributionChart({ data, title, description }: MealsDistributionChartProps) {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 min-h-[160px]">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[160px]">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel className="bg-popover border-border/50" />}
                        />
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="category"
                            innerRadius={45}
                            outerRadius={65}
                            strokeWidth={4}
                            stroke="hsl(var(--background))"
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            iconSize={6}
                            wrapperStyle={{
                                fontSize: '9px',
                                fontWeight: 600,
                                paddingTop: '10px',
                                opacity: 0.8
                            }}
                        />
                    </PieChart>
                </ChartContainer>
            </div>
        </div>
    )
}
