'use server'

import { createClient } from '@/lib/supabase/server'
import { expenseRequestSchema } from '@/lib/validations/expense'
import { formatCOP } from '@/lib/currency'
import { redirect } from 'next/navigation'

export async function createExpenseRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    account_id: formData.get('account_id') as string,
    valor: formData.get('valor') as string,
    tipo_pago: formData.get('tipo_pago') as string,
    descripcion: (formData.get('descripcion') as string) || undefined,
    programacion: formData.get('programacion') as string,
    fecha_programada: (formData.get('fecha_programada') as string) || undefined,
    beneficiary_id: (formData.get('beneficiary_id') as string) || undefined,
    nuevo_beneficiario_nombre: (formData.get('nuevo_beneficiario_nombre') as string) || undefined,
    nuevo_beneficiario_cedula_nit: (formData.get('nuevo_beneficiario_cedula_nit') as string) || undefined,
    nuevo_beneficiario_entidad: (formData.get('nuevo_beneficiario_entidad') as string) || undefined,
    nuevo_beneficiario_tipo_cuenta: (formData.get('nuevo_beneficiario_tipo_cuenta') as string) || undefined,
    nuevo_beneficiario_numero_cuenta: (formData.get('nuevo_beneficiario_numero_cuenta') as string) || undefined,
    guardar_beneficiario: formData.get('guardar_beneficiario') === 'true',
  }

  const parsed = expenseRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) return { error: 'No tienes empresa asignada.' }

  const valorNumerico = parseFloat(parsed.data.valor.replace(/\./g, '').replace(',', '.'))

  // Verificar saldo suficiente
  const { data: companyAccount } = await supabase
    .from('company_accounts')
    .select('saldo_neto')
    .eq('account_id', parsed.data.account_id)
    .eq('company_id', profile.company_id)
    .single()

  if (!companyAccount) return { error: 'Cuenta no encontrada.' }
  if (valorNumerico > parseFloat(companyAccount.saldo_neto)) {
    return { error: `Saldo insuficiente. Disponible: ${formatCOP(parseFloat(companyAccount.saldo_neto))}` }
  }

  // Si solicita guardar el beneficiario nuevo, crearlo primero
  let beneficiaryId = parsed.data.beneficiary_id ?? null

  if (!beneficiaryId && parsed.data.guardar_beneficiario && parsed.data.nuevo_beneficiario_nombre) {
    const { data: newBen } = await supabase
      .from('beneficiaries')
      .insert({
        company_id: profile.company_id,
        tipo: parsed.data.tipo_pago,
        nombre: parsed.data.nuevo_beneficiario_nombre,
        cedula_nit: parsed.data.nuevo_beneficiario_cedula_nit!,
        entidad_financiera: parsed.data.nuevo_beneficiario_entidad,
        tipo_cuenta: parsed.data.nuevo_beneficiario_tipo_cuenta as 'ahorros' | 'corriente' | 'nequi' | 'daviplata' | 'otro' | undefined,
        numero_cuenta: parsed.data.nuevo_beneficiario_numero_cuenta,
      })
      .select('id')
      .single()

    if (newBen) beneficiaryId = newBen.id
  }

  const { error: insertError } = await supabase.from('expense_requests').insert({
    account_id: parsed.data.account_id,
    company_id: profile.company_id,
    created_by: user.id,
    beneficiary_id: beneficiaryId,
    nuevo_beneficiario_nombre: beneficiaryId ? null : parsed.data.nuevo_beneficiario_nombre,
    nuevo_beneficiario_cedula_nit: beneficiaryId ? null : parsed.data.nuevo_beneficiario_cedula_nit,
    nuevo_beneficiario_entidad: beneficiaryId ? null : parsed.data.nuevo_beneficiario_entidad,
    nuevo_beneficiario_tipo_cuenta: beneficiaryId ? null : parsed.data.nuevo_beneficiario_tipo_cuenta,
    nuevo_beneficiario_numero_cuenta: beneficiaryId ? null : parsed.data.nuevo_beneficiario_numero_cuenta,
    guardar_beneficiario: parsed.data.guardar_beneficiario,
    valor: valorNumerico,
    tipo_pago: parsed.data.tipo_pago,
    descripcion: parsed.data.descripcion,
    programacion: parsed.data.programacion,
    fecha_programada: parsed.data.programacion === 'programado' ? (parsed.data.fecha_programada || null) : null,
    estado: 'pendiente',
  })

  if (insertError) return { error: 'Error al guardar la solicitud. Intenta de nuevo.' }

  redirect('/cliente/egresos')
}
