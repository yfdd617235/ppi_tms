'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfileName, updatePassword } from './actions'
import { toast } from 'sonner'

interface Props {
  fullName: string
  email: string
}

export function ProfileForm({ fullName, email }: Props) {
  const [nameLoading, setNameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function handleName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameLoading(true)
    const result = await updateProfileName(new FormData(e.currentTarget))
    setNameLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Nombre actualizado')
    }
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordLoading(true)
    const form = e.currentTarget
    const result = await updatePassword(new FormData(form))
    setPasswordLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Contraseña actualizada')
      form.reset()
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleName} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" value={email} disabled className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={fullName}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <Button type="submit" disabled={nameLoading} size="sm">
              {nameLoading ? 'Guardando…' : 'Guardar nombre'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={passwordLoading} size="sm">
              {passwordLoading ? 'Actualizando…' : 'Cambiar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
