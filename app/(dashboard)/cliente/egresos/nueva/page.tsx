import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpenseForm from '@/components/egresos/expense-form'

export default async function NuevoEgresoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) redirect('/cliente')

  const [{ data: caRows }, { data: beneficiarios }, { data: pendingRows }] = await Promise.all([
    supabase.from('company_accounts')
      .select('account_id, saldo_bruto, saldo_neto, egreso_a_discrecion, accounts(id, nombre, nombre_banco, numero_cuenta, tipo_cuenta)')
      .eq('company_id', profile.company_id)
      .eq('activa', true),
    supabase.from('beneficiaries').select('id, nombre, tipo, cedula_nit, entidad_financiera, tipo_cuenta, numero_cuenta, punto_entrega').eq('company_id', profile.company_id).eq('activo', true).order('nombre'),
    supabase.from('expense_requests').select('account_id, valor').eq('company_id', profile.company_id).in('estado', ['pendiente', 'enviado']),
  ])

  const frozenByAccount = new Map<string, number>()
  for (const row of pendingRows ?? []) {
    const prev = frozenByAccount.get(row.account_id) ?? 0
    frozenByAccount.set(row.account_id, prev + parseFloat(row.valor))
  }

  const accounts = (caRows ?? []).map((ca) => {
    const a = ca.accounts as { id: string; nombre: string; nombre_banco: string | null; numero_cuenta: string | null; tipo_cuenta: string | null } | null
    const saldoNeto = parseFloat(ca.saldo_neto as string)
    const frozen = frozenByAccount.get(ca.account_id) ?? 0
    return {
      id: a?.id ?? '',
      nombre: a?.nombre ?? '',
      saldo_bruto: ca.saldo_bruto as string,
      saldo_neto: ca.saldo_neto as string,
      saldo_disponible: Math.max(0, saldoNeto - frozen).toString(),
      nombre_banco: a?.nombre_banco ?? null,
      numero_cuenta: a?.numero_cuenta ?? null,
      tipo_cuenta: a?.tipo_cuenta ?? null,
      egreso_a_discrecion: ca.egreso_a_discrecion as boolean,
    }
  }).filter((a) => a.id)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nueva solicitud de egreso</h1>
        <p className="text-sm text-muted-foreground">
          Solicita un pago a un beneficiario desde tus cuentas en PPI.
        </p>
      </div>
      <ExpenseForm
        accounts={accounts}
        beneficiarios={beneficiarios ?? []}
        userId={user.id}
        companyId={profile.company_id}
      />
    </div>
  )
}
