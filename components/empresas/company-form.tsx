'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Send } from 'lucide-react'
import type { Company } from '@/types'

interface CatalogAccount {
  id: string
  nombre: string
  descripcion: string | null
  nombre_banco: string | null
  numero_cuenta: string | null
}

interface Props {
  mode: 'create' | 'edit'
  initialData?: Company
  action: (formData: FormData) => Promise<{ error?: string; warning?: string } | void>
  currentUserEmail?: string
  resendInviteAction?: () => Promise<{ error?: string; success?: boolean }>
  accounts?: CatalogAccount[]
}

export function CompanyForm({ mode, initialData, action, currentUserEmail, resendInviteAction, accounts }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()
  const [isResending, startResendTransition] = useTransition()
  const router = useRouter()

  const [checkedAccounts, setCheckedAccounts] = useState<Set<string>>(new Set())
  const [discrecion, setDiscrecion] = useState<Record<string, boolean>>({})

  function toggleAccount(id: string, checked: boolean) {
    const next = new Set(checkedAccounts)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
      setDiscrecion(prev => { const d = { ...prev }; delete d[id]; return d })
    }
    setCheckedAccounts(next)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setWarning(null)
    const fd = new FormData(e.currentTarget)

    if (mode === 'create' && checkedAccounts.size > 0) {
      const cuentas = [...checkedAccounts].map(id => ({
        account_id: id,
        egreso_a_discrecion: discrecion[id] ?? false,
      }))
      fd.set('cuentas_json', JSON.stringify(cuentas))
    }

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
            <Label>Razón social {mode === 'create' && <span className="text-destructive">*</span>}</Label>
            {mode === 'edit' ? (
              <>
                <p className="text-sm px-3 py-2 rounded-md border border-border bg-muted/40 text-foreground">{initialData?.razon_social}</p>
                <p className="text-[10px] text-muted-foreground">No editable — identificador legal de la empresa</p>
              </>
            ) : (
              <Input
                id="razon_social"
                name="razon_social"
                defaultValue={initialData?.razon_social ?? ''}
                placeholder="Empresa S.A.S."
                required
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label>NIT {mode === 'create' && <span className="text-destructive">*</span>}</Label>
            {mode === 'edit' ? (
              <>
                <p className="text-sm px-3 py-2 rounded-md border border-border bg-muted/40 text-foreground">{initialData?.nit}</p>
                <p className="text-[10px] text-muted-foreground">No editable — identificador tributario permanente</p>
              </>
            ) : (
              <Input
                id="nit"
                name="nit"
                defaultValue={initialData?.nit ?? ''}
                placeholder="900.123.456-7"
                required
              />
            )}
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

      {/* Acceso al sistema */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Acceso al sistema</h2>

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

      {/* Cuentas a asignar — solo en creación */}
      {mode === 'create' && accounts !== undefined && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">Cuentas a asignar</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selecciona las cuentas del catálogo que estarán disponibles para este cliente. Puedes agregar más desde la ficha de la empresa.
              </p>
            </div>

            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No hay cuentas en el catálogo todavía. Puedes crearlas desde{' '}
                <a href="/superadmin/cuentas" className="text-primary hover:underline">Cuentas globales</a>{' '}
                y luego asignarlas desde la ficha de la empresa.
              </p>
            ) : (
              <div className="space-y-2">
                {accounts.map(account => {
                  const isChecked = checkedAccounts.has(account.id)
                  return (
                    <div
                      key={account.id}
                      className={`rounded-lg border px-4 py-3 transition-colors ${
                        isChecked ? 'border-primary/40 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          className="mt-0.5 accent-primary"
                          onChange={e => toggleAccount(account.id, e.target.checked)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{account.nombre}</div>
                          {(account.nombre_banco || account.numero_cuenta) && (
                            <div className="text-xs text-muted-foreground">
                              {[account.nombre_banco, account.numero_cuenta].filter(Boolean).join(' · ')}
                            </div>
                          )}
                          {account.descripcion && (
                            <div className="text-xs text-muted-foreground">{account.descripcion}</div>
                          )}
                        </div>
                      </label>
                      {isChecked && (
                        <label className="flex items-center gap-2 text-xs cursor-pointer mt-2.5 ml-7 text-muted-foreground hover:text-foreground transition-colors">
                          <input
                            type="checkbox"
                            checked={discrecion[account.id] ?? false}
                            className="accent-primary"
                            onChange={e => setDiscrecion(prev => ({ ...prev, [account.id]: e.target.checked }))}
                          />
                          Egresos a discreción de PPI
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

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
