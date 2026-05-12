import { z } from 'zod'

export const beneficiarySchema = z
  .object({
    tipo: z.enum(['cheque', 'transferencia', 'efectivo'], { message: 'Selecciona el tipo de beneficiario' }),
    nombre: z.string().min(2, 'El nombre es requerido').max(200),
    cedula_nit: z.string().min(5, 'Cédula o NIT requerido').max(20),
    entidad_financiera: z.string().max(100).optional(),
    tipo_cuenta: z.enum(['ahorros', 'corriente', 'nequi', 'daviplata', 'otro']).optional(),
    numero_cuenta: z.string().max(30).optional(),
    punto_entrega: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      if (data.tipo === 'transferencia') {
        return !!(data.entidad_financiera && data.tipo_cuenta && data.numero_cuenta)
      }
      return true
    },
    { message: 'Para transferencias se requieren entidad, tipo y número de cuenta', path: ['entidad_financiera'] }
  )
  .refine(
    (data) => {
      if (data.tipo === 'efectivo') {
        return !!data.punto_entrega
      }
      return true
    },
    { message: 'El punto de entrega es requerido para pagos en efectivo', path: ['punto_entrega'] }
  )

export type BeneficiaryInput = z.infer<typeof beneficiarySchema>
