'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyIncomeSchema } from '@/lib/validations/income'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertSuperAdmin() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await authClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') return { error: 'No autorizado', user: null }
  return { error: null, user }
}

export async function verifyIncomeRequest(incomeId: string, formData: FormData) {
  const { error: authError, user } = await assertSuperAdmin()
  if (authError || !user) return { error: authError ?? 'No autorizado' }

  const raw = {
    valor_real: formData.get('valor_real') as string,
    comision_rate: formData.get('comision_rate') as string,
    notas_admin: (formData.get('notas_admin') as string) || undefined,
  }

  const parsed = verifyIncomeSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos. Verifica el formulario.' }
  }

  const valorReal = parseFloat(parsed.data.valor_real.replace(/\./g, '').replace(',', '.'))
  const comisionRate = parseFloat(parsed.data.comision_rate) / 100

  const supabase = createServiceClient()
  const { data: updated, error } = await supabase
    .from('income_requests')
    .update({
      estado: 'verificado',
      valor_real: valorReal,
      comision_rate: comisionRate,
      verificado_por: user.id,
      verificado_at: new Date().toISOString(),
      notas_admin: parsed.data.notas_admin ?? null,
    })
    .eq('id', incomeId)
    .eq('estado', 'enviado')
    .select('id')

  if (error) return { error: 'Error al verificar. Intenta de nuevo.' }
  if (!updated || updated.length === 0) return { error: 'Esta solicitud ya fue procesada.' }

  revalidatePath('/superadmin/ingresos')
  return { success: true }
}

export async function rejectIncomeRequest(incomeId: string, formData: FormData) {
  const { error: authError, user } = await assertSuperAdmin()
  if (authError || !user) return { error: authError ?? 'No autorizado' }

  const notas = (formData.get('notas_admin') as string) || null

  const supabase = createServiceClient()
  const { data: updated, error } = await supabase
    .from('income_requests')
    .update({
      estado: 'rechazado',
      notas_admin: notas,
      verificado_por: user.id,
      verificado_at: new Date().toISOString(),
    })
    .eq('id', incomeId)
    .in('estado', ['enviado', 'verificado'])
    .select('id')

  if (error) return { error: 'Error al rechazar. Intenta de nuevo.' }
  if (!updated || updated.length === 0) return { error: 'Esta solicitud ya fue procesada.' }

  revalidatePath('/superadmin/ingresos')
  return { success: true }
}
