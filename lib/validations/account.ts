import { z } from 'zod'

export const accountSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la cuenta es obligatorio'),
  nombre_banco: z.string().min(1, 'El banco es obligatorio'),
  numero_cuenta: z.string().min(1, 'El número de cuenta es obligatorio'),
  tipo_cuenta: z.enum(['corriente', 'ahorros'], {
    required_error: 'Selecciona el tipo de cuenta',
  }),
  descripcion: z.string().optional(),
})

export type AccountFormValues = z.infer<typeof accountSchema>
