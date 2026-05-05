import { AccountForm } from '@/components/cuentas/account-form'
import { createAccount } from '../actions'

export default async function NuevaCuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const action = createAccount.bind(null, id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Nueva cuenta bancaria</h1>
        <p className="text-sm text-muted-foreground">Registra una cuenta bancaria para la empresa.</p>
      </div>
      <AccountForm mode="create" action={action} />
    </div>
  )
}
