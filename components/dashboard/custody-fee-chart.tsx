'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface Props {
  data: { mes: string; tarifa: number }[]
  interval?: number
}

const chartConfig = {
  tarifa: { label: 'Tarifa custodia', color: 'oklch(0.497 0.115 143.6)' },
}

export function CustodyFeeChart({ data, interval = 0 }: Props) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Sin datos en el período</div>
  }
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} interval={interval} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1_000).toFixed(0)}K`} width={56} />
        <Tooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="tarifa"
          stroke={chartConfig.tarifa.color}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
