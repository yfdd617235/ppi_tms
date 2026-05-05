import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/currency'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ExpenseStatus } from '@/types'

const estadoConfig: Record<ExpenseStatus, { label: string; className: string }> = {
  borrador:  { label: 'Borrador',  className: 'bg-gray-50 text-gray-600 border-gray-200' },
  enviado:   { label: 'Enviado',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  pendiente: { label: 'Pendiente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  ejecutado: { label: 'Ejecutado', className: 'bg-green-50 text-green-700 border-green-200' },
  rechazado: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default async function SuperAdminEgresosPage() {
  const supabase = await createClient()
  const { data: egresos } = await supabase
    .from('expense_requests')
    .select('*, accounts(nombre), companies(razon_social)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Egresos</h1>
        <p className="text-sm text-muted-foreground">Todas las solicitudes de egreso</p>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Empresa</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Tipo pago</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha solicitado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {egresos?.map((egreso) => {
              const config = estadoConfig[egreso.estado as ExpenseStatus]
              return (
                <TableRow
                  key={egreso.id}
                  className={cn(egreso.estado === 'ejecutado' && 'bg-green-50/50')}
                >
                  <TableCell className="font-medium text-sm">
                    {(egreso.companies as { razon_social: string } | null)?.razon_social ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(egreso.accounts as { nombre: string } | null)?.nombre ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm capitalize">{egreso.tipo_pago}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCOP(parseFloat(egreso.valor))}</TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs border', config.className)}>
                      {config.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(egreso.created_at).toLocaleDateString('es-CO')}
                  </TableCell>
                </TableRow>
              )
            })}
            {(!egresos || egresos.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                  No hay egresos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
