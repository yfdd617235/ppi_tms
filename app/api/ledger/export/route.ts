import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, company_id').eq('id', user.id).single()
  if (!profile) return new Response('Forbidden', { status: 403 })

  const { searchParams } = req.nextUrl
  const companyIdParam = searchParams.get('company_id')
  const dateFrom = searchParams.get('from') ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const dateTo = searchParams.get('to') ?? new Date().toISOString().split('T')[0]

  // Clients can only export their own company
  if (profile.role === 'client' && companyIdParam && companyIdParam !== profile.company_id) {
    return new Response('Forbidden', { status: 403 })
  }

  const effectiveCompanyId =
    profile.role === 'client'
      ? profile.company_id
      : companyIdParam ?? null

  const ingresoQuery = supabase
    .from('income_requests')
    .select('id, verificado_at, valor_real, valor_neto, comision_ppi, impuesto_4x1000, descripcion, companies(razon_social), accounts(nombre)')
    .eq('estado', 'verificado')
    .gte('verificado_at', dateFrom)
    .lte('verificado_at', dateTo + 'T23:59:59Z')
    .order('verificado_at')

  const egresoQuery = supabase
    .from('expense_requests')
    .select('id, ejecutado_at, valor, descripcion, companies(razon_social), accounts(nombre), beneficiaries(nombre)')
    .eq('estado', 'ejecutado')
    .gte('ejecutado_at', dateFrom)
    .lte('ejecutado_at', dateTo + 'T23:59:59Z')
    .order('ejecutado_at')

  if (effectiveCompanyId) {
    ingresoQuery.eq('company_id', effectiveCompanyId)
    egresoQuery.eq('company_id', effectiveCompanyId)
  }

  const [{ data: ingresos }, { data: egresos }] = await Promise.all([ingresoQuery, egresoQuery])

  type Row = { date: string; empresa: string; tipo: string; descripcion: string; cuenta: string; cargo: number; abono: number; tarifa: number; impuesto: number }

  const entries: Row[] = [
    ...(ingresos ?? []).map((i) => ({
      date: i.verificado_at!,
      empresa: (i.companies as any)?.razon_social ?? '',
      tipo: 'Ingreso',
      descripcion: i.descripcion ?? 'Ingreso verificado',
      cuenta: (i.accounts as any)?.nombre ?? '',
      cargo: 0,
      abono: parseFloat(i.valor_neto ?? '0'),
      tarifa: parseFloat(i.comision_ppi ?? '0'),
      impuesto: parseFloat(i.impuesto_4x1000 ?? '0'),
    })),
    ...(egresos ?? []).map((e) => ({
      date: e.ejecutado_at!,
      empresa: (e.companies as any)?.razon_social ?? '',
      tipo: 'Egreso',
      descripcion: (e.beneficiaries as any)?.nombre ? `Pago a ${(e.beneficiaries as any).nombre}` : (e.descripcion ?? 'Egreso ejecutado'),
      cuenta: (e.accounts as any)?.nombre ?? '',
      cargo: parseFloat(e.valor),
      abono: 0,
      tarifa: 0,
      impuesto: 0,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let balance = 0
  const rows = entries.map((r) => {
    balance += r.abono - r.cargo
    return { ...r, balance }
  })

  const fmt = (n: number) => n > 0 ? n.toFixed(2) : ''
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`

  const header = ['Fecha', 'Empresa', 'Tipo', 'Descripcion', 'Cuenta', 'Cargo', 'Abono', 'Tarifa custodia', '4x1000', 'Saldo acumulado']
  const csvRows = rows.map((r) => [
    r.date.split('T')[0],
    escape(r.empresa),
    r.tipo,
    escape(r.descripcion),
    escape(r.cuenta),
    fmt(r.cargo),
    fmt(r.abono),
    fmt(r.tarifa),
    fmt(r.impuesto),
    r.balance.toFixed(2),
  ].join(','))

  const csv = [header.join(','), ...csvRows].join('\n')
  const filename = `estado-cuenta-${dateFrom}-${dateTo}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
