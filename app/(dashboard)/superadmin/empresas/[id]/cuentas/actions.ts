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

export async function createAndAssignAccount(
  empresaId: string,
  data: { nombre: string; descripcion: string; egreso_a_discrecion: boolean }
) {
  const { supabase } = await assertSuperAdmin()

  // 1. Crear cuenta global
  const { data: newAccount, error: accError } = await supabase
    .from('accounts')
    .insert({
      nombre: data.nombre,
      descripcion: data.descripcion,
    })
    .select('id')
    .single()

  if (accError || !newAccount) return { error: 'Error al crear la cuenta global.' }

  // 2. Asignar a la empresa
  const { error: linkError } = await supabase.from('company_accounts').insert({
    company_id: empresaId,
    account_id: newAccount.id,
    egreso_a_discrecion: data.egreso_a_discrecion,
  })

  if (linkError) return { error: 'Cuenta creada pero no se pudo asignar a la empresa.' }

  revalidatePath(`/superadmin/empresas/${empresaId}`)
  return { success: true }
}

export async function updateAccountInfo(
  empresaId: string,
  accountId: string,
  data: { nombre: string; descripcion: string; egreso_a_discrecion: boolean }
) {
  const { supabase } = await assertSuperAdmin()

  // 1. Actualizar cuenta global
  const { error: accError } = await supabase
    .from('accounts')
    .update({
      nombre: data.nombre,
      descripcion: data.descripcion,
    })
    .eq('id', accountId)

  if (accError) return { error: 'Error al actualizar los datos globales de la cuenta.' }

  // 2. Actualizar configuración local (discreción)
  const { error: linkError } = await supabase
    .from('company_accounts')
    .update({ egreso_a_discrecion: data.egreso_a_discrecion })
    .eq('company_id', empresaId)
    .eq('account_id', accountId)

  if (linkError) return { error: 'Datos globales actualizados pero no la configuración local.' }

  revalidatePath(`/superadmin/empresas/${empresaId}`)
  return { success: true }
}
