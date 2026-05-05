import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminEmpresasPage() {
  const supabase = await createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('razon_social')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Empresas</h1>
        <p className="text-sm text-muted-foreground">Clientes corporativos registrados</p>
      </div>

      <div className="grid gap-4">
        {companies?.map((company) => (
          <Card key={company.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{company.razon_social}</CardTitle>
                <Badge variant={company.activa ? 'default' : 'secondary'}>
                  {company.activa ? 'Activa' : 'Inactiva'}
                </Badge>
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
        ))}
        {(!companies || companies.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No hay empresas registradas.
          </p>
        )}
      </div>
    </div>
  )
}
