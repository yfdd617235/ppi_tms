'use client'

import { useState, useRef, useTransition } from 'react'
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
import { Paperclip, X } from 'lucide-react'

interface Account {
  id: string
  nombre: string
  nombre_banco: string | null
  numero_cuenta: string | null
  tipo_cuenta: string | null
}

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

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export default function IncomeForm({ accounts }: Props) {
  const [accountId, setAccountId] = useState('')
  const [valorDisplay, setValorDisplay] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValorDisplay(formatInputCurrency(e.target.value))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (!f) { setFile(null); return }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Solo se permiten archivos PDF, JPG o PNG.')
      e.target.value = ''
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar los 10 MB.')
      e.target.value = ''
      return
    }
    setError(null)
    setFile(f)
  }

  function handleRemoveFile() {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
    if (file) fd.set('soporte', file)

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
              <SelectItem key={acc.id} value={acc.id}>
                <span>{acc.nombre}</span>
                {acc.nombre_banco && (
                  <span className="text-muted-foreground ml-1.5">
                    — {acc.nombre_banco}
                    {acc.tipo_cuenta && ` (${acc.tipo_cuenta === 'corriente' ? 'Cte.' : 'Ahorro'})`}
                    {acc.numero_cuenta && ` #${acc.numero_cuenta}`}
                  </span>
                )}
              </SelectItem>
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
        {file ? (
          <div className="flex items-center gap-2 p-2.5 rounded-md border border-border bg-muted/30 text-sm">
            <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 text-foreground">{file.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="soporte"
            className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Adjunta el comprobante de pago
            </span>
            <span className="text-xs text-muted-foreground">PDF, JPG o PNG · máx. 10 MB</span>
            <input
              id="soporte"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
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
