'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { SayzLogo } from '@/components/SayzLogo'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    // Add debug logging for production
    if (process.env.NODE_ENV === 'production') {
      const info = {
        sessionStatus: status,
        hasSession: !!session,
        userRole: session?.user?.role,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR'
      }
      console.log('Homepage Debug Info:', info)
      setDebugInfo(info)
    }

    if (status === 'loading') return

    if (session) {
      try {
        if (session.user?.role === 'ADMIN') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Navigation error:', error)
        // Stay on homepage if navigation fails
      }
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          {process.env.NODE_ENV === 'production' && debugInfo && (
            <details className="mt-4 text-xs text-gray-500">
              <summary>Debug Info</summary>
              <pre className="text-left mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
          {process.env.NODE_ENV === 'production' && (
            <details className="mt-4 text-xs text-gray-500">
              <summary>Session Info</summary>
              <div className="text-left mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p>User: {session.user?.email}</p>
                <p>Role: {session.user?.role}</p>
                <p>Status: {status}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center mb-8">
              <SayzLogo size={80} />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Sayz
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Create, distribute, and analyze surveys with powerful AI-driven insights. 
              Built for modern teams who need actionable feedback.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] w-full sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] w-full sm:w-auto"
                >
                  Create Account
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {[
              {
                icon: BarChart3,
                title: 'AI-Powered Analytics',
                description: 'Get intelligent insights from your survey data with automated analysis and reporting.'
              },
              {
                icon: Users,
                title: 'Smart Distribution',
                description: 'Reach your audience through multiple channels with targeted distribution strategies.'
              },
              {
                icon: Calendar,
                title: 'Automated Scheduling',
                description: 'Set up surveys with automated reminders and deadline management.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Demo Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800"
          >
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
              Try Demo Accounts
            </h3>
            <p className="text-emerald-800 dark:text-emerald-400 text-sm">
              <strong>Admin:</strong> admin@sayz.com • <strong>User:</strong> user@sayz.com
              <br />
              Password: demo123
            </p>
          </motion.div>

          {/* Production Debug Info */}
          {process.env.NODE_ENV === 'production' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">System Status</summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-left">
                  <p>Environment: {process.env.NODE_ENV}</p>
                  <p>Session Status: {status}</p>
                  <p>Timestamp: {new Date().toISOString()}</p>
                  <p>NextAuth URL: {process.env.NEXTAUTH_URL || 'Not set'}</p>
                </div>
              </details>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
