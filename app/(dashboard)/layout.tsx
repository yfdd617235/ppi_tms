import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import type { ProfileWithCompany } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={profile.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header profile={profile as ProfileWithCompany} />
        <main className="flex-1 overflow-auto p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  )
}
