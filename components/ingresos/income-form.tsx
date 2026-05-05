'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createIncomeRequest } from '@/app/(dashboard)/cliente/ingresos/actions'
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

interface Account { id: string; nombre: string }

interface Props {
  accounts: Account[]
  userId: string
  companyId: string
}

function formatInputCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('es-CO')
}

export default function IncomeForm({ accounts }: Props) {
  const [accountId, setAccountId] = useState('')
  const [valorDisplay, setValorDisplay] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValorDisplay(formatInputCurrency(e.target.value))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!accountId) { setError('Selecciona una cuenta.'); return }
    if (!valorDisplay) { setError('Ingresa el valor consignado.'); return }

    const fd = new FormData()
    fd.set('account_id', accountId)
    fd.set('valor_cliente', valorDisplay)
    fd.set('descripcion', descripcion)

    startTransition(async () => {
      const result = await createIncomeRequest(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="account">Cuenta</Label>
        <Select value={accountId} onValueChange={setAccountId} required>
          <SelectTrigger id="account">
            <SelectValue placeholder="Selecciona una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>{acc.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor consignado (COP)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input
            id="valor"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={valorDisplay}
            onChange={handleValorChange}
            className="pl-7"
            required
          />
        </div>
        {valorDisplay && (
          <p className="text-xs text-muted-foreground">
            {formatCOP(parseInt(valorDisplay.replace(/\./g, ''), 10))}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          placeholder="Referencia de pago, banco origen, etc."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Soporte de pago</Label>
        <p className="text-xs text-muted-foreground">
          El adjunto de soporte estará disponible en la próxima versión.
          Por ahora PPI verificará directamente con el extracto bancario.
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !accountId || !valorDisplay}>
          {isPending ? 'Enviando…' : 'Enviar solicitud'}
        </Button>
      </div>
    </form>
  )
}
