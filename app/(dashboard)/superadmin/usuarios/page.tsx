import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Mail, Building, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/date'
import { DeleteUserButton } from './delete-user-button'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, companies(razon_social)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Consulta y administra los accesos de todo el sistema. Para invitar un nuevo usuario, 
          hazlo desde la ficha de la empresa correspondiente.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre / Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha registro</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium">{profile.full_name || 'Pendiente...'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {profile.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {profile.companies ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-muted-foreground" />
                          <Link href={`/superadmin/empresas/${profile.company_id}`} className="hover:underline">
                            {profile.companies.razon_social}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Ninguna (Global)</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={profile.role === 'super_admin' ? 'default' : 'secondary'}
                        className="capitalize gap-1"
                      >
                        {profile.role === 'super_admin' && <ShieldCheck className="w-3 h-3" />}
                        {profile.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/superadmin/usuarios/${profile.id}`}>Editar</Link>
                      </Button>
                      <DeleteUserButton userId={profile.id} userEmail={profile.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
