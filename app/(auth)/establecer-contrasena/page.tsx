'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EstablecerContrasenaPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setChecking(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Error al establecer la contraseña. Intenta de nuevo.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const dest =
      profile?.role === 'super_admin' ? '/superadmin' :
      profile?.role === 'admin'       ? '/admin'       :
                                        '/cliente'

    router.push(dest)
    router.refresh()
  }

  if (checking) return null

  if (!hasSession) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm text-center space-y-3">
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-destructive text-lg">!</span>
          </div>
          <h2 className="text-sm font-medium text-foreground">Enlace inválido o expirado</h2>
          <p className="text-xs text-muted-foreground">
            Este enlace de invitación ya fue usado o expiró. Contacta al administrador para recibir una nueva invitación.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push('/login')} className="w-full mt-2">
            Ir al inicio de sesión
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-lg tracking-tight">P</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">Panamerican Private Investments</h1>
        <p className="text-sm text-muted-foreground mt-1">Portal de Tesorería</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-medium text-foreground">Establece tu contraseña</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Crea una contraseña segura para acceder al portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando…' : 'Establecer contraseña'}
          </Button>
        </form>
      </div>
    </div>
  )
}
