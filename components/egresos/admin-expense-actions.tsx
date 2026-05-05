'use client'

import { useState, useRef, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatCOP } from '@/lib/currency'
import { Paperclip, X, CheckCircle, XCircle } from 'lucide-react'
import { executeExpenseRequest, rejectExpenseRequest } from '@/app/(dashboard)/superadmin/egresos/actions'
import { toast } from 'sonner'
import { formatDate } from '@/lib/date'

interface Props {
  egreso: {
    id: string
    valor: string
    tipo_pago: string
    companies: { razon_social: string } | null
    beneficiaries: { nombre: string; cedula_nit: string; entidad_financiera: string | null; numero_cuenta: string | null } | null
    nuevo_beneficiario_nombre: string | null
    nuevo_beneficiario_cedula_nit: string | null
    nuevo_beneficiario_entidad: string | null
    nuevo_beneficiario_numero_cuenta: string | null
    fecha_programada: string | null
    programacion: string | null
  }
}

export default function AdminExpenseActions({ egreso }: Props) {
  const [showExecute, setShowExecute] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [nota, setNota] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const beneficiarioNombre = egreso.beneficiaries?.nombre || egreso.nuevo_beneficiario_nombre || '—'
  const beneficiarioDoc = egreso.beneficiaries?.cedula_nit || egreso.nuevo_beneficiario_cedula_nit || '—'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (!f) { setFile(null); return }
    if (f.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar los 10 MB.')
      return
    }
    setError(null)
    setFile(f)
  }

  async function onExecute() {
    if (!file) {
      setError('Debes subir la evidencia del pago.')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set('id', egreso.id)
        fd.set('evidencia', file)
        fd.set('notas_admin', nota)

        const result = await executeExpenseRequest(fd)
        if (result.error) {
          setError(result.error)
        } else {
          toast.success('Egreso ejecutado correctamente')
          setShowExecute(false)
        }
      } catch (err: any) {
        setError(err.message || 'Error inesperado')
      }
    })
  }

  async function onReject() {
    if (!nota) {
      setError('La nota de rechazo es obligatoria.')
      return
    }

    startTransition(async () => {
      const result = await rejectExpenseRequest(egreso.id, nota)
      if (result.error) {
        setError(result.error)
      } else {
        toast.success('Egreso rechazado')
        setShowReject(false)
      }
    })
  }

  return (
    <>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 h-8 gap-1"
          onClick={() => {
            setError(null)
            setFile(null)
            setNota('')
            setShowExecute(true)
          }}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Ejecutar
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-destructive border-destructive/20 hover:bg-destructive/5 gap-1"
          onClick={() => {
            setError(null)
            setNota('')
            setShowReject(true)
          }}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rechazar
        </Button>
      </div>

      {/* Dialog Ejecutar */}
      <Dialog open={showExecute} onOpenChange={setShowExecute}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ejecutar Pago</DialogTitle>
            <DialogDescription>
              Confirma que el pago ha sido realizado y adjunta el comprobante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-xs p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <p className="text-muted-foreground">Empresa</p>
                <p className="font-medium">{egreso.companies?.razon_social}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-bold text-primary">{formatCOP(parseFloat(egreso.valor))}</p>
              </div>
              <div className="col-span-2 border-t pt-2 mt-1 flex justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-[10px]">Beneficiario</p>
                  <p className="font-medium text-xs">{beneficiarioNombre}</p>
                  <p className="text-[10px] text-muted-foreground">{beneficiarioDoc}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-[10px]">Programación</p>
                  {egreso.programacion === 'programado' ? (
                    <p className="font-bold text-blue-600 text-xs">Prog: {formatDate(egreso.fecha_programada)}</p>
                  ) : egreso.programacion === 'discrecion' ? (
                    <p className="font-bold text-amber-600 text-xs italic">A discreción PPI</p>
                  ) : (
                    <p className="font-bold text-green-600 text-xs">Inmediato</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Evidencia de pago</Label>
              {file ? (
                <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30 text-xs">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted/10 transition-colors">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center">Haz clic para subir el comprobante de transferencia o cheque</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea 
                id="notas" 
                placeholder="Nro de operación, observaciones..." 
                className="text-xs min-h-[60px]" 
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>

          <DialogFooter showCloseButton>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={onExecute} 
              disabled={isPending || !file}
            >
              {isPending ? 'Procesando...' : 'Confirmar ejecución'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo para informar al cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="motivo">Motivo del rechazo</Label>
              <Textarea 
                id="motivo" 
                placeholder="Saldo insuficiente, datos de beneficiario erróneos, etc." 
                className="text-xs min-h-[100px]"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>

          <DialogFooter showCloseButton>
            <Button variant="destructive" onClick={onReject} disabled={isPending || !nota}>
              {isPending ? 'Procesando...' : 'Rechazar solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
