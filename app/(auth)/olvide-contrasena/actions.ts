'use server'

import { z } from 'zod'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const schema = z.object({
  email: z.string().email(),
})

export async function verifyTurnstileToken(token: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    })
    const data = await res.json()
    return { success: !!data.success }
  } catch {
    return { success: false }
  }
}

export async function requestPasswordReset(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const parsed = schema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { success: false, error: 'Correo inválido.' }

  const { email } = parsed.data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const redirectTo = `${appUrl}/establecer-contrasena`

  // Misma técnica que sendAccessLink() en empresas/actions.ts:
  // flowType: 'implicit' para que el enlace funcione desde cualquier dispositivo.
  const implicitClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false, flowType: 'implicit' } }
  )

  await implicitClient.auth.resetPasswordForEmail(email, { redirectTo })

  // Siempre retorna success para no revelar si el email existe
  return { success: true }
}
