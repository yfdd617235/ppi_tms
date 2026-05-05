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

  const [{ data: accounts }, { data: beneficiarios }] = await Promise.all([
    supabase.from('accounts').select('id, nombre, saldo_disponible').eq('company_id', profile.company_id).eq('activa', true).order('nombre'),
    supabase.from('beneficiaries').select('id, nombre, tipo, cedula_nit, entidad_financiera, tipo_cuenta, numero_cuenta').eq('company_id', profile.company_id).eq('activo', true).order('nombre'),
  ])

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nueva solicitud de egreso</h1>
        <p className="text-sm text-muted-foreground">
          Solicita un pago a un beneficiario desde tus cuentas en PPI.
        </p>
      </div>
      <ExpenseForm
        accounts={accounts ?? []}
        beneficiarios={beneficiarios ?? []}
        userId={user.id}
        companyId={profile.company_id}
      />
    </div>
  )
}
