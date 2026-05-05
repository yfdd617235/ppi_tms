'use server'

import { createClient } from '@/lib/supabase/server'
import { incomeRequestSchema } from '@/lib/validations/income'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

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
    return { error: 'Datos inválidos. Verifica el formulario.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) return { error: 'No tienes empresa asignada.' }

  // Valor sin formato: quitar puntos y comas
  const valorNumerico = parseFloat(parsed.data.valor_cliente.replace(/\./g, '').replace(',', '.'))

  const { error: insertError } = await supabase.from('income_requests').insert({
    account_id: parsed.data.account_id,
    company_id: profile.company_id,
    created_by: user.id,
    valor_cliente: valorNumerico,
    descripcion: parsed.data.descripcion,
    estado: 'enviado',
  })

  if (insertError) return { error: 'Error al guardar la solicitud. Intenta de nuevo.' }

  // Notificación por email a PPI
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'PPI TMS <noreply@ppi.com.co>',
      to: process.env.PPI_NOTIFICATION_EMAIL!,
      subject: 'Nueva solicitud de ingreso',
      html: `<p>Se ha recibido una nueva solicitud de ingreso por <strong>$${valorNumerico.toLocaleString('es-CO')}</strong>.<br/>Ingresa al portal para verificar.</p>`,
    })
  } catch {
    // No bloquear el flujo si el email falla
  }

  redirect('/cliente/ingresos')
}
