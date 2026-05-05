import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserForm } from '../user-form'

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: profile }, { data: companies }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('companies').select('id, razon_social').eq('activa', true).order('razon_social')
  ])

  if (!profile) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm companies={companies ?? []} initialData={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
