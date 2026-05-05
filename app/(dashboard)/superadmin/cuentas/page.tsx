import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { toggleAccountStatus } from './actions'

export default async function SuperAdminCuentasPage() {
  const supabase = await createClient()
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('nombre')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cuentas bancarias</h1>
          <p className="text-sm text-muted-foreground">Catálogo global de cuentas de PPI. Asígnalas a cada empresa desde su ficha.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/superadmin/cuentas/nueva">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva cuenta
          </Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {accounts?.map((account) => {
          const toggleAction = toggleAccountStatus.bind(null, account.id, account.activa)
          return (
            <Card key={account.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{account.nombre}</span>
                      <Badge variant={account.activa ? 'default' : 'secondary'} className="text-xs">
                        {account.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    {(account.nombre_banco || account.numero_cuenta) && (
                      <p className="text-sm text-muted-foreground">
                        {account.nombre_banco}
                        {account.tipo_cuenta && ` · Cta. ${account.tipo_cuenta}`}
                        {account.numero_cuenta && ` #${account.numero_cuenta}`}
                      </p>
                    )}
                    {account.descripcion && (
                      <p className="text-xs text-muted-foreground">{account.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7" title="Editar">
                      <Link href={`/superadmin/cuentas/${account.id}/editar`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <form action={toggleAction}>
                      <button
                        type="submit"
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                      >
                        {account.activa ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(!accounts || accounts.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No hay cuentas registradas.{' '}
            <Link href="/superadmin/cuentas/nueva" className="text-primary hover:underline">
              Crea la primera.
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
