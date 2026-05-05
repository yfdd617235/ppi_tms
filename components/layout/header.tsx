'use client'

import UserNav from './user-nav'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import type { ProfileWithCompany } from '@/types'

interface HeaderProps {
  profile: ProfileWithCompany
  onMenuClick?: () => void
}

export default function Header({ profile, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0 h-8 w-8"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {profile.companies?.razon_social && (
          <span className="text-sm font-medium text-foreground truncate hidden sm:block">
            {profile.companies.razon_social}
          </span>
        )}
      </div>
      <UserNav profile={profile} />
    </header>
  )
}
