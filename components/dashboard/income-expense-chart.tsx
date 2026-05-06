'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface Props {
  data: { mes: string; ingresos: number; egresos: number }[]
  interval?: number
}

const chartConfig = {
  ingresos: { label: 'Ingresos', color: 'oklch(0.497 0.115 143.6)' },
  egresos:  { label: 'Egresos',  color: 'oklch(0.65 0.15 25)' },
}

export function IncomeExpenseChart({ data, interval = 0 }: Props) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Sin datos en el período</div>
  }
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} interval={interval} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} width={56} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="ingresos" fill={chartConfig.ingresos.color} radius={[3, 3, 0, 0]} />
        <Bar dataKey="egresos"  fill={chartConfig.egresos.color}  radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
