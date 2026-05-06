import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCOP } from '@/lib/currency'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataPagination } from '@/components/ui/data-pagination'
import { cn } from '@/lib/utils'
import { Plus, Paperclip } from 'lucide-react'
import type { ExpenseStatus } from '@/types'
import { formatDate } from '@/lib/date'

const PAGE_SIZE = 20

const estadoConfig: Record<ExpenseStatus, { label: string; className: string }> = {
  borrador:  { label: 'Borrador',  className: 'bg-gray-50 text-gray-600 border-gray-200' },
  enviado:   { label: 'Enviado',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  pendiente: { label: 'Pendiente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  ejecutado: { label: 'Ejecutado', className: 'bg-green-50 text-green-700 border-green-200' },
  rechazado: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default async function ClienteEgresosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string; page?: string }>
}) {
  const { estado, desde, hasta, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)
  const rangeFrom = (page - 1) * PAGE_SIZE
  const rangeTo = rangeFrom + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) redirect('/cliente')

  let query = supabase
    .from('expense_requests')
    .select('*, accounts(nombre, company_accounts(egreso_a_discrecion))', { count: 'exact' })
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  if (estado && estado !== 'todos') query = query.eq('estado', estado)
  if (desde) query = query.gte('created_at', desde)
  if (hasta) query = query.lte('created_at', hasta + 'T23:59:59Z')
  query = query.range(rangeFrom, rangeTo)

  const { data: egresos, count } = await query

  const baseParams: Record<string, string> = {}
  if (estado && estado !== 'todos') baseParams.estado = estado
  if (desde) baseParams.desde = desde
  if (hasta) baseParams.hasta = hasta

  const hasFilters = estado || desde || hasta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mis egresos</h1>
          <p className="text-sm text-muted-foreground">Historial de pagos solicitados</p>
        </div>
        <Button asChild size="sm">
          <Link href="/cliente/egresos/nueva">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva solicitud
          </Link>
        </Button>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 text-sm">
          <label className="text-muted-foreground">Estado</label>
          <select
            name="estado"
            defaultValue={estado ?? ''}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos</option>
            <option value="enviado">Enviado</option>
            <option value="pendiente">Pendiente</option>
            <option value="ejecutado">Ejecutado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <label className="text-muted-foreground">Desde</label>
          <input
            type="date"
            name="desde"
            defaultValue={desde ?? ''}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <label className="text-muted-foreground">Hasta</label>
          <input
            type="date"
            name="hasta"
            defaultValue={hasta ?? ''}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" size="sm" variant="secondary">Filtrar</Button>
          {hasFilters && (
            <Button asChild size="sm" variant="ghost">
              <a href="?">Limpiar</a>
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Cuenta</TableHead>
              <TableHead>Tipo pago</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Soporte</TableHead>
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
                  <TableCell className="text-sm text-muted-foreground">
                    {(egreso.accounts as { nombre: string } | null)?.nombre ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm capitalize">{egreso.tipo_pago}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCOP(parseFloat(egreso.valor))}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {egreso.descripcion ?? '—'}
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs border', config.className)}>
                      {config.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    <div className="font-medium text-foreground">{formatDate(egreso.created_at)}</div>
                    <div className="text-[10px] flex flex-col gap-0.5 mt-1">
                      {egreso.programacion === 'programado' ? (
                        <span className="text-blue-600 font-semibold bg-blue-50 px-1 rounded w-fit">
                          Prog: {formatDate(egreso.fecha_programada)}
                        </span>
                      ) : egreso.programacion === 'discrecion' ? (
                        <span className="text-amber-600 bg-amber-50 px-1 rounded w-fit italic">
                          A discreción PPI
                        </span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-1 rounded w-fit">
                          Inmediato
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {egreso.evidencia_url && (
                      <a
                        href={`/api/storage/proof?path=${egreso.evidencia_url}&bucket=payment-evidence`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        title="Ver evidencia de pago"
                      >
                        <Paperclip className="w-4 h-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {(!egresos || egresos.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-sm">
                  {hasFilters ? 'No hay egresos que coincidan con los filtros.' : 'No hay egresos registrados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataPagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} baseParams={baseParams} />
    </div>
  )
}
