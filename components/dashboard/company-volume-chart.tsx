'use client'

import { Pie, PieChart, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface Props {
  data: { empresa: string; valor: number }[]
}

const COLORS = [
  'oklch(0.497 0.115 143.6)',
  'oklch(0.65 0.15 250)',
  'oklch(0.65 0.15 25)',
  'oklch(0.65 0.15 55)',
  'oklch(0.65 0.15 300)',
  'oklch(0.65 0.15 190)',
]

const chartConfig = Object.fromEntries(
  Array.from({ length: 6 }, (_, i) => [`empresa_${i}`, { label: `Empresa ${i + 1}`, color: COLORS[i] }])
)

export function CompanyVolumeChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Sin datos en el período</div>
  }
  const total = data.reduce((s, d) => s + d.valor, 0)
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <PieChart>
        <Pie
          data={data}
          dataKey="valor"
          nameKey="empresa"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ empresa, valor }) => `${empresa.substring(0, 10)}: ${((valor / total) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`$${(value / 1_000_000).toFixed(2)}M`, 'Custodia neta']}
        />
      </PieChart>
    </ChartContainer>
  )
}
