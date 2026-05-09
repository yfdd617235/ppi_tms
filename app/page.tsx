import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/public/landing-page'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LandingPage />

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role === 'super_admin') redirect('/superadmin')
  if (profile.role === 'admin') redirect('/admin')
  redirect('/cliente')
}
