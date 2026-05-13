'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { inviteStaffUser } from './actions'

export function InviteStaffForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await inviteStaffUser({ email, full_name: fullName, role })
      if (result?.error) {
        toast.error(result.error)
      }
      // En éxito, la server action hace redirect — no se necesita acción aquí
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="nombre@panamerican.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          placeholder="Nombre y apellido"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Rol</Label>
        <Select value={role} onValueChange={v => setRole(v as 'admin' | 'super_admin')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador PPI</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Administrador PPI: acceso de solo lectura a todo. Super Admin: acceso completo con permisos de edición.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? 'Enviando invitación...' : 'Enviar invitación'}
        </Button>
      </div>
    </form>
  )
}
