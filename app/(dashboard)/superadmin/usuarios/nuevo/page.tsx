import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InviteStaffForm } from '../invite-staff-form'

export default function NuevoAdminPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invitar miembro de staff</h1>
        <p className="text-muted-foreground text-sm">
          Crea un acceso para un administrador de Panamerican Private Investments.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del nuevo usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteStaffForm />
        </CardContent>
      </Card>
    </div>
  )
}
