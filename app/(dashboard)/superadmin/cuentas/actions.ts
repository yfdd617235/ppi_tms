'use server'

import { createClient } from '@/lib/supabase/server'
import { accountSchema } from '@/lib/validations/account'
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

export async function createAccount(formData: FormData) {
  const { supabase } = await assertSuperAdmin()

  const raw = {
    nombre: formData.get('nombre') as string,
    nombre_banco: formData.get('nombre_banco') as string,
    numero_cuenta: formData.get('numero_cuenta') as string,
    tipo_cuenta: formData.get('tipo_cuenta') as string,
    descripcion: (formData.get('descripcion') as string) || undefined,
  }

  const parsed = accountSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' }
  }

  const { error } = await supabase.from('accounts').insert({
    nombre: parsed.data.nombre,
    nombre_banco: parsed.data.nombre_banco,
    numero_cuenta: parsed.data.numero_cuenta,
    tipo_cuenta: parsed.data.tipo_cuenta,
    descripcion: parsed.data.descripcion ?? null,
  })

  if (error) return { error: 'Error al crear la cuenta. Intenta de nuevo.' }

  revalidatePath('/superadmin/cuentas')
  redirect('/superadmin/cuentas')
}

export async function updateAccount(cuentaId: string, formData: FormData) {
  const { supabase } = await assertSuperAdmin()

  const raw = {
    nombre: formData.get('nombre') as string,
    nombre_banco: formData.get('nombre_banco') as string,
    numero_cuenta: formData.get('numero_cuenta') as string,
    tipo_cuenta: formData.get('tipo_cuenta') as string,
    descripcion: (formData.get('descripcion') as string) || undefined,
  }

  const parsed = accountSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos.' }
  }

  const { error } = await supabase
    .from('accounts')
    .update({
      nombre: parsed.data.nombre,
      nombre_banco: parsed.data.nombre_banco,
      numero_cuenta: parsed.data.numero_cuenta,
      tipo_cuenta: parsed.data.tipo_cuenta,
      descripcion: parsed.data.descripcion ?? null,
    })
    .eq('id', cuentaId)

  if (error) return { error: 'Error al actualizar la cuenta.' }

  revalidatePath('/superadmin/cuentas')
  redirect('/superadmin/cuentas')
}

export async function toggleAccountStatus(cuentaId: string, currentActiva: boolean) {
  const { supabase } = await assertSuperAdmin()

  const { error } = await supabase
    .from('accounts')
    .update({ activa: !currentActiva })
    .eq('id', cuentaId)

  if (error) return { error: 'Error al cambiar el estado.' }

  revalidatePath('/superadmin/cuentas')
}
