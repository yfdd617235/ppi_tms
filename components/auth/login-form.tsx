'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TurnstileWidget from '@/components/auth/turnstile-widget'
import { verifyTurnstileToken } from '@/app/(auth)/olvide-contrasena/actions'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!turnstileToken) {
      setError('Completa la verificación de seguridad.')
      return
    }

    setLoading(true)

    const verified = await verifyTurnstileToken(turnstileToken)
    if (!verified.success) {
      setError('Verificación de seguridad fallida. Intenta de nuevo.')
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/olvide-contrasena"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      <TurnstileWidget
        ref={turnstileRef}
        onSuccess={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken(null)}
      />

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
