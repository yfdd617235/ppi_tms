import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Pencil, Building2, Landmark, Users, History, ArrowUpRight, ArrowDownLeft, ScrollText } from 'lucide-react'
import { formatCOP } from '@/lib/currency'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import {
  assignAccount,
  unassignAccount,
} from './cuentas/actions'
import { CreateAccountDialog, EditAccountDialog } from '@/components/empresas/account-dialogs'

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: company }, { data: companyAccounts }, { data: allAccounts }, { data: users }, { data: incomes }, { data: expenses }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('company_accounts')
      .select('*, accounts(id, nombre, nombre_banco, numero_cuenta, tipo_cuenta)')
      .eq('company_id', id),
    supabase.from('accounts').select('id, nombre, nombre_banco, numero_cuenta, tipo_cuenta').eq('activa', true).order('nombre'),
    supabase.from('profiles').select('*').eq('company_id', id).order('full_name'),
    supabase.from('income_requests').select('*, accounts(nombre)').eq('company_id', id).order('created_at', { ascending: false }).limit(5),
    supabase.from('expense_requests').select('*, accounts(nombre)').eq('company_id', id).order('created_at', { ascending: false }).limit(5),
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
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/superadmin/empresas/${id}/ledger`}>
              <ScrollText className="w-3.5 h-3.5 mr-1.5" />
              Estado de cuenta
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/superadmin/empresas/${id}/editar`}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Editar empresa
            </Link>
          </Button>
        </div>
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            <h2 className="text-base font-semibold">Cuentas asignadas</h2>
            <span className="text-sm text-muted-foreground">({companyAccounts?.length ?? 0})</span>
          </div>
          <CreateAccountDialog companyId={id} />
        </div>

        <div className="grid gap-3">
          {companyAccounts?.map((ca) => {
            const account = ca.accounts as { id: string; nombre: string; nombre_banco: string | null; numero_cuenta: string | null; tipo_cuenta: string | null } | null
            const unassignAction = unassignAccount.bind(null, id, ca.account_id)

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
                        <span>Saldo bruto: <span className="font-medium text-foreground">{formatCOP(parseFloat(ca.saldo_bruto))}</span></span>
                        <span>Disponible: <span className="font-medium text-foreground">{formatCOP(parseFloat(ca.saldo_neto))}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <EditAccountDialog 
                        companyId={id} 
                        accountId={ca.account_id} 
                        initialData={{
                          nombre: account?.nombre ?? '',
                          descripcion: (account as any)?.descripcion ?? '',
                          egreso_a_discrecion: ca.egreso_a_discrecion
                        }} 
                      />
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
          <div className="pt-4 flex flex-col items-center gap-2 border-t border-dashed mt-4">
            <p className="text-xs text-muted-foreground">
              Todas las cuentas activas del catálogo ya están asignadas.
            </p>
            <CreateAccountDialog companyId={id} />
          </div>
        )}

        {allAccounts?.length === 0 && (
          <div className="pt-4 flex flex-col items-center gap-2 border-t border-dashed mt-4">
            <p className="text-xs text-muted-foreground">
              No hay cuentas en el catálogo.
            </p>
            <CreateAccountDialog companyId={id} />
          </div>
        )}
      </div>

      {/* Usuarios de la empresa */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <h2 className="text-base font-semibold">Usuarios registrados</h2>
          <span className="text-sm text-muted-foreground">({users?.length ?? 0})</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users?.map((u) => (
            <Card key={u.id} className="bg-muted/10">
              <CardContent className="pt-4 space-y-1">
                <p className="font-medium text-sm">{u.full_name || 'Sin nombre'}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <Badge variant="outline" className="text-[10px] capitalize mt-1">
                  {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                </Badge>
              </CardContent>
            </Card>
          ))}
          {(!users || users.length === 0) && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-6 border rounded-lg border-dashed">
              No hay usuarios vinculados a esta empresa.
            </p>
          )}
        </div>
      </div>

      {/* Historial de movimientos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <h2 className="text-base font-semibold">Movimientos recientes</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {/* Mezclar y ordenar por fecha */}
              {[
                ...(incomes ?? []).map(i => ({ ...i, type: 'income' as const })),
                ...(expenses ?? []).map(e => ({ ...e, type: 'expense' as const }))
              ]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 8)
                .map((mov: any) => (
                  <div key={`${mov.type}-${mov.id}`} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        mov.type === 'income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {mov.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {mov.type === 'income' ? 'Ingreso verificado' : 'Egreso solicitado'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(mov.created_at)} · {mov.accounts?.nombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        mov.type === 'income' ? "text-green-600" : "text-foreground"
                      )}>
                        {mov.type === 'income' ? '+' : '-'}{formatCOP(parseFloat(mov.valor_real || mov.valor || mov.valor_cliente))}
                      </p>
                      <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize">
                        {mov.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              }
              {(!incomes?.length && !expenses?.length) && (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No hay movimientos registrados.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
