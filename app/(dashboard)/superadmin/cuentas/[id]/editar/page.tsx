import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AccountForm } from '@/components/cuentas/account-form'
import { updateAccount } from '../../actions'

export default async function EditarCuentaGlobalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (!account) notFound()

  const action = updateAccount.bind(null, id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Editar cuenta bancaria</h1>
        <p className="text-sm text-muted-foreground">Modifica los datos de <strong>{account.nombre}</strong>.</p>
      </div>
      <AccountForm mode="edit" initialData={account} action={action} />
    </div>
  )
}
