'use server'

import { z } from 'zod'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { sendTelegramAlert } from '@/lib/telegram'

const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters.'),
  email:   z.string().email('Invalid email address.'),
  phone:   z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  source:  z.string().optional(),
})

export type ContactState = { success: boolean; error: string | undefined }

export async function submitContactRequest(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name:    formData.get('name'),
    email:   formData.get('email'),
    phone:   formData.get('phone') || undefined,
    message: formData.get('message'),
    source:  formData.get('source') || undefined,
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? 'Please fill all required fields.' }
  }

  const { name, email, phone, message, source } = parsed.data

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  const serviceClient = createServiceClient()
  const { error: dbError } = await serviceClient
    .from('contact_requests')
    .insert({ name, email, phone, message, source })

  if (dbError) {
    console.error('Contact DB error:', dbError)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  // Email notification via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `PPI Contact <noreply@${process.env.RESEND_FROM_DOMAIN}>`,
      to:   process.env.PPI_NOTIFICATION_EMAIL!,
      subject: `New contact request from ${name}`,
      html: `
        <h2 style="color:#16a34a">New contact request — PPI</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ''}
        ${source ? `<p><strong>Source:</strong> ${esc(source)}</p>` : ''}
        <hr/>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${esc(message)}</p>
      `,
    })
  } catch (e) {
    console.error('Resend error:', e)
  }

  // Telegram notification (non-blocking)
  sendTelegramAlert(
    `📩 New contact request\n👤 ${name}\n📧 ${email}${phone ? `\n📞 ${phone}` : ''}${source ? `\n🔗 ${source}` : ''}\n\n💬 ${message.slice(0, 150)}${message.length > 150 ? '…' : ''}`
  )

  return { success: true, error: undefined }
}
