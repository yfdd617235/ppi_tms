'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBeneficiary } from '@/app/(dashboard)/cliente/beneficiarios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function BeneficiaryForm() {
  const [tipo, setTipo] = useState<'cheque' | 'transferencia' | ''>('')
  const [nombre, setNombre] = useState('')
  const [cedulaNit, setCedulaNit] = useState('')
  const [entidad, setEntidad] = useState('')
  const [tipoCuenta, setTipoCuenta] = useState('')
  const [numCuenta, setNumCuenta] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!tipo) { setError('Selecciona el tipo de beneficiario.'); return }
    if (!nombre.trim()) { setError('El nombre es requerido.'); return }
    if (!cedulaNit.trim()) { setError('La cédula o NIT es requerida.'); return }
    if (tipo === 'transferencia') {
      if (!entidad.trim()) { setError('La entidad financiera es requerida para transferencias.'); return }
      if (!tipoCuenta) { setError('El tipo de cuenta es requerido para transferencias.'); return }
      if (!numCuenta.trim()) { setError('El número de cuenta es requerido para transferencias.'); return }
    }

    const fd = new FormData()
    fd.set('tipo', tipo)
    fd.set('nombre', nombre)
    fd.set('cedula_nit', cedulaNit)
    if (tipo === 'transferencia') {
      fd.set('entidad_financiera', entidad)
      fd.set('tipo_cuenta', tipoCuenta)
      fd.set('numero_cuenta', numCuenta)
    }

    startTransition(async () => {
      const result = await createBeneficiary(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label>Tipo de beneficiario</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v as 'cheque' | 'transferencia')} required>
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
        <Label>Nombre / Razón social</Label>
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo o empresa"
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Cédula / NIT</Label>
        <Input
          value={cedulaNit}
          onChange={(e) => setCedulaNit(e.target.value)}
          placeholder="123456789"
          maxLength={20}
          required
        />
      </div>

      {tipo === 'transferencia' && (
        <>
          <div className="space-y-1.5">
            <Label>Entidad financiera</Label>
            <Input
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              placeholder="Bancolombia, Davivienda…"
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de cuenta</Label>
            <Select value={tipoCuenta} onValueChange={setTipoCuenta}>
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
            <Input
              value={numCuenta}
              onChange={(e) => setNumCuenta(e.target.value)}
              placeholder="000-000000-00"
              maxLength={30}
            />
          </div>
        </>
      )}

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !tipo}>
          {isPending ? 'Guardando…' : 'Guardar beneficiario'}
        </Button>
      </div>
    </form>
  )
}
