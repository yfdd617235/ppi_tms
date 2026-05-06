import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  const [{ count: companiesCount }, { count: pendingIncome }, { count: pendingExpense }, { data: accounts }] =
    await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }).eq('activa', true),
      supabase.from('income_requests').select('*', { count: 'exact', head: true }).eq('estado', 'enviado'),
      supabase.from('expense_requests').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('company_accounts').select('saldo_neto'),
    ])

  const totalNeto = accounts?.reduce((sum, a) => sum + parseFloat(a.saldo_neto), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Panel de control</h1>
        <p className="text-sm text-muted-foreground">Resumen global de todas las cuentas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/superadmin/empresas">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empresas activas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{companiesCount ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/ingresos">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos por verificar</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingIncome ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/egresos">
          <Card className="hover:bg-muted/50 transition-all cursor-pointer hover:ring-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Egresos pendientes</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingExpense ?? 0}</p>
            </CardContent>
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
    </div>
  )
}
