import UserNav from './user-nav'
import type { ProfileWithCompany } from '@/types'

export default function Header({ profile }: { profile: ProfileWithCompany }) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-muted-foreground">
        {profile.companies?.razon_social && (
          <span className="font-medium text-foreground">{profile.companies.razon_social}</span>
        )}
      </div>
      <UserNav profile={profile} />
    </header>
  )
}
