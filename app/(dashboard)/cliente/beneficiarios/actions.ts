'use server'

import { createClient } from '@/lib/supabase/server'
import { beneficiarySchema } from '@/lib/validations/beneficiary'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBeneficiary(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    tipo: formData.get('tipo') as string,
    nombre: formData.get('nombre') as string,
    cedula_nit: formData.get('cedula_nit') as string,
    entidad_financiera: (formData.get('entidad_financiera') as string) || undefined,
    tipo_cuenta: (formData.get('tipo_cuenta') as string) || undefined,
    numero_cuenta: (formData.get('numero_cuenta') as string) || undefined,
  }

  const parsed = beneficiarySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) return { error: 'No tienes empresa asignada.' }

  const { error: insertError } = await supabase.from('beneficiaries').insert({
    company_id: profile.company_id,
    tipo: parsed.data.tipo,
    nombre: parsed.data.nombre,
    cedula_nit: parsed.data.cedula_nit,
    entidad_financiera: parsed.data.entidad_financiera ?? null,
    tipo_cuenta: parsed.data.tipo_cuenta ?? null,
    numero_cuenta: parsed.data.numero_cuenta ?? null,
  })

  if (insertError) return { error: 'Error al guardar el beneficiario. Intenta de nuevo.' }

  revalidatePath('/cliente/beneficiarios')
  redirect('/cliente/beneficiarios')
}

export async function deactivateBeneficiary(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) return { error: 'No tienes empresa asignada.' }

  const { error } = await supabase
    .from('beneficiaries')
    .update({ activo: false })
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) return { error: 'Error al eliminar el beneficiario.' }

  revalidatePath('/cliente/beneficiarios')
  return {}
}
