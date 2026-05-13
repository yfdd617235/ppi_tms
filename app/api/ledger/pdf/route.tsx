import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { StatementDocument, StatementRow } from '@/lib/pdf/statement-document'
import fs from 'fs'
import path from 'path'
import React, { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

async function buildLogoPng(): Promise<Buffer | null> {
  try {
    const sharp = (await import('sharp')).default
    const svgPath = path.join(process.cwd(), 'public', 'logoA.svg')
    const svgBuffer = fs.readFileSync(svgPath)
    return await sharp(svgBuffer).resize(80, 80).png().toBuffer()
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()
  if (!profile) return new Response('Forbidden', { status: 403 })

  const { searchParams } = req.nextUrl
  const companyIdParam = searchParams.get('company_id')
  const today = new Date()
  const dateFrom = searchParams.get('from') ??
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const dateTo = searchParams.get('to') ?? today.toISOString().split('T')[0]

  if (profile.role === 'client' && companyIdParam && companyIdParam !== profile.company_id) {
    return new Response('Forbidden', { status: 403 })
  }

  const effectiveCompanyId =
    profile.role === 'client' ? profile.company_id : (companyIdParam ?? null)

  const ingresoQuery = supabase
    .from('income_requests')
    .select('id, verificado_at, valor_neto, comision_ppi, impuesto_4x1000, descripcion, companies(razon_social), accounts(nombre)')
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

  type EntryBase = Omit<StatementRow, 'balance'>

  const entries: EntryBase[] = [
    ...(ingresos ?? []).map((i) => ({
      date: i.verificado_at!,
      tipo: 'ingreso' as const,
      empresa: (i.companies as any)?.razon_social ?? '',
      descripcion: i.descripcion ?? 'Ingreso verificado',
      cuenta: (i.accounts as any)?.nombre ?? '',
      cargo: 0,
      abono: parseFloat(i.valor_neto ?? '0'),
      tarifa: parseFloat(i.comision_ppi ?? '0'),
      impuesto: parseFloat(i.impuesto_4x1000 ?? '0'),
    })),
    ...(egresos ?? []).map((e) => ({
      date: e.ejecutado_at!,
      tipo: 'egreso' as const,
      empresa: (e.companies as any)?.razon_social ?? '',
      descripcion: (e.beneficiaries as any)?.nombre
        ? `Pago a ${(e.beneficiaries as any).nombre}`
        : (e.descripcion ?? 'Egreso ejecutado'),
      cuenta: (e.accounts as any)?.nombre ?? '',
      cargo: parseFloat(e.valor),
      abono: 0,
      tarifa: 0,
      impuesto: 0,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let balance = 0
  const rows: StatementRow[] = entries.map((r) => {
    balance += r.abono - r.cargo
    return { ...r, balance }
  })

  let titular: string | null = null
  let titularNit: string | null = null
  if (effectiveCompanyId) {
    const { data: company } = await supabase
      .from('companies')
      .select('razon_social, nit')
      .eq('id', effectiveCompanyId)
      .single()
    titular = company?.razon_social ?? null
    titularNit = company?.nit ?? null
  }

  const logoPng = await buildLogoPng()

  const pdfElement = React.createElement(StatementDocument, {
    logoPng,
    titular,
    titularNit,
    dateFrom,
    dateTo,
    rows,
    showEmpresaCol: !effectiveCompanyId,
  }) as ReactElement<DocumentProps>

  const pdfBuffer = await renderToBuffer(pdfElement)

  const filename = `extracto-${dateFrom}-${dateTo}.pdf`

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
