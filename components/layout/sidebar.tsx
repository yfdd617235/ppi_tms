'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Landmark,
  ScrollText,
  X,
} from 'lucide-react'
import type { UserRole } from '@/types'

type NavItem = { href: string; label: string; icon: React.ElementType }

const navByRole: Record<UserRole, NavItem[]> = {
  super_admin: [
    { href: '/superadmin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/superadmin/empresas', label: 'Empresas', icon: Building2 },
    { href: '/superadmin/cuentas', label: 'Cuentas', icon: Landmark },
    { href: '/superadmin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/superadmin/ingresos', label: 'Ingresos', icon: ArrowDownCircle },
    { href: '/superadmin/egresos', label: 'Egresos', icon: ArrowUpCircle },
    { href: '/superadmin/estado-de-cuenta', label: 'Estado de cuenta', icon: ScrollText },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
    { href: '/admin/ingresos', label: 'Ingresos', icon: ArrowDownCircle },
    { href: '/admin/egresos', label: 'Egresos', icon: ArrowUpCircle },
    { href: '/admin/estado-de-cuenta', label: 'Estado de cuenta', icon: ScrollText },
  ],
  client: [
    { href: '/cliente', label: 'Mi tesorería', icon: LayoutDashboard },
    { href: '/cliente/ingresos', label: 'Ingresos', icon: ArrowDownCircle },
    { href: '/cliente/egresos', label: 'Egresos', icon: ArrowUpCircle },
    { href: '/cliente/beneficiarios', label: 'Beneficiarios', icon: Users },
    { href: '/cliente/estado-de-cuenta', label: 'Estado de cuenta', icon: ScrollText },
  ],
}

interface SidebarProps {
  role: UserRole
  onClose?: () => void
}

export default function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname()
  const items = navByRole[role]

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-14 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-xs">P</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs leading-tight truncate">PPI</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Treasury Portal</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
