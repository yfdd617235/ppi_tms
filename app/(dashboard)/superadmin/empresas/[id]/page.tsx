import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Pencil, Building2, Landmark } from 'lucide-react'
import { formatCOP } from '@/lib/currency'
import {
  assignAccount,
  unassignAccount,
  toggleCompanyAccountDiscrecion,
} from './cuentas/actions'

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: company }, { data: companyAccounts }, { data: allAccounts }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('company_accounts')
      .select('*, accounts(id, nombre, nombre_banco, numero_cuenta, tipo_cuenta)')
      .eq('company_id', id),
    supabase.from('accounts').select('id, nombre, nombre_banco, numero_cuenta, tipo_cuenta').eq('activa', true).order('nombre'),
  ])

  if (!company) notFound()

  const assignedIds = new Set((companyAccounts ?? []).map((ca) => ca.account_id))
  const availableAccounts = (allAccounts ?? []).filter((a) => !assignedIds.has(a.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/superadmin/empresas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Empresas
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">{company.razon_social}</span>
          </div>
          <h1 className="text-xl font-semibold">{company.razon_social}</h1>
          <p className="text-sm text-muted-foreground">NIT: {company.nit}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/superadmin/empresas/${id}/editar`}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Editar empresa
          </Link>
        </Button>
      </div>

      {/* Ficha técnica */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Ficha técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge variant={company.activa ? 'default' : 'secondary'} className="mt-0.5">
                {company.activa ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            {company.direccion && (
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p>{company.direccion}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Correo</p>
              <p>{company.correo}</p>
            </div>
            {company.celular && (
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p>{company.celular}</p>
              </div>
            )}
            {company.nombre_representante_legal && (
              <div>
                <p className="text-xs text-muted-foreground">Representante legal</p>
                <p>{company.nombre_representante_legal}</p>
              </div>
            )}
          </div>
          {company.nombre_contacto_operaciones && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contacto de operaciones</p>
                <p className="font-medium">{company.nombre_contacto_operaciones}</p>
                {company.correo_contacto_operaciones && <p className="text-muted-foreground">{company.correo_contacto_operaciones}</p>}
                {company.telefono_contacto_operaciones && <p className="text-muted-foreground">{company.telefono_contacto_operaciones}</p>}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cuentas asignadas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          <h2 className="text-base font-semibold">Cuentas asignadas</h2>
          <span className="text-sm text-muted-foreground">({companyAccounts?.length ?? 0})</span>
        </div>

        <div className="grid gap-3">
          {companyAccounts?.map((ca) => {
            const account = ca.accounts as { id: string; nombre: string; nombre_banco: string | null; numero_cuenta: string | null; tipo_cuenta: string | null } | null
            const unassignAction = unassignAccount.bind(null, id, ca.account_id)
            const toggleDiscrecionAction = toggleCompanyAccountDiscrecion.bind(null, id, ca.account_id, ca.egreso_a_discrecion)

            return (
              <Card key={ca.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm">{account?.nombre}</p>
                      {(account?.nombre_banco || account?.numero_cuenta) && (
                        <p className="text-sm text-muted-foreground">
                          {account.nombre_banco}
                          {account.tipo_cuenta && ` · Cta. ${account.tipo_cuenta}`}
                          {account.numero_cuenta && ` #${account.numero_cuenta}`}
                        </p>
                      )}
                      <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
                        <span>Saldo disponible: <span className="font-medium text-foreground">{formatCOP(parseFloat(ca.saldo_disponible))}</span></span>
                        <span>Saldo neto: <span className="font-medium text-foreground">{formatCOP(parseFloat(ca.saldo_neto))}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <form action={toggleDiscrecionAction}>
                        <button
                          type="submit"
                          className={`text-xs underline-offset-2 hover:underline transition-colors ${ca.egreso_a_discrecion ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                          title="Alternar 'a discreción de PPI'"
                        >
                          {ca.egreso_a_discrecion ? 'A discreción PPI ✓' : 'A discreción PPI'}
                        </button>
                      </form>
                      <form action={unassignAction}>
                        <button
                          type="submit"
                          className="text-xs text-destructive/70 hover:text-destructive underline-offset-2 hover:underline transition-colors"
                        >
                          Desasignar
                        </button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {(!companyAccounts || companyAccounts.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg">
              Esta empresa no tiene cuentas asignadas.
            </p>
          )}
        </div>

        {/* Asignar cuenta disponible */}
        {availableAccounts.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Asignar cuenta del catálogo</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableAccounts.map((account) => {
                const assignAction = assignAccount.bind(null, id, account.id)
                return (
                  <form key={account.id} action={assignAction}>
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                    >
                      <p className="font-medium">{account.nombre}</p>
                      {(account.nombre_banco || account.numero_cuenta) && (
                        <p className="text-xs text-muted-foreground">
                          {account.nombre_banco}
                          {account.tipo_cuenta && ` · ${account.tipo_cuenta}`}
                          {account.numero_cuenta && ` #${account.numero_cuenta}`}
                        </p>
                      )}
                    </button>
                  </form>
                )
              })}
            </div>
          </div>
        )}

        {availableAccounts.length === 0 && (companyAccounts?.length ?? 0) > 0 && (
          <p className="text-xs text-muted-foreground">
            Todas las cuentas activas del catálogo ya están asignadas a esta empresa.{' '}
            <Link href="/superadmin/cuentas/nueva" className="text-primary hover:underline">
              Crear nueva cuenta.
            </Link>
          </p>
        )}

        {allAccounts?.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No hay cuentas en el catálogo.{' '}
            <Link href="/superadmin/cuentas/nueva" className="text-primary hover:underline">
              Crea la primera cuenta.
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
