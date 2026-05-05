'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AccountData {
  id: string
  nombre: string
  nombre_banco: string | null
  numero_cuenta: string | null
  tipo_cuenta: 'corriente' | 'ahorros' | null
  descripcion: string | null
}

interface Props {
  mode: 'create' | 'edit'
  initialData?: AccountData
  action: (formData: FormData) => Promise<{ error?: string } | void>
}

export function AccountForm({ mode, initialData, action }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await action(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Identificación</h2>
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre de la cuenta <span className="text-destructive">*</span></Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={initialData?.nombre ?? ''}
            placeholder="Ej: Cuenta principal, Cuenta nómina"
            required
          />
          <p className="text-xs text-muted-foreground">Nombre interno para identificar la cuenta en el sistema.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            name="descripcion"
            defaultValue={initialData?.descripcion ?? ''}
            placeholder="Descripción adicional (opcional)"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Datos bancarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre_banco">Banco <span className="text-destructive">*</span></Label>
            <Input
              id="nombre_banco"
              name="nombre_banco"
              defaultValue={initialData?.nombre_banco ?? ''}
              placeholder="Ej: Bancolombia, Davivienda"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numero_cuenta">Número de cuenta <span className="text-destructive">*</span></Label>
            <Input
              id="numero_cuenta"
              name="numero_cuenta"
              defaultValue={initialData?.numero_cuenta ?? ''}
              placeholder="Ej: 696-123456-78"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tipo_cuenta">Tipo de cuenta <span className="text-destructive">*</span></Label>
          <Select name="tipo_cuenta" defaultValue={initialData?.tipo_cuenta ?? undefined} required>
            <SelectTrigger id="tipo_cuenta">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corriente">Corriente</SelectItem>
              <SelectItem value="ahorros">Ahorros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === 'create' ? 'Creando…' : 'Guardando…'
            : mode === 'create' ? 'Crear cuenta' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
