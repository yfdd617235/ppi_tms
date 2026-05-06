'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExpenseRequest } from '@/app/(dashboard)/cliente/egresos/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCOP } from '@/lib/currency'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/date'

interface Account {
  id: string
  nombre: string
  saldo_bruto: string
  saldo_neto: string
  nombre_banco: string | null
  numero_cuenta: string | null
  tipo_cuenta: string | null
}
interface Beneficiario { id: string; nombre: string; tipo: string; cedula_nit: string; entidad_financiera: string | null; tipo_cuenta: string | null; numero_cuenta: string | null }

interface Props {
  accounts: Account[]
  beneficiarios: Beneficiario[]
  userId: string
  companyId: string
}

function formatInputCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('es-CO')
}

export default function ExpenseForm({ accounts, beneficiarios }: Props) {
  const [accountId, setAccountId] = useState('')
  const [valorDisplay, setValorDisplay] = useState('')
  const [tipoPago, setTipoPago] = useState<'cheque' | 'transferencia' | ''>('')
  const [programacion, setProgramacion] = useState<'inmediato' | 'programado' | 'discrecion'>('inmediato')
  const [beneficiaryId, setBeneficiaryId] = useState('')
  const [usarNuevo, setUsarNuevo] = useState(false)
  const [nuevoBenNombre, setNuevoBenNombre] = useState('')
  const [nuevoBenCedula, setNuevoBenCedula] = useState('')
  const [nuevoBenEntidad, setNuevoBenEntidad] = useState('')
  const [nuevoBenTipoCuenta, setNuevoBenTipoCuenta] = useState('')
  const [nuevoBenNumCuenta, setNuevoBenNumCuenta] = useState('')
  const [guardarBen, setGuardarBen] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [fechaProgramada, setFechaProgramada] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const selectedAccount = accounts.find((a) => a.id === accountId)

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValorDisplay(formatInputCurrency(e.target.value))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!accountId) { setError('Selecciona una cuenta.'); return }
    if (!valorDisplay) { setError('Ingresa el valor del egreso.'); return }
    if (!tipoPago) { setError('Selecciona el tipo de pago.'); return }

    const valorNumerico = parseInt(valorDisplay.replace(/\D/g, ''), 10)
    if (selectedAccount && valorNumerico > parseFloat(selectedAccount.saldo_neto)) {
      setError(`Saldo insuficiente. Disponible: ${formatCOP(parseFloat(selectedAccount.saldo_neto))}`)
      return
    }

    const fd = new FormData()
    fd.set('account_id', accountId)
    fd.set('valor', valorDisplay)
    fd.set('tipo_pago', tipoPago)
    fd.set('programacion', programacion)
    fd.set('descripcion', descripcion)
    fd.set('fecha_programada', fechaProgramada)
    fd.set('guardar_beneficiario', String(guardarBen))

    if (!usarNuevo && beneficiaryId) {
      fd.set('beneficiary_id', beneficiaryId)
    } else {
      fd.set('nuevo_beneficiario_nombre', nuevoBenNombre)
      fd.set('nuevo_beneficiario_cedula_nit', nuevoBenCedula)
      if (tipoPago === 'transferencia') {
        fd.set('nuevo_beneficiario_entidad', nuevoBenEntidad)
        fd.set('nuevo_beneficiario_tipo_cuenta', nuevoBenTipoCuenta)
        fd.set('nuevo_beneficiario_numero_cuenta', nuevoBenNumCuenta)
      }
    }

    startTransition(async () => {
      const result = await createExpenseRequest(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Cuenta origen</Label>
        <Select value={accountId} onValueChange={setAccountId} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                <span>{acc.nombre}</span>
                <span className="text-muted-foreground ml-1.5">
                  {acc.nombre_banco && `— ${acc.nombre_banco}${acc.tipo_cuenta ? ` (${acc.tipo_cuenta === 'corriente' ? 'Cte.' : 'Ahorro'})` : ''}${acc.numero_cuenta ? ` #${acc.numero_cuenta}` : ''} · `}
                  {formatCOP(parseFloat(acc.saldo_neto))}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Tipo de pago</Label>
        <Select value={tipoPago} onValueChange={(v) => setTipoPago(v as 'cheque' | 'transferencia')} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Valor a pagar (COP)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={valorDisplay}
            onChange={handleValorChange}
            className="pl-7"
            required
          />
        </div>
        {valorDisplay && selectedAccount && (() => {
          const v = parseInt(valorDisplay.replace(/\D/g, ''), 10)
          const disponible = parseFloat(selectedAccount.saldo_neto)
          const excede = v > disponible
          return (
            <p className={`text-xs ${excede ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {excede
                ? `⚠ Excede el saldo disponible. Máximo: ${formatCOP(disponible)}`
                : `Disponible (neto): ${formatCOP(disponible)}`}
            </p>
          )
        })()}
      </div>

      <div className="space-y-1.5">
        <Label>Tipo de programación</Label>
        <Select 
          value={programacion} 
          onValueChange={(v) => setProgramacion(v as any)} 
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="¿Cuándo debe ejecutarse?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inmediato">Inmediato</SelectItem>
            <SelectItem value="programado">Fecha programada</SelectItem>
            <SelectItem value="discrecion">A discreción de PPI</SelectItem>
          </SelectContent>
        </Select>
        {selectedAccount?.egreso_a_discrecion && programacion !== 'discrecion' && (
          <p className="text-[10px] text-amber-600 italic">
            Nota: Esta cuenta está configurada preferiblemente "A discreción de PPI".
          </p>
        )}
      </div>

      {programacion === 'programado' && (
        <div className="space-y-1.5">
          <Label>Fecha programada</Label>
          <Input 
            type="date" 
            value={fechaProgramada} 
            onChange={(e) => setFechaProgramada(e.target.value)} 
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {fechaProgramada && (
            <p className="text-xs font-medium text-blue-600">
              Se ejecutará el: {formatDate(fechaProgramada)}
            </p>
          )}
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <Label>Beneficiario</Label>
        {beneficiarios.length > 0 && !usarNuevo && (
          <Select value={beneficiaryId} onValueChange={setBeneficiaryId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un beneficiario" />
            </SelectTrigger>
            <SelectContent>
              {beneficiarios.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.nombre} — {b.cedula_nit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={() => { setUsarNuevo(!usarNuevo); setBeneficiaryId('') }}
        >
          {usarNuevo ? '← Usar beneficiario existente' : '+ Nuevo beneficiario'}
        </button>

        {(usarNuevo || beneficiarios.length === 0) && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="space-y-1.5">
              <Label>Nombre / Razón social</Label>
              <Input value={nuevoBenNombre} onChange={(e) => setNuevoBenNombre(e.target.value)} placeholder="Nombre completo o empresa" />
            </div>
            <div className="space-y-1.5">
              <Label>Cédula / NIT</Label>
              <Input value={nuevoBenCedula} onChange={(e) => setNuevoBenCedula(e.target.value)} placeholder="123456789" />
            </div>
            {tipoPago === 'transferencia' && (
              <>
                <div className="space-y-1.5">
                  <Label>Entidad financiera</Label>
                  <Input value={nuevoBenEntidad} onChange={(e) => setNuevoBenEntidad(e.target.value)} placeholder="Bancolombia, Davivienda…" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de cuenta</Label>
                  <Select value={nuevoBenTipoCuenta} onValueChange={setNuevoBenTipoCuenta}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahorros">Ahorros</SelectItem>
                      <SelectItem value="corriente">Corriente</SelectItem>
                      <SelectItem value="nequi">Nequi</SelectItem>
                      <SelectItem value="daviplata">Daviplata</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Número de cuenta</Label>
                  <Input value={nuevoBenNumCuenta} onChange={(e) => setNuevoBenNumCuenta(e.target.value)} placeholder="000-000000-00" />
                </div>
              </>
            )}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={guardarBen}
                onChange={(e) => setGuardarBen(e.target.checked)}
                className="accent-primary"
              />
              Guardar como beneficiario frecuente
            </label>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Descripción (opcional)</Label>
        <Textarea
          placeholder="Concepto del pago, instrucciones adicionales…"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar solicitud'}
        </Button>
      </div>
    </form>
  )
}
