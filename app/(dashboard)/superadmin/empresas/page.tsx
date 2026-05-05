import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Pencil, Landmark } from 'lucide-react'
import { toggleCompanyStatus } from './actions'

export default async function SuperAdminEmpresasPage() {
  const supabase = await createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('razon_social')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Empresas</h1>
          <p className="text-sm text-muted-foreground">Gestión de clientes corporativos</p>
        </div>
        <Button asChild size="sm">
          <Link href="/superadmin/empresas/nueva">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva empresa
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {companies?.map((company) => {
          const toggleAction = toggleCompanyStatus.bind(null, company.id, company.activa)
          return (
            <Card key={company.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base font-medium">{company.razon_social}</CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={company.activa ? 'default' : 'secondary'}>
                      {company.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7" title="Ver cuentas">
                      <Link href={`/superadmin/empresas/${company.id}`}>
                        <Landmark className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7" title="Editar empresa">
                      <Link href={`/superadmin/empresas/${company.id}/editar`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <form action={toggleAction}>
                      <button
                        type="submit"
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                        title={company.activa ? 'Desactivar empresa' : 'Activar empresa'}
                      >
                        {company.activa ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>NIT: {company.nit}</p>
                <p>Correo: {company.correo}</p>
                {company.celular && <p>Teléfono: {company.celular}</p>}
                {company.nombre_representante_legal && (
                  <p>Representante: {company.nombre_representante_legal}</p>
                )}
                {company.nombre_contacto_operaciones && (
                  <p>Contacto de operaciones: {company.nombre_contacto_operaciones}
                    {company.telefono_contacto_operaciones && ` — ${company.telefono_contacto_operaciones}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
        {(!companies || companies.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No hay empresas registradas.{' '}
            <Link href="/superadmin/empresas/nueva" className="text-primary hover:underline">
              Crea la primera.
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
