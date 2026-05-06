'use client'

import { formatCOP } from '@/lib/currency'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { VerifyIncomeDialog } from './verify-income-dialog'
import { RejectIncomeDialog } from './reject-income-dialog'
import { Paperclip } from 'lucide-react'
import type { IncomeStatus } from '@/types'
import { formatDate } from '@/lib/date'

const estadoConfig: Record<IncomeStatus, { label: string; className: string }> = {
  borrador:   { label: 'Borrador',    className: 'bg-gray-50 text-gray-600 border-gray-200' },
  enviado:    { label: 'En revisión', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  verificado: { label: 'Verificado',  className: 'bg-green-50 text-green-700 border-green-200' },
  rechazado:  { label: 'Rechazado',   className: 'bg-red-50 text-red-700 border-red-200' },
}

interface IncomeRow {
  id: string
  estado: string
  valor_cliente: string
  valor_real: string | null
  valor_neto: string | null
  soporte_url: string | null
  soporte_nombre: string | null
  notas_admin: string | null
  created_at: string
  accounts: { nombre: string } | null
  companies: { razon_social: string } | null
}

export function IngresosAdminTable({ ingresos, readOnly = false }: { ingresos: IncomeRow[]; readOnly?: boolean }) {
  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Empresa</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead className="text-right">Valor cliente</TableHead>
            <TableHead className="text-right">Valor real</TableHead>
            <TableHead className="text-right">Valor neto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingresos.map((ingreso) => {
            const config = estadoConfig[ingreso.estado as IncomeStatus]
            const empresa = ingreso.companies?.razon_social ?? '—'
            const canAct = !readOnly && ingreso.estado === 'enviado'

            return (
              <TableRow
                key={ingreso.id}
                className={cn(ingreso.estado === 'verificado' && 'bg-green-50/50')}
              >
                <TableCell className="font-medium text-sm">{empresa}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ingreso.accounts?.nombre ?? '—'}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatCOP(parseFloat(ingreso.valor_cliente))}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {ingreso.valor_real ? formatCOP(parseFloat(ingreso.valor_real)) : '—'}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {ingreso.valor_neto ? formatCOP(parseFloat(ingreso.valor_neto)) : '—'}
                </TableCell>
                <TableCell>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs border', config.className)}>
                    {config.label}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(ingreso.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    {ingreso.soporte_url && (
                      <a
                        href={`/api/storage/proof?path=${encodeURIComponent(ingreso.soporte_url)}&bucket=payment-proofs`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={ingreso.soporte_nombre ?? 'Ver soporte'}
                        className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {canAct && (
                      <>
                        <VerifyIncomeDialog
                          incomeId={ingreso.id}
                          empresa={empresa}
                          valorCliente={parseFloat(ingreso.valor_cliente)}
                        />
                        <RejectIncomeDialog
                          incomeId={ingreso.id}
                          empresa={empresa}
                        />
                      </>
                    )}
                    {ingreso.estado === 'rechazado' && ingreso.notas_admin && (
                      <span className="text-xs text-muted-foreground italic truncate max-w-[120px]" title={ingreso.notas_admin}>
                        {ingreso.notas_admin}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {ingresos.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">
                No hay ingresos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
