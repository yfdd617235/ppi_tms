import { createClient } from '@/lib/supabase/server'
import { IngresosAdminTable } from '@/components/ingresos/ingresos-admin-table'

export default async function SuperAdminIngresosPage() {
  const supabase = await createClient()
  const { data: ingresos } = await supabase
    .from('income_requests')
    .select('*, accounts(nombre), companies(razon_social)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ingresos</h1>
        <p className="text-sm text-muted-foreground">Todas las solicitudes de ingreso</p>
      </div>

      <IngresosAdminTable ingresos={ingresos ?? []} />
    </div>
  )
}
