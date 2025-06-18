'use client'

import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Bell, LogOut, User, Search } from 'lucide-react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export function AdminHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, surveys, responses..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {session?.user?.name}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Administrator
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg"
              >
                <User className="h-5 w-5" />
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}