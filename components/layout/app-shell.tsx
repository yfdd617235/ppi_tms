'use client'

import { useState } from 'react'
import Sidebar from './sidebar'
import Header from './header'
import type { ProfileWithCompany } from '@/types'

export function AppShell({ profile, children }: { profile: ProfileWithCompany; children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar role={profile.role} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <Sidebar
              role={profile.role}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          profile={profile}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  )
}
