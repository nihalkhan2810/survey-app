'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { 
  CloudDownload, 
  Users, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  ExternalLink 
} from 'lucide-react'

interface ImportResult {
  success: boolean
  importCount: number
  totalRecords: number
  data: any[]
  message: string
  error?: string
}

export default function SalesforceIntegration() {
  const searchParams = useSearchParams()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dataType, setDataType] = useState<'contacts' | 'accounts' | 'all'>('contacts')

  useEffect(() => {
    // Check for OAuth callback parameters
    const sfSuccess = searchParams.get('sf_success')
    const sfError = searchParams.get('sf_error')
    
    if (sfSuccess === 'true') {
      setImportResult({
        success: true,
        importCount: 0,
        totalRecords: 0,
        data: [],
        message: 'Successfully authenticated with Salesforce. You can now import data.',
        error: undefined
      })
    } else if (sfError) {
      setImportResult({
        success: false,
        importCount: 0,
        totalRecords: 0,
        data: [],
        message: '',
        error: `OAuth authentication failed: ${sfError.replace(/_/g, ' ')}`
      })
    }
  }, [searchParams])

  const handleImport = async () => {
    if (!credentials.username || !credentials.password) {
      setImportResult({
        success: false,
        importCount: 0,
        totalRecords: 0,
        data: [],
        message: '',
        error: 'Please enter your Salesforce username and password'
      })
      return
    }

    setIsLoading(true)
    setImportResult(null)

    try {
      const response = await fetch('/api/salesforce/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          dataType
        }),
      })

      const result = await response.json()
      setImportResult(result)
      
      if (result.success) {
        // Clear credentials for security
        setCredentials({ username: '', password: '' })
      }
    } catch (error) {
      setImportResult({
        success: false,
        importCount: 0,
        totalRecords: 0,
        data: [],
        message: '',
        error: 'Failed to connect to Salesforce. Please check your credentials.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async () => {
    try {
      const response = await fetch('/api/salesforce/auth')
      const result = await response.json()
      
      if (result.authUrl) {
        window.open(result.authUrl, '_blank', 'width=600,height=600')
      }
    } catch (error) {
      console.error('OAuth login failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <CloudDownload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Salesforce Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Import contacts and accounts from your Salesforce organization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Authentication
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salesforce Username
                </label>
                <input
                  type="email"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="your-email@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password + Security Token
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="password + security token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Concatenate your password with your security token
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <button
                  onClick={handleOAuthLogin}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Or use OAuth (opens in new window)
                </button>
              </div>
            </div>
          </div>

          {/* Import Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Import Options
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="contacts"
                  name="dataType"
                  value="contacts"
                  checked={dataType === 'contacts'}
                  onChange={(e) => setDataType(e.target.value as 'contacts')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="contacts" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users className="h-4 w-4" />
                  Contacts only
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="accounts"
                  name="dataType"
                  value="accounts"
                  checked={dataType === 'accounts'}
                  onChange={(e) => setDataType(e.target.value as 'accounts')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="accounts" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building className="h-4 w-4" />
                  Accounts only
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="all"
                  name="dataType"
                  value="all"
                  checked={dataType === 'all'}
                  onChange={(e) => setDataType(e.target.value as 'all')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="all" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CloudDownload className="h-4 w-4" />
                  All data
                </label>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CloudDownload className="h-4 w-4" />
                  Import Data
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Results */}
      {importResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${
            importResult.success 
              ? 'border-l-4 border-green-500' 
              : 'border-l-4 border-red-500'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {importResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {importResult.success ? 'Import Successful' : 'Import Failed'}
            </h3>
          </div>

          {importResult.success ? (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400">
                {importResult.message}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResult.importCount}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    New users added
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {importResult.totalRecords}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Total records processed
                  </div>
                </div>
              </div>
              {importResult.data.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Sample imported data:
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-600 dark:text-gray-400">
                      {JSON.stringify(importResult.data.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600 dark:text-red-400">
              {importResult.error}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}