import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: companiesCount }, { count: incomeCount }, { count: expenseCount }] =
    await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }).eq('activa', true),
      supabase.from('income_requests').select('*', { count: 'exact', head: true }),
      supabase.from('expense_requests').select('*', { count: 'exact', head: true }),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Panel de control</h1>
        <p className="text-sm text-muted-foreground">Vista de solo lectura de todas las operaciones</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Empresas activas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{companiesCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total ingresos</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{incomeCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total egresos</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{expenseCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
