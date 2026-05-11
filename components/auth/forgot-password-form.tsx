'use client'

import { useRef, useState, useActionState } from 'react'
import Link from 'next/link'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TurnstileWidget from '@/components/auth/turnstile-widget'
import { requestPasswordReset, verifyTurnstileToken } from '@/app/(auth)/olvide-contrasena/actions'

type State = { success: boolean; error: string | undefined }
const initialState: State = { success: false, error: undefined }

export default function ForgotPasswordForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const [state, formAction, pending] = useActionState(
    async (prev: State, formData: FormData): Promise<State> => {
      if (!turnstileToken) {
        return { success: false, error: 'Completa la verificación de seguridad.' }
      }

      const verified = await verifyTurnstileToken(turnstileToken)
      if (!verified.success) {
        setTurnstileToken(null)
        turnstileRef.current?.reset()
        return { success: false, error: 'Verificación de seguridad fallida. Intenta de nuevo.' }
      }

      const result = await requestPasswordReset(prev, formData)
      return { success: result.success, error: result.error }
    },
    initialState
  )

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-primary text-lg">✓</span>
        </div>
        <p className="text-sm text-foreground font-medium">Revisa tu correo</p>
        <p className="text-xs text-muted-foreground">
          Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
        </p>
        <Link href="/login" className="block">
          <Button variant="outline" className="w-full" size="sm">
            Volver al inicio de sesión
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nombre@empresa.com"
          required
          disabled={pending}
          autoComplete="email"
        />
      </div>

      <TurnstileWidget
        ref={turnstileRef}
        onSuccess={(token) => { setTurnstileToken(token); setTurnstileError(null) }}
        onExpire={() => setTurnstileToken(null)}
      />

      {(state.error || turnstileError) && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {state.error ?? turnstileError}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !turnstileToken}
      >
        {pending ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  )
}
