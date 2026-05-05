import { CompanyForm } from '@/components/empresas/company-form'
import { createCompany } from '../actions'

export default function NuevaEmpresaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nueva empresa</h1>
        <p className="text-sm text-muted-foreground">Registra un nuevo cliente corporativo</p>
      </div>
      <CompanyForm mode="create" action={createCompany} />
    </div>
  )
}
