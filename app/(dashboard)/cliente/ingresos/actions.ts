'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { incomeRequestSchema } from '@/lib/validations/income'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { formatCOP } from '@/lib/currency'
import { sendTelegramAlert } from '@/lib/telegram'

export async function createIncomeRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    account_id: formData.get('account_id') as string,
    valor_cliente: formData.get('valor_cliente') as string,
    descripcion: (formData.get('descripcion') as string) || undefined,
  }

  const parsed = incomeRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos. Verifica el formulario.' }
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

  const valorNumerico = parseFloat(parsed.data.valor_cliente.replace(/\./g, '').replace(',', '.'))

  // Upload soporte si fue adjuntado
  let soporteUrl: string | null = null
  let soporteNombre: string | null = null

  const soporteFile = formData.get('soporte') as File | null
  if (soporteFile && soporteFile.size > 0) {
    if (soporteFile.size > 10 * 1024 * 1024) {
      return { error: 'El archivo no puede superar los 10 MB.' }
    }
    const ext = soporteFile.name.split('.').pop()
    const path = `${profile.company_id}/${Date.now()}-soporte.${ext}`

    const serviceClient = createServiceClient()
    const { error: uploadError } = await serviceClient.storage
      .from('payment-proofs')
      .upload(path, soporteFile, { contentType: soporteFile.type, upsert: false })

    if (uploadError) {
      console.error('[upload soporte]', uploadError)
      return { error: `Error al subir el soporte: ${uploadError.message}` }
    }

    soporteUrl = path
    soporteNombre = soporteFile.name
  }

  const { error: insertError } = await supabase.from('income_requests').insert({
    account_id: parsed.data.account_id,
    company_id: profile.company_id,
    created_by: user.id,
    valor_cliente: valorNumerico,
    descripcion: parsed.data.descripcion,
    soporte_url: soporteUrl,
    soporte_nombre: soporteNombre,
    estado: 'enviado',
  })

  if (insertError) return { error: 'Error al guardar la solicitud. Intenta de nuevo.' }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'PPI TMS <noreply@ppi.com.co>',
      to: process.env.PPI_NOTIFICATION_EMAIL!,
      subject: 'Nueva solicitud de ingreso',
      html: `<p>Se ha recibido una nueva solicitud de ingreso por <strong>${formatCOP(valorNumerico)}</strong>.<br/>Ingresa al portal para verificar.</p>`,
    })
  } catch {
    // No bloquear el flujo si el email falla
  }

  try {
    await sendTelegramAlert(
      `🟢 Nuevo Ingreso\nEmpresa: ${company?.razon_social ?? profile.company_id}\nValor: ${formatCOP(valorNumerico)}\nVer en portal: ${process.env.NEXT_PUBLIC_APP_URL}/superadmin/ingresos`
    )
  } catch {
    // No bloquear el flujo si Telegram falla
  }

  redirect('/cliente/ingresos')
}
