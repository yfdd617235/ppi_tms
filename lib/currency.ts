const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCOP(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'
  return formatter.format(num)
}

export function parseCOP(value: string): number {
  const cleaned = value.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
