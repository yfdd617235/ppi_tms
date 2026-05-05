import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCOP } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingDown } from 'lucide-react'

export default async function ClienteDashboard() {
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
        <p className="text-muted-foreground text-xs mt-1">Contacta a PPI para que asignen tu empresa.</p>
      </div>
    )
  }

  const [{ data: accounts }, { count: pendingIncome }, { count: pendingExpense }] =
    await Promise.all([
      supabase.from('accounts').select('id, nombre, saldo_disponible, saldo_neto').eq('company_id', profile.company_id).eq('activa', true),
      supabase.from('income_requests').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('estado', 'enviado'),
      supabase.from('expense_requests').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('estado', 'pendiente'),
    ])

  const totalDisponible = accounts?.reduce((sum, a) => sum + parseFloat(a.saldo_disponible), 0) ?? 0
  const totalNeto = accounts?.reduce((sum, a) => sum + parseFloat(a.saldo_neto), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Mi tesorería</h1>
        <p className="text-sm text-muted-foreground">Resumen de tus cuentas y operaciones</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo disponible</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCOP(totalDisponible)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo neto</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCOP(totalNeto)}</p>
            <p className="text-xs text-muted-foreground mt-1">Después de 4x1000 y comisión PPI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos en revisión</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingIncome ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Egresos pendientes</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingExpense ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {accounts && accounts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Mis cuentas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{account.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponible</span>
                    <span className="font-medium text-primary">{formatCOP(parseFloat(account.saldo_disponible))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Neto</span>
                    <span className="font-medium">{formatCOP(parseFloat(account.saldo_neto))}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
