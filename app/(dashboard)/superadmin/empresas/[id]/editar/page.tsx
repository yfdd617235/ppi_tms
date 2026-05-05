import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CompanyForm } from '@/components/empresas/company-form'
import { updateCompany, resendInvite } from '../../actions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarEmpresaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: company }, { data: clientProfile }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('profiles')
      .select('email')
      .eq('company_id', id)
      .eq('role', 'client')
      .order('created_at', { ascending: true })
      .limit(1)
      .single(),
  ])

  if (!company) notFound()

  const updateCompanyById = updateCompany.bind(null, id)
  const resendInviteForCompany = resendInvite.bind(null, id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Editar empresa</h1>
        <p className="text-sm text-muted-foreground">{company.razon_social}</p>
      </div>
      <CompanyForm
        mode="edit"
        initialData={company}
        action={updateCompanyById}
        currentUserEmail={clientProfile?.email ?? undefined}
        resendInviteAction={resendInviteForCompany}
      />
    </div>
  )
}
