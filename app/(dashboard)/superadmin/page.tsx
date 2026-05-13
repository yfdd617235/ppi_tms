import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/currency'
import { formatDate } from '@/lib/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingUp, Receipt, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart'
import { CustodyFeeChart } from '@/components/dashboard/custody-fee-chart'
import { CompanyVolumeChart } from '@/components/dashboard/company-volume-chart'
import { Button } from '@/components/ui/button'

// Parsea año y mes directamente del string YYYY-MM-DD sin crear Date (evita desfase UTC)
function monthsBetween(from: string, to: string) {
  const months: string[] = []
  const [fromYear, fromMonth] = from.substring(0, 7).split('-').map(Number)
  const [toYear, toMonth] = to.substring(0, 7).split('-').map(Number)
  let year = fromYear
  let month = fromMonth
  while (year < toYear || (year === toYear && month <= toMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month++
    if (month > 12) { month = 1; year++ }
  }
  return months
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-')
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${names[parseInt(month) - 1]} ${year.slice(2)}`
}

function dayDiff(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000) + 1
}

function daysBetween(from: string, to: string): string[] {
  const days: string[] = []
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const end = Date.UTC(ty, tm - 1, td)
  const cur = new Date(Date.UTC(fy, fm - 1, fd))
  while (cur.getTime() <= end) {
    days.push(cur.toISOString().split('T')[0])
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

function getDayKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function dayLabel(key: string): string {
  const [, month, day] = key.split('-')
  const names = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${day} ${names[parseInt(month) - 1]}`
}

export default async function SuperAdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from, to } = await searchParams

  const now = new Date()
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const defaultTo = now.toISOString().split('T')[0]
  const dateFrom = from ?? defaultFrom
  const dateTo = to ?? defaultTo

  const supabase = await createClient()

  const [
    { count: companiesCount },
    { count: pendingIncome },
    { count: pendingExpense },
    { data: accounts },
    { data: companyBalances },
    { data: ingresosPeriodo },
    { data: egresosPeriodo },
  ] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('activa', true),
    supabase.from('income_requests').select('*', { count: 'exact', head: true }).eq('estado', 'enviado'),
    supabase.from('expense_requests').select('*', { count: 'exact', head: true }).in('estado', ['enviado', 'pendiente', 'cheque_emitido']),
    supabase.from('company_accounts').select('saldo_neto'),
    supabase
      .from('company_accounts')
      .select('saldo_neto, company_id, companies(razon_social)')
      .gt('saldo_neto', '0'),
    supabase
      .from('income_requests')
      .select('verificado_at, valor_real, valor_neto, comision_ppi')
      .eq('estado', 'verificado')
      .gte('verificado_at', dateFrom)
      .lte('verificado_at', dateTo + 'T23:59:59Z'),
    supabase
      .from('expense_requests')
      .select('ejecutado_at, valor')
      .eq('estado', 'ejecutado')
      .gte('ejecutado_at', dateFrom)
      .lte('ejecutado_at', dateTo + 'T23:59:59Z'),
  ])

  // KPIs del período
  const totalNeto = accounts?.reduce((s, a) => s + parseFloat(a.saldo_neto), 0) ?? 0
  const totalProcesado = ingresosPeriodo?.reduce((s, i) => s + parseFloat(i.valor_real ?? '0'), 0) ?? 0
  const tarifasPeriodo = ingresosPeriodo?.reduce((s, i) => s + parseFloat(i.comision_ppi ?? '0'), 0) ?? 0
  const nTransacciones = ingresosPeriodo?.length ?? 0

  // Datos para gráficas: por día si el rango es < 120 días, por mes si es mayor
  const totalDays = dayDiff(dateFrom, dateTo)
  const groupByDay = totalDays < 120

  let barData: { mes: string; ingresos: number; egresos: number }[]
  let lineData: { mes: string; tarifa: number }[]

  if (groupByDay) {
    const days = daysBetween(dateFrom, dateTo)
    const ingByDay: Record<string, number> = {}
    const egByDay:  Record<string, number> = {}
    const tarByDay: Record<string, number> = {}
    days.forEach((d) => { ingByDay[d] = 0; egByDay[d] = 0; tarByDay[d] = 0 })
    ingresosPeriodo?.forEach((i) => {
      if (!i.verificado_at) return
      const k = getDayKey(i.verificado_at)
      if (k in ingByDay) { ingByDay[k] += parseFloat(i.valor_neto ?? '0'); tarByDay[k] += parseFloat(i.comision_ppi ?? '0') }
    })
    egresosPeriodo?.forEach((e) => {
      if (!e.ejecutado_at) return
      const k = getDayKey(e.ejecutado_at)
      if (k in egByDay) egByDay[k] += parseFloat(e.valor)
    })
    barData  = days.map((d) => ({ mes: dayLabel(d), ingresos: ingByDay[d], egresos: egByDay[d] }))
    lineData = days.map((d) => ({ mes: dayLabel(d), tarifa: tarByDay[d] }))
  } else {
    const months = monthsBetween(dateFrom, dateTo)
    const ingresosByMonth: Record<string, number> = {}
    const egresosByMonth: Record<string, number> = {}
    const tarifaByMonth:  Record<string, number> = {}
    months.forEach((m) => { ingresosByMonth[m] = 0; egresosByMonth[m] = 0; tarifaByMonth[m] = 0 })
    ingresosPeriodo?.forEach((i) => {
      if (!i.verificado_at) return
      const k = getMonthKey(i.verificado_at)
      if (k in ingresosByMonth) {
        ingresosByMonth[k] += parseFloat(i.valor_neto ?? '0')
        tarifaByMonth[k]   += parseFloat(i.comision_ppi ?? '0')
      }
    })
    egresosPeriodo?.forEach((e) => {
      if (!e.ejecutado_at) return
      const k = getMonthKey(e.ejecutado_at)
      if (k in egresosByMonth) egresosByMonth[k] += parseFloat(e.valor)
    })
    barData  = months.map((m) => ({ mes: monthLabel(m), ingresos: ingresosByMonth[m], egresos: egresosByMonth[m] }))
    lineData = months.map((m) => ({ mes: monthLabel(m), tarifa: tarifaByMonth[m] }))
  }

  const xAxisInterval = groupByDay ? Math.max(0, Math.ceil(totalDays / 12) - 1) : 0

  const companyMap: Record<string, { empresa: string; valor: number }> = {}
  companyBalances?.forEach((ca) => {
    const nombre = (ca.companies as any)?.razon_social ?? 'Sin nombre'
    if (!companyMap[ca.company_id]) companyMap[ca.company_id] = { empresa: nombre, valor: 0 }
    companyMap[ca.company_id].valor += parseFloat(ca.saldo_neto)
  })
  const pieData = Object.values(companyMap).filter((c) => c.valor > 0).sort((a, b) => b.valor - a.valor)

  const isDefaultPeriod = dateFrom === defaultFrom && dateTo === defaultTo
  const periodoLabel = isDefaultPeriod
    ? 'Este mes'
    : `${formatDate(dateFrom)} — ${formatDate(dateTo)}`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Panel de control</h1>
        <p className="text-sm text-muted-foreground">Resumen global de todas las cuentas</p>
      </div>

      {/* KPIs siempre actuales (independientes del filtro) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/superadmin/empresas">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empresas activas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{companiesCount ?? 0}</p></CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/ingresos">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos por verificar</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{pendingIncome ?? 0}</p></CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/egresos">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Egresos pendientes</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{pendingExpense ?? 0}</p></CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/empresas">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total en custodia</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatCOP(totalNeto)}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Filtro de período + KPIs analíticos + Gráficas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {periodoLabel}
          </h2>
          <form method="get" className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground whitespace-nowrap">Desde</label>
              <div>
                <input
                  type="date"
                  name="from"
                  lang="es-CO"
                  defaultValue={dateFrom}
                  className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground whitespace-nowrap">Hasta</label>
              <div>
                <input
                  type="date"
                  name="to"
                  lang="es-CO"
                  defaultValue={dateTo}
                  className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <Button type="submit" size="sm" variant="default" className="hover:bg-primary/80">Aplicar</Button>
          </form>
        </div>

        {/* KPIs del período */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total procesado</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCOP(totalProcesado)}</p>
              <p className="text-xs text-muted-foreground mt-1">En ingresos verificados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarifas cobradas</CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCOP(tarifasPeriodo)}</p>
              <p className="text-xs text-muted-foreground mt-1">Tarifa de custodia</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos verificados</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{nTransacciones}</p>
              <p className="text-xs text-muted-foreground mt-1">Transacciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ingresos vs Egresos</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={barData} interval={xAxisInterval} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tarifa de custodia cobrada</CardTitle>
            </CardHeader>
            <CardContent>
              <CustodyFeeChart data={lineData} interval={xAxisInterval} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribución del saldo en custodia por cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyVolumeChart data={pieData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
