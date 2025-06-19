'use client'

import { useEffect, useState } from 'react'
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface DatabaseStatus {
  connected: boolean
  type: string
  error?: string
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/setup-db')
      const data = await response.json()
      setStatus(data.database)
    } catch (error) {
      setStatus({
        connected: false,
        type: 'Unknown',
        error: 'Failed to check database status'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Checking database...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow border-l-4 ${
      status?.connected ? 'border-green-500' : 'border-red-500'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          status?.connected 
            ? 'bg-green-100 dark:bg-green-900' 
            : 'bg-red-100 dark:bg-red-900'
        }`}>
          {status?.connected ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">
              Database: {status?.type}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status?.connected ? (
              <span className="text-green-600 dark:text-green-400">Connected</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                {status?.error || 'Not connected'}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={checkDatabaseStatus}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {status?.type === 'In-Memory' && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
          <p className="text-yellow-700 dark:text-yellow-300">
            ⚠️ Using in-memory database. Data will be lost on restart.
          </p>
          <p className="text-yellow-600 dark:text-yellow-400 mt-1">
            Configure AWS credentials to use DynamoDB.
          </p>
        </div>
      )}
    </div>
  )
} 