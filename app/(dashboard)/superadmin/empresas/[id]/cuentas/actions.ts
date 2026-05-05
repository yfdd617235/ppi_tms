'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/login')
  return { supabase }
}

export async function assignAccount(empresaId: string, accountId: string) {
  const { supabase } = await assertSuperAdmin()

  const { error } = await supabase.from('company_accounts').insert({
    company_id: empresaId,
    account_id: accountId,
  })

  if (error) return { error: 'Error al asignar la cuenta.' }

  revalidatePath(`/superadmin/empresas/${empresaId}`)
}

export async function unassignAccount(empresaId: string, accountId: string) {
  const { supabase } = await assertSuperAdmin()

  const { error } = await supabase
    .from('company_accounts')
    .delete()
    .eq('company_id', empresaId)
    .eq('account_id', accountId)

  if (error) return { error: 'Error al desasignar la cuenta.' }

  revalidatePath(`/superadmin/empresas/${empresaId}`)
}

export async function toggleCompanyAccountDiscrecion(
  empresaId: string,
  accountId: string,
  currentValue: boolean,
) {
  const { supabase } = await assertSuperAdmin()

  const { error } = await supabase
    .from('company_accounts')
    .update({ egreso_a_discrecion: !currentValue })
    .eq('company_id', empresaId)
    .eq('account_id', accountId)

  if (error) return { error: 'Error al actualizar la configuración.' }

  revalidatePath(`/superadmin/empresas/${empresaId}`)
}
