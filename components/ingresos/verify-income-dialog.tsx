'use client'

import { useState, useTransition } from 'react'
import { verifyIncomeRequest } from '@/app/(dashboard)/superadmin/ingresos/actions'
import { formatCOP } from '@/lib/currency'
import { calcularComisiones } from '@/lib/financial'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle } from 'lucide-react'

function formatInputCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('es-CO')
}

interface Props {
  incomeId: string
  empresa: string
  valorCliente: number
}

export function VerifyIncomeDialog({ incomeId, empresa, valorCliente }: Props) {
  const [open, setOpen] = useState(false)
  const [valorDisplay, setValorDisplay] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const valorReal = valorDisplay
    ? parseFloat(valorDisplay.replace(/\./g, '').replace(',', '.'))
    : 0

  const comisiones = valorReal > 0 ? calcularComisiones(valorReal) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valorDisplay) { setError('Ingresa el valor real.'); return }
    setError(null)

    const fd = new FormData()
    fd.set('valor_real', valorDisplay)
    fd.set('notas_admin', notas)

    startTransition(async () => {
      const result = await verifyIncomeRequest(incomeId, fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setValorDisplay('')
        setNotas('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-700 border-green-200 hover:bg-green-50">
          <CheckCircle className="w-3.5 h-3.5" />
          Verificar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verificar ingreso</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-medium text-foreground">{empresa}</span>
          {' · '}Valor cliente: <span className="font-medium">{formatCOP(valorCliente)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="valor_real">Valor real verificado (COP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="valor_real"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={valorDisplay}
                onChange={(e) => setValorDisplay(formatInputCurrency(e.target.value))}
                className="pl-7"
                required
              />
            </div>
          </div>

          {comisiones && (
            <div className="rounded-md bg-muted/40 border border-border p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor real</span>
                <span>{formatCOP(valorReal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Comisión PPI (0.8%)</span>
                <span>− {formatCOP(comisiones.comisionPPI)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Impuesto 4×1000 (0.4%)</span>
                <span>− {formatCOP(comisiones.impuesto4x1000)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border pt-1.5 text-primary">
                <span>Valor neto</span>
                <span>{formatCOP(comisiones.valorNeto)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Observaciones de la verificación..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !valorDisplay}>
              {isPending ? 'Verificando…' : 'Confirmar verificación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
