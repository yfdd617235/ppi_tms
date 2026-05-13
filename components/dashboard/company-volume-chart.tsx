'use client'

import { Treemap, Tooltip } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

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

interface ContentProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  value?: number
  index?: number
  colors: string[]
  total: number
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', value = 0, index = 0, colors, total }: ContentProps) {
  const fill = colors[index % colors.length]
  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0'
  const showLabel = width > 70 && height > 36
  const showPct = width > 50 && height > 22

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" strokeWidth={2} rx={4} />
      {showLabel && (
        <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>
          {name.length > 14 ? name.substring(0, 13) + '…' : name}
        </text>
      )}
      {showPct && (
        <text x={x + width / 2} y={y + height / 2 + (showLabel ? 10 : 6)} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={11}>
          {pct}%
        </text>
      )}
    </g>
  )
}

export function CompanyVolumeChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Sin datos en el período</div>
  }
  const total = data.reduce((s, d) => s + d.valor, 0)
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <Treemap
        data={data}
        dataKey="valor"
        nameKey="empresa"
        aspectRatio={4 / 3}
        content={(props: unknown) => {
          const p = props as ContentProps
          return <CustomContent {...p} colors={COLORS} total={total} />
        }}
      >
        <Tooltip
          formatter={(value: number) => [`$${(value / 1_000_000).toFixed(2)}M`, 'Custodia neta']}
        />
      </Treemap>
    </ChartContainer>
  )
}
