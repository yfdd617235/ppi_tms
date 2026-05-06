export const PPI_COMMISSION_RATE = 0.008  // 0.8%
export const TAX_4X1000_RATE = 0.004     // 0.4%

export interface ComisionesResult {
  comisionPPI: number
  impuesto4x1000: number
  valorNeto: number
}

export function calcularComisiones(valorReal: number, comisionRate = PPI_COMMISSION_RATE): ComisionesResult {
  const comisionPPI = valorReal * comisionRate
  const impuesto4x1000 = valorReal * TAX_4X1000_RATE
  const valorNeto = valorReal - comisionPPI - impuesto4x1000
  return { comisionPPI, impuesto4x1000, valorNeto }
}
