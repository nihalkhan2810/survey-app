'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { motion } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    // Set that we've checked auth to prevent multiple redirects
    setHasCheckedAuth(true)

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Show loading spinner while checking authentication
  if (status === 'loading' || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if no session (redirect will happen)
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <motion.div 
        className="flex-1 flex flex-col"
        animate={{ 
          marginLeft: sidebarCollapsed ? 64 : 256,
          transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3
          }
        }}
      >
        <Header />
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-6 lg:p-8 overflow-auto"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </motion.main>
      </motion.div>
    </div>
  )
} 