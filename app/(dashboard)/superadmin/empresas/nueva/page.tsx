import { createClient } from '@/lib/supabase/server'
import { CompanyForm } from '@/components/empresas/company-form'
import { createCompany } from '../actions'

export default async function NuevaEmpresaPage() {
  const supabase = await createClient()
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, nombre, descripcion, nombre_banco, numero_cuenta')
    .eq('activa', true)
    .order('nombre')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nueva empresa</h1>
        <p className="text-sm text-muted-foreground">Registra un nuevo cliente corporativo</p>
      </div>
      <CompanyForm mode="create" action={createCompany} accounts={accounts ?? []} />
    </div>
  )
}
