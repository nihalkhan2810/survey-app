import { database } from './database'

export interface ApiConfig {
  geminiApiKey?: string
  vapiApiKey?: string
  vapiWebhookSecret?: string
  vapiAssistantId?: string
  vapiPhoneNumberId?: string
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
  salesforceConsumerKey?: string
  salesforceConsumerSecret?: string
  salesforceSecurityToken?: string
  salesforceLoginUrl?: string
}

// Map of environment variable names to config keys
const ENV_VAR_MAP = {
  GEMINI_API_KEY: 'geminiApiKey',
  VAPI_API_KEY: 'vapiApiKey',
  VAPI_WEBHOOK_SECRET: 'vapiWebhookSecret',
  VAPI_ASSISTANT_ID: 'vapiAssistantId',
  VAPI_PHONE_NUMBER_ID: 'vapiPhoneNumberId',
  TWILIO_ACCOUNT_SID: 'twilioAccountSid',
  TWILIO_AUTH_TOKEN: 'twilioAuthToken',
  TWILIO_PHONE_NUMBER: 'twilioPhoneNumber',
  SALESFORCE_CONSUMER_KEY: 'salesforceConsumerKey',
  SALESFORCE_CONSUMER_SECRET: 'salesforceConsumerSecret',
  SALESFORCE_SECURITY_TOKEN: 'salesforceSecurityToken',
  SALESFORCE_LOGIN_URL: 'salesforceLoginUrl',
} as const

// Get API configuration with fallback to environment variables
export async function getApiConfig(): Promise<ApiConfig> {
  try {
    // Get user-configured API keys from database
    const dbConfig = await database.getApiConfig()
    
    // Create config object with fallbacks to environment variables
    const config: ApiConfig = {}
    
    for (const [envVar, configKey] of Object.entries(ENV_VAR_MAP)) {
      // Use database value if available, otherwise fallback to environment variable
      config[configKey as keyof ApiConfig] = dbConfig?.[configKey] || process.env[envVar] || undefined
    }
    
    return config
  } catch (error) {
    console.error('Error getting API config, falling back to environment variables:', error)
    
    // Fallback to environment variables only
    const config: ApiConfig = {}
    for (const [envVar, configKey] of Object.entries(ENV_VAR_MAP)) {
      config[configKey as keyof ApiConfig] = process.env[envVar] || undefined
    }
    
    return config
  }
}

// Get a specific API key with fallback
export async function getApiKey(key: keyof ApiConfig): Promise<string | undefined> {
  const config = await getApiConfig()
  return config[key]
}

// Update API configuration
export async function updateApiConfig(updates: Partial<ApiConfig>): Promise<void> {
  try {
    const currentConfig = await database.getApiConfig() || {}
    const newConfig = { ...currentConfig, ...updates }
    await database.updateApiConfig(newConfig)
  } catch (error) {
    console.error('Error updating API config:', error)
    throw error
  }
}

// Check if required API keys are available for a specific service
export async function checkServiceAvailability() {
  const config = await getApiConfig()
  
  return {
    gemini: !!config.geminiApiKey,
    vapi: !!config.vapiApiKey,
    twilio: !!(config.twilioAccountSid && config.twilioAuthToken && config.twilioPhoneNumber),
    salesforce: !!(config.salesforceConsumerKey && config.salesforceConsumerSecret && config.salesforceSecurityToken),
  }
}

// Helper function to mask API keys for display
export function maskApiKey(key: string | undefined): string {
  if (!key) return 'Not configured'
  if (key.length <= 8) return '****'
  return key.substring(0, 4) + '****' + key.substring(key.length - 4)
}