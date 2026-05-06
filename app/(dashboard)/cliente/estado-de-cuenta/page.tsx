import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCOP } from '@/lib/currency'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default async function ClienteEstadoCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; tipo?: string }>
}) {
  const { from, to, tipo } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground text-sm">Tu cuenta aún no tiene una empresa asignada.</p>
      </div>
    )
  }

  const today = new Date()
  const defaultTo = today.toISOString().split('T')[0]
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const dateFrom = from ?? defaultFrom
  const dateTo = to ?? defaultTo

  const [{ data: ingresos }, { data: egresos }] = await Promise.all([
    supabase
      .from('income_requests')
      .select('id, verificado_at, valor_real, valor_neto, comision_ppi, impuesto_4x1000, comision_rate, descripcion, accounts(nombre)')
      .eq('company_id', profile.company_id)
      .eq('estado', 'verificado')
      .gte('verificado_at', dateFrom)
      .lte('verificado_at', dateTo + 'T23:59:59Z')
      .order('verificado_at'),
    supabase
      .from('expense_requests')
      .select('id, ejecutado_at, valor, descripcion, accounts(nombre), beneficiaries(nombre)')
      .eq('company_id', profile.company_id)
      .eq('estado', 'ejecutado')
      .gte('ejecutado_at', dateFrom)
      .lte('ejecutado_at', dateTo + 'T23:59:59Z')
      .order('ejecutado_at'),
  ])

  type Entry = {
    id: string; date: string; tipo: 'ingreso' | 'egreso'; descripcion: string
    cuenta: string; cargo: number; abono: number; tarifa: number; impuesto: number; comisionRate: number
  }

  const entries: Entry[] = [
    ...(ingresos ?? []).map((i) => ({
      id: i.id,
      date: i.verificado_at!,
      tipo: 'ingreso' as const,
      descripcion: i.descripcion ?? 'Ingreso verificado',
      cuenta: (i.accounts as any)?.nombre ?? '—',
      cargo: 0,
      abono: parseFloat(i.valor_neto ?? '0'),
      tarifa: parseFloat(i.comision_ppi ?? '0'),
      impuesto: parseFloat(i.impuesto_4x1000 ?? '0'),
      comisionRate: parseFloat(i.comision_rate ?? '0.008') * 100,
    })),
    ...(egresos ?? []).map((e) => ({
      id: e.id,
      date: e.ejecutado_at!,
      tipo: 'egreso' as const,
      descripcion: (e.beneficiaries as any)?.nombre ? `Pago a ${(e.beneficiaries as any).nombre}` : (e.descripcion ?? 'Egreso ejecutado'),
      cuenta: (e.accounts as any)?.nombre ?? '—',
      cargo: parseFloat(e.valor),
      abono: 0,
      tarifa: 0,
      impuesto: 0,
      comisionRate: 0,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const filteredEntries = (tipo === 'ingreso' || tipo === 'egreso')
    ? entries.filter((e) => e.tipo === tipo)
    : entries

  let balance = 0
  const rows = filteredEntries
    .map((entry) => {
      balance += entry.abono - entry.cargo
      return { ...entry, balance }
    })
    .reverse()

  const exportUrl = `/api/ledger/export?company_id=${profile.company_id}&from=${dateFrom}&to=${dateTo}`

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Estado de cuenta</h1>
          <p className="text-sm text-muted-foreground">Historial detallado de tus movimientos</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={exportUrl} download>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar CSV
          </a>
        </Button>
      </div>

      <form method="get" className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground whitespace-nowrap">Desde</label>
          <div>
            <input
              type="date"
              name="from"
              defaultValue={dateFrom}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 text-center">{formatDate(dateFrom)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground whitespace-nowrap">Hasta</label>
          <div>
            <input
              type="date"
              name="to"
              defaultValue={dateTo}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 text-center">{formatDate(dateTo)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground whitespace-nowrap">Tipo</label>
          <select
            name="tipo"
            defaultValue={tipo ?? ''}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>
        <Button type="submit" size="sm" variant="secondary">Filtrar</Button>
      </form>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Cargo</TableHead>
              <TableHead className="text-right">Abono</TableHead>
              <TableHead className="text-right">Tarifa custodia</TableHead>
              <TableHead className="text-right">4×1000</TableHead>
              <TableHead className="text-right font-semibold">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className={cn(row.tipo === 'ingreso' ? 'bg-green-50/30' : 'bg-red-50/20')}>
                <TableCell className="text-sm whitespace-nowrap">{formatDate(row.date)}</TableCell>
                <TableCell>
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs border',
                    row.tipo === 'ingreso'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  )}>
                    {row.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                  </span>
                </TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">{row.descripcion}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.cuenta}</TableCell>
                <TableCell className="text-right text-sm text-red-600 font-medium">
                  {row.cargo > 0 ? formatCOP(row.cargo) : '—'}
                </TableCell>
                <TableCell className="text-right text-sm text-green-600 font-medium">
                  {row.abono > 0 ? formatCOP(row.abono) : '—'}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {row.tarifa > 0 ? (
                    <span title={`${row.comisionRate.toFixed(2)}% de custodia`}>
                      {formatCOP(row.tarifa)}
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {row.impuesto > 0 ? formatCOP(row.impuesto) : '—'}
                </TableCell>
                <TableCell className="text-right text-sm font-bold">
                  {formatCOP(row.balance)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-12 text-sm">
                  No hay movimientos finalizados en el rango de fechas seleccionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
