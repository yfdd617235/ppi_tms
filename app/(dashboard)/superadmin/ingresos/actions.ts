'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyIncomeSchema } from '@/lib/validations/income'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function verifyIncomeRequest(incomeId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    valor_real: formData.get('valor_real') as string,
    notas_admin: (formData.get('notas_admin') as string) || undefined,
  }

  const parsed = verifyIncomeSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos. Verifica el formulario.' }
  }

  const valorReal = parseFloat(parsed.data.valor_real.replace(/\./g, '').replace(',', '.'))

  const { error } = await supabase
    .from('income_requests')
    .update({
      estado: 'verificado',
      valor_real: valorReal,
      verificado_por: user.id,
      verificado_at: new Date().toISOString(),
      notas_admin: parsed.data.notas_admin ?? null,
    })
    .eq('id', incomeId)
    .eq('estado', 'enviado')

  if (error) return { error: 'Error al verificar. Intenta de nuevo.' }

  revalidatePath('/superadmin/ingresos')
  return { success: true }
}

export async function rejectIncomeRequest(incomeId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notas = (formData.get('notas_admin') as string) || null

  const { error } = await supabase
    .from('income_requests')
    .update({
      estado: 'rechazado',
      notas_admin: notas,
      verificado_por: user.id,
      verificado_at: new Date().toISOString(),
    })
    .eq('id', incomeId)
    .in('estado', ['enviado', 'verificado'])

  if (error) return { error: 'Error al rechazar. Intenta de nuevo.' }

  revalidatePath('/superadmin/ingresos')
  return { success: true }
}
