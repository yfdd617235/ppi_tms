'use server'

import { createClient } from '@/lib/supabase/server'
import { expenseRequestSchema } from '@/lib/validations/expense'
import { formatCOP } from '@/lib/currency'
import { redirect } from 'next/navigation'
import { sendTelegramAlert } from '@/lib/telegram'

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
    nuevo_beneficiario_punto_entrega: (formData.get('nuevo_beneficiario_punto_entrega') as string) || undefined,
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

  const { data: company } = await supabase
    .from('companies')
    .select('razon_social')
    .eq('id', profile.company_id)
    .single()

  const valorNumerico = parseFloat(parsed.data.valor.replace(/\./g, '').replace(',', '.'))

  // Verificar saldo suficiente descontando egresos congelados (pendiente/enviado)
  const [{ data: companyAccount }, { data: pendingExpenses }] = await Promise.all([
    supabase.from('company_accounts').select('saldo_neto')
      .eq('account_id', parsed.data.account_id)
      .eq('company_id', profile.company_id)
      .single(),
    supabase.from('expense_requests').select('valor')
      .eq('account_id', parsed.data.account_id)
      .eq('company_id', profile.company_id)
      .in('estado', ['pendiente', 'enviado', 'cheque_emitido']),
  ])

  if (!companyAccount) return { error: 'Cuenta no encontrada.' }

  const frozenAmount = (pendingExpenses ?? []).reduce(
    (sum, row) => sum + parseFloat(row.valor), 0
  )
  const saldoDisponible = Math.max(0, parseFloat(companyAccount.saldo_neto) - frozenAmount)

  if (valorNumerico > saldoDisponible) {
    return { error: `Saldo insuficiente. Disponible: ${formatCOP(saldoDisponible)}` }
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
        punto_entrega: parsed.data.nuevo_beneficiario_punto_entrega,
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
    nuevo_beneficiario_punto_entrega: beneficiaryId ? null : parsed.data.nuevo_beneficiario_punto_entrega,
    guardar_beneficiario: parsed.data.guardar_beneficiario,
    valor: valorNumerico,
    tipo_pago: parsed.data.tipo_pago,
    descripcion: parsed.data.descripcion,
    programacion: parsed.data.programacion,
    fecha_programada: parsed.data.programacion === 'programado' ? (parsed.data.fecha_programada || null) : null,
    estado: 'pendiente',
  })

  if (insertError) return { error: 'Error al guardar la solicitud. Intenta de nuevo.' }

  try {
    await sendTelegramAlert(
      `🔴 Nuevo Egreso\nEmpresa: ${company?.razon_social ?? profile.company_id}\nValor: ${formatCOP(valorNumerico)}\nVer en portal: ${process.env.NEXT_PUBLIC_APP_URL}/superadmin/egresos`
    )
  } catch {
    // No bloquear el flujo si Telegram falla
  }

  redirect('/cliente/egresos')
}
