import { z } from 'zod'

export const incomeRequestSchema = z.object({
  account_id: z.string().uuid('Selecciona una cuenta válida'),
  valor_cliente: z
    .string()
    .min(1, 'El valor es requerido')
    .refine((v) => !isNaN(parseFloat(v.replace(/[^0-9.]/g, ''))) && parseFloat(v.replace(/[^0-9.]/g, '')) > 0, {
      message: 'Ingresa un valor numérico mayor a 0',
    }),
  descripcion: z.string().max(500).optional(),
})

export const verifyIncomeSchema = z.object({
  valor_real: z
    .string()
    .min(1, 'El valor real es requerido')
    .refine((v) => !isNaN(parseFloat(v.replace(/[^0-9.]/g, ''))) && parseFloat(v.replace(/[^0-9.]/g, '')) > 0, {
      message: 'Ingresa un valor numérico mayor a 0',
    }),
  notas_admin: z.string().max(500).optional(),
})

export type IncomeRequestInput = z.infer<typeof incomeRequestSchema>
export type VerifyIncomeInput = z.infer<typeof verifyIncomeSchema>
