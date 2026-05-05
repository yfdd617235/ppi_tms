import { AccountForm } from '@/components/cuentas/account-form'
import { createAccount } from '../actions'

export default function NuevaCuentaGlobalPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Nueva cuenta bancaria</h1>
        <p className="text-sm text-muted-foreground">Registra una cuenta del catálogo de PPI. Luego podrás asignarla a las empresas.</p>
      </div>
      <AccountForm mode="create" action={createAccount} />
    </div>
  )
}
