import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, CreditCard } from 'lucide-react'

export default async function ClienteBeneficiariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) redirect('/cliente')

  const { data: beneficiarios } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('company_id', profile.company_id)
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Beneficiarios</h1>
        <p className="text-sm text-muted-foreground">Destinatarios de pago registrados</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {beneficiarios?.map((ben) => (
          <Card key={ben.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium leading-tight">{ben.nombre}</CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs capitalize">
                  {ben.tipo === 'cheque' ? (
                    <><Building2 className="w-3 h-3 mr-1" />Cheque</>
                  ) : (
                    <><CreditCard className="w-3 h-3 mr-1" />Transferencia</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-0.5">
              <p>C.C. / NIT: {ben.cedula_nit}</p>
              {ben.tipo === 'transferencia' && (
                <>
                  {ben.entidad_financiera && <p>Entidad: {ben.entidad_financiera}</p>}
                  {ben.tipo_cuenta && <p>Tipo cuenta: <span className="capitalize">{ben.tipo_cuenta}</span></p>}
                  {ben.numero_cuenta && <p>No. cuenta: {ben.numero_cuenta}</p>}
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {(!beneficiarios || beneficiarios.length === 0) && (
          <div className="col-span-2 text-center text-muted-foreground py-12 text-sm">
            No hay beneficiarios registrados. Se agregan al crear una solicitud de egreso.
          </div>
        )}
      </div>
    </div>
  )
}
