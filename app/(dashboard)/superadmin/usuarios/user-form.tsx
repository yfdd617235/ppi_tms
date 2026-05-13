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
import { updateUser } from './actions'

interface Props {
  companies: { id: string; razon_social: string }[]
  initialData: {
    id: string
    email: string
    full_name: string | null
    role: string
    company_id: string | null
  }
}

export function UserForm({ companies, initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState(initialData.full_name || '')
  const [role, setRole] = useState(initialData.role)
  const companyName = companies.find(c => c.id === initialData.company_id)?.razon_social ?? 'Sin empresa (Global)'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateUser(initialData.id, {
        full_name: fullName,
        role,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario actualizado')
        router.push('/superadmin/usuarios')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Correo electrónico</Label>
        <Input value={initialData.email} disabled className="bg-muted/50" />
        <p className="text-[10px] text-muted-foreground">
          El correo se gestiona desde la ficha de la empresa.
        </p>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Rol</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Administrador Empresa</SelectItem>
              <SelectItem value="client">Cliente (Operativo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Empresa</Label>
          <p className="text-sm px-3 py-2 rounded-md border border-border bg-muted/40">{companyName}</p>
          <p className="text-[10px] text-muted-foreground">Se asigna desde la ficha de la empresa.</p>
        </div>
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
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
