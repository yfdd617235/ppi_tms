'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil } from 'lucide-react'
import { createAndAssignAccount, updateAccountInfo } from '@/app/(dashboard)/superadmin/empresas/[id]/cuentas/actions'
import { toast } from 'sonner'

interface CreateProps {
  companyId: string
}

export function CreateAccountDialog({ companyId }: CreateProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [discrecion, setDiscrecion] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createAndAssignAccount(companyId, { nombre: name, descripcion: desc, egreso_a_discrecion: discrecion })
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Cuenta creada y asignada')
        setOpen(false)
        setName('')
        setDesc('')
        setDiscrecion(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nueva cuenta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva cuenta bancaria</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta en el catálogo y asígnala a esta empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre de la cuenta</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Bancolombia Principal" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Descripción (opcional)</Label>
              <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalles de la cuenta..." />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={discrecion} onChange={e => setDiscrecion(e.target.checked)} className="accent-primary" />
              Egresos a discreción de PPI
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear y asignar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditProps {
  companyId: string
  accountId: string
  initialData: {
    nombre: string
    descripcion: string | null
    egreso_a_discrecion: boolean
  }
}

export function EditAccountDialog({ companyId, accountId, initialData }: EditProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(initialData.nombre)
  const [desc, setDesc] = useState(initialData.descripcion || '')
  const [discrecion, setDiscrecion] = useState(initialData.egreso_a_discrecion)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateAccountInfo(companyId, accountId, { nombre: name, descripcion: desc, egreso_a_discrecion: discrecion })
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Cuenta actualizada')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Editar cuenta">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar cuenta</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la cuenta para esta empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="ename">Nombre de la cuenta</Label>
              <Input id="ename" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edesc">Descripción</Label>
              <Textarea id="edesc" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={discrecion} onChange={e => setDiscrecion(e.target.checked)} className="accent-primary" />
              Egresos a discreción de PPI
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
