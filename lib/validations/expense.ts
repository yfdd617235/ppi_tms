import { z } from 'zod'

export const expenseRequestSchema = z
  .object({
    account_id: z.string().uuid('Selecciona una cuenta válida'),
    valor: z
      .string()
      .min(1, 'El valor es requerido')
      .refine((v) => !isNaN(parseFloat(v.replace(/[^0-9.]/g, ''))) && parseFloat(v.replace(/[^0-9.]/g, '')) > 0, {
        message: 'Ingresa un valor numérico mayor a 0',
      }),
    tipo_pago: z.enum(['cheque', 'transferencia', 'efectivo'], { message: 'Selecciona el tipo de pago' }),
    descripcion: z.string().max(500).optional(),
    programacion: z.enum(['inmediato', 'programado', 'discrecion'], { message: 'Selecciona el tipo de programación' }),
    fecha_programada: z.string().optional(),
    // Beneficiario existente o nuevo
    beneficiary_id: z.string().uuid().optional(),
    nuevo_beneficiario_nombre: z.string().min(2).optional(),
    nuevo_beneficiario_cedula_nit: z.string().min(5).optional(),
    nuevo_beneficiario_entidad: z.string().optional(),
    nuevo_beneficiario_tipo_cuenta: z.enum(['ahorros', 'corriente', 'nequi', 'daviplata', 'otro']).optional(),
    nuevo_beneficiario_numero_cuenta: z.string().optional(),
    nuevo_beneficiario_punto_entrega: z.string().max(200).optional(),
    guardar_beneficiario: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.programacion === 'programado' && !data.fecha_programada) return false
      return true
    },
    { message: 'La fecha programada es obligatoria si eliges "Programado"', path: ['fecha_programada'] }
  )
  .refine(
    (data) => data.beneficiary_id || (data.nuevo_beneficiario_nombre && data.nuevo_beneficiario_cedula_nit),
    { message: 'Selecciona un beneficiario existente o completa los datos del nuevo beneficiario', path: ['beneficiary_id'] }
  )
  .refine(
    (data) => {
      if (data.tipo_pago === 'transferencia' && !data.beneficiary_id) {
        return !!(data.nuevo_beneficiario_entidad && data.nuevo_beneficiario_tipo_cuenta && data.nuevo_beneficiario_numero_cuenta)
      }
      return true
    },
    { message: 'Para transferencias se requieren los datos bancarios', path: ['nuevo_beneficiario_entidad'] }
  )
  .refine(
    (data) => {
      if (data.tipo_pago === 'efectivo' && !data.beneficiary_id) {
        return !!data.nuevo_beneficiario_punto_entrega
      }
      return true
    },
    { message: 'El punto de entrega es requerido para pagos en efectivo', path: ['nuevo_beneficiario_punto_entrega'] }
  )

export const executeExpenseSchema = z.object({
  notas_admin: z.string().max(500).optional(),
})

export type ExpenseRequestInput = z.infer<typeof expenseRequestSchema>
export type ExecuteExpenseInput = z.infer<typeof executeExpenseSchema>
