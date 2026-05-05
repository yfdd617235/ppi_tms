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

  const [{ data: caRows }, { data: beneficiarios }] = await Promise.all([
    supabase.from('company_accounts')
      .select('account_id, saldo_disponible, accounts(id, nombre, nombre_banco, numero_cuenta, tipo_cuenta)')
      .eq('company_id', profile.company_id)
      .eq('activa', true),
    supabase.from('beneficiaries').select('id, nombre, tipo, cedula_nit, entidad_financiera, tipo_cuenta, numero_cuenta').eq('company_id', profile.company_id).eq('activo', true).order('nombre'),
  ])

  const accounts = (caRows ?? []).map((ca) => {
    const a = ca.accounts as { id: string; nombre: string; nombre_banco: string | null; numero_cuenta: string | null; tipo_cuenta: string | null } | null
    return {
      id: a?.id ?? '',
      nombre: a?.nombre ?? '',
      saldo_disponible: ca.saldo_disponible as string,
      nombre_banco: a?.nombre_banco ?? null,
      numero_cuenta: a?.numero_cuenta ?? null,
      tipo_cuenta: a?.tipo_cuenta ?? null,
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
