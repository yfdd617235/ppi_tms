'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Send } from 'lucide-react'
import type { Company } from '@/types'

interface Props {
  mode: 'create' | 'edit'
  initialData?: Company
  action: (formData: FormData) => Promise<{ error?: string; warning?: string } | void>
  currentUserEmail?: string
  resendInviteAction?: () => Promise<{ error?: string; success?: boolean }>
}

export function CompanyForm({ mode, initialData, action, currentUserEmail, resendInviteAction }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()
  const [isResending, startResendTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setWarning(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await action(fd)
      if (result?.error) setError(result.error)
      if (result?.warning) setWarning(result.warning)
    })
  }

  function handleResend() {
    if (!resendInviteAction) return
    setResendStatus('idle')
    startResendTransition(async () => {
      const result = await resendInviteAction()
      setResendStatus(result?.error ? 'error' : 'ok')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Datos de la empresa */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Datos de la empresa</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="razon_social">Razón social <span className="text-destructive">*</span></Label>
            <Input
              id="razon_social"
              name="razon_social"
              defaultValue={initialData?.razon_social ?? ''}
              placeholder="Empresa S.A.S."
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nit">NIT <span className="text-destructive">*</span></Label>
            <Input
              id="nit"
              name="nit"
              defaultValue={initialData?.nit ?? ''}
              placeholder="900.123.456-7"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            name="direccion"
            defaultValue={initialData?.direccion ?? ''}
            placeholder="Calle 123 # 45-67, Bogotá"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="correo">Correo electrónico <span className="text-destructive">*</span></Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              defaultValue={initialData?.correo ?? ''}
              placeholder="contacto@empresa.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="celular">Teléfono</Label>
            <Input
              id="celular"
              name="celular"
              defaultValue={initialData?.celular ?? ''}
              placeholder="601 234 5678"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Representante legal */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Representante legal</h2>
        <div className="space-y-1.5">
          <Label htmlFor="nombre_representante_legal">Nombre del representante legal</Label>
          <Input
            id="nombre_representante_legal"
            name="nombre_representante_legal"
            defaultValue={initialData?.nombre_representante_legal ?? ''}
            placeholder="Juan Pérez"
          />
        </div>
      </div>

      <Separator />

      {/* Contacto de operaciones */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Contacto de operaciones</h2>
        <div className="space-y-1.5">
          <Label htmlFor="nombre_contacto_operaciones">Nombre</Label>
          <Input
            id="nombre_contacto_operaciones"
            name="nombre_contacto_operaciones"
            defaultValue={initialData?.nombre_contacto_operaciones ?? ''}
            placeholder="María García"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="correo_contacto_operaciones">Correo</Label>
            <Input
              id="correo_contacto_operaciones"
              name="correo_contacto_operaciones"
              type="email"
              defaultValue={initialData?.correo_contacto_operaciones ?? ''}
              placeholder="operaciones@empresa.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefono_contacto_operaciones">Teléfono</Label>
            <Input
              id="telefono_contacto_operaciones"
              name="telefono_contacto_operaciones"
              defaultValue={initialData?.telefono_contacto_operaciones ?? ''}
              placeholder="310 000 0000"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Acceso al sistema — visible en ambos modos */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Acceso al sistema</h2>

        {/* Hidden field para comparar email en modo editar */}
        {mode === 'edit' && (
          <input type="hidden" name="old_user_email" value={currentUserEmail ?? ''} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="user_email">
              Email del usuario cliente{mode === 'create' && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id="user_email"
              name="user_email"
              type="email"
              defaultValue={currentUserEmail ?? ''}
              placeholder="usuario@empresa.com"
              required={mode === 'create'}
            />
            {mode === 'edit' && currentUserEmail && (
              <p className="text-xs text-muted-foreground">
                Si cambias el correo, se enviará un nuevo enlace de acceso.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user_full_name">Nombre completo</Label>
            <Input
              id="user_full_name"
              name="user_full_name"
              placeholder="Juan Pérez"
            />
          </div>
        </div>

        {/* Botón reenviar invitación — solo en modo editar si ya hay usuario */}
        {mode === 'edit' && currentUserEmail && resendInviteAction && (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isResending}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isResending ? 'Enviando…' : 'Reenviar enlace de acceso'}
            </Button>
            {resendStatus === 'ok' && (
              <span className="text-xs text-green-700">Enlace enviado correctamente.</span>
            )}
            {resendStatus === 'error' && (
              <span className="text-xs text-destructive">Error al enviar. Intenta de nuevo.</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}
      {warning && (
        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-md">{warning}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === 'create' ? 'Creando…' : 'Guardando…'
            : mode === 'create' ? 'Crear empresa' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
