'use client'

import { useState, useTransition } from 'react'
import { rejectIncomeRequest } from '@/app/(dashboard)/superadmin/ingresos/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { XCircle } from 'lucide-react'

interface Props {
  incomeId: string
  empresa: string
}

export function RejectIncomeDialog({ incomeId, empresa }: Props) {
  const [open, setOpen] = useState(false)
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const fd = new FormData()
    fd.set('notas_admin', notas)

    startTransition(async () => {
      const result = await rejectIncomeRequest(incomeId, fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setNotas('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50">
          <XCircle className="w-3.5 h-3.5" />
          Rechazar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rechazar ingreso</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Se rechazará el ingreso de <span className="font-medium text-foreground">{empresa}</span>. Esta acción no se puede deshacer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notas_rechazo">Motivo del rechazo (opcional)</Label>
            <Textarea
              id="notas_rechazo"
              placeholder="Indica el motivo al cliente..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
              {isPending ? 'Rechazando…' : 'Confirmar rechazo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
