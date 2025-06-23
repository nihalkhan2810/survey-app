'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { SayzIcon } from '@/components/SayzLogo'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Shield,
  Database,
  Mail,
  Calendar,
  Home,
  Zap,
  Globe,
  Activity,
  Server
} from 'lucide-react'
import { hasPermission } from '@/types/permissions'

const navigationSections = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: Home,
        permission: null
      }
    ]
  },
  {
    title: 'User Management',
    items: [
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
        permission: 'users.view'
      },
      {
        name: 'Security',
        href: '/admin/security',
        icon: Shield,
        permission: 'users.manage_permissions'
      }
    ]
  },
  {
    title: 'Content',
    items: [
      {
        name: 'Surveys',
        href: '/admin/surveys',
        icon: FileText,
        permission: 'surveys.view'
      },
      {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        permission: 'analytics.view'
      },
      {
        name: 'Responses',
        href: '/admin/responses',
        icon: Database,
        permission: 'responses.view'
      }
    ]
  },
  {
    title: 'Integrations',
    items: [
      {
        name: 'API Management',
        href: '/admin/api',
        icon: Zap,
        permission: 'integrations.configure'
      },
      {
        name: 'External Services',
        href: '/admin/integrations',
        icon: Globe,
        permission: 'integrations.view'
      },
      {
        name: 'Voice & Calls',
        href: '/admin/calls',
        icon: Activity,
        permission: 'integrations.view'
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        name: 'Database',
        href: '/admin/database',
        icon: Database,
        permission: 'system.view'
      },
      {
        name: 'Settings',
        href: '/admin/system',
        icon: Settings,
        permission: 'system.configure'
      },
      {
        name: 'Email Logs',
        href: '/admin/emails',
        icon: Mail,
        permission: 'system.view'
      }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'USER'

  return (
    <div className="w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
          <SayzIcon size={60} />
          <div className="text-center mt-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session?.user?.name || 'Administrator'}
            </p>
          </div>
        </div>

        <nav className="space-y-6">
          {navigationSections.map((section) => {
            const visibleItems = section.items.filter(item => 
              !item.permission || hasPermission(userRole, item.permission as any)
            )
            
            if (visibleItems.length === 0) return null
            
            return (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.name} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{item.name}</span>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Status</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">All systems operational</p>
        </div>
        
        <Link href="/surveys">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200"
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium text-sm">Switch to User View</span>
          </motion.button>
        </Link>
      </div>
    </div>
  )
}