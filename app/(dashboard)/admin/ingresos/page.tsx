import { createClient } from '@/lib/supabase/server'
import { IngresosAdminTable } from '@/components/ingresos/ingresos-admin-table'
import { DataPagination } from '@/components/ui/data-pagination'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 20

export default async function AdminIngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string; empresa?: string; page?: string }>
}) {
  const { estado, desde, hasta, empresa, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)
  const rangeFrom = (page - 1) * PAGE_SIZE
  const rangeTo = rangeFrom + PAGE_SIZE - 1

  const supabase = await createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, razon_social')
    .eq('activa', true)
    .order('razon_social')

  let query = supabase
    .from('income_requests')
    .select('*, accounts(nombre), companies(razon_social)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (estado && estado !== 'todos') query = query.eq('estado', estado)
  if (empresa) query = query.eq('company_id', empresa)
  if (desde) query = query.gte('created_at', desde)
  if (hasta) query = query.lte('created_at', hasta + 'T23:59:59Z')
  query = query.range(rangeFrom, rangeTo)

  const { data: ingresos, count } = await query

  const baseParams: Record<string, string> = {}
  if (estado && estado !== 'todos') baseParams.estado = estado
  if (empresa) baseParams.empresa = empresa
  if (desde) baseParams.desde = desde
  if (hasta) baseParams.hasta = hasta

  const hasFilters = estado || empresa || desde || hasta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ingresos</h1>
        <p className="text-sm text-muted-foreground">Historial de todas las solicitudes de ingreso</p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 text-sm">
          <label className="text-muted-foreground">Empresa</label>
          <select
            name="empresa"
            defaultValue={empresa ?? ''}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todas</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>{c.razon_social}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <label className="text-muted-foreground">Estado</label>
          <select
            name="estado"
            defaultValue={estado ?? ''}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos</option>
            <option value="enviado">En revisión</option>
            <option value="verificado">Verificado</option>
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

      <IngresosAdminTable ingresos={ingresos ?? []} readOnly />

      <DataPagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} baseParams={baseParams} />
    </div>
  )
}
