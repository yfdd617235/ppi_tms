import { z } from 'zod'

export const companySchema = z.object({
  razon_social: z.string().min(2, 'La razón social es requerida').max(200),
  nit: z.string().min(5, 'El NIT es requerido').max(20),
  direccion: z.string().max(300).optional(),
  correo: z.string().email('Correo electrónico inválido'),
  celular: z.string().max(20).optional(),
  nombre_representante_legal: z.string().max(200).optional(),
  nombre_contacto_operaciones: z.string().max(200).optional(),
  correo_contacto_operaciones: z.string().email().optional().or(z.literal('')),
  telefono_contacto_operaciones: z.string().max(20).optional(),
})

export type CompanyInput = z.infer<typeof companySchema>
