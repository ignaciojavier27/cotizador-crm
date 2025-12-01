'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  Building2,
  Tags,
  Bell,
  BarChart3,
} from 'lucide-react'

type SidebarProps = {
  userRole: string
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'seller'],
      },
    ],
  },
  {
    title: 'Gestión',
    items: [
      {
        title: 'Cotizaciones',
        href: '/dashboard/quotations',
        icon: FileText,
        roles: ['admin', 'seller'],
      },
      {
        title: 'Productos',
        href: '/dashboard/products',
        icon: Package,
        roles: ['admin', 'seller'],
      },
      {
        title: 'Impuestos',
        href: '/dashboard/taxes',
        icon: Settings,
        roles: ['admin'],
      },
      {
        title: 'Categorías',
        href: '/dashboard/categories',
        icon: Tags,
        roles: ['admin'],
      },
      {
        title: 'Clientes',
        href: '/dashboard/clients',
        icon: Users,
        roles: ['admin', 'seller'],
      },
    ],
  },
  {
    title: 'Administración',
    items: [
      {
        title: 'Usuarios',
        href: '/dashboard/users',
        icon: Users,
        roles: ['admin'],
      },
      {
        title: 'Empresa',
        href: '/dashboard/companies',
        icon: Building2,
        roles: ['admin'],
      },
      {
        title: 'Automatizaciones',
        href: '/dashboard/automations',
        icon: Bell,
        roles: ['admin'],
      },
      {
        title: 'Reportes',
        href: '/dashboard/reports',
        icon: BarChart3,
        roles: ['admin'],
      },
    ],
  },
]

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  // Filtrar items según el rol del usuario
  const filteredMenuItems = menuItems.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(userRole)),
  }))

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center border-b px-6">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-lg font-semibold text-slate-900">
              Cotizador CRM
            </span>
          </div>

          {/* Sidebar content */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {filteredMenuItems.map((section) => {
              // No mostrar secciones vacías
              if (section.items.length === 0) return null

              return (
                <div key={section.title}>
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t p-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-900">
                ¿Necesitas ayuda?
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Contacta con soporte
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}