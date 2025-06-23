import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getApiConfig, updateApiConfig, checkServiceAvailability, maskApiKey } from '@/lib/api-config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await getApiConfig()
    const availability = await checkServiceAvailability()
    
    // Mask sensitive API keys for display
    const maskedConfig = {
      geminiApiKey: maskApiKey(config.geminiApiKey),
      vapiApiKey: maskApiKey(config.vapiApiKey),
      vapiWebhookSecret: maskApiKey(config.vapiWebhookSecret),
      vapiAssistantId: config.vapiAssistantId,
      vapiPhoneNumberId: config.vapiPhoneNumberId,
      twilioAccountSid: maskApiKey(config.twilioAccountSid),
      twilioAuthToken: maskApiKey(config.twilioAuthToken),
      twilioPhoneNumber: config.twilioPhoneNumber,
      salesforceConsumerKey: maskApiKey(config.salesforceConsumerKey),
      salesforceConsumerSecret: maskApiKey(config.salesforceConsumerSecret),
      salesforceSecurityToken: maskApiKey(config.salesforceSecurityToken),
      salesforceLoginUrl: config.salesforceLoginUrl,
    }

    return NextResponse.json({
      config: maskedConfig,
      availability,
      hasUserConfig: await hasUserConfiguration()
    })
  } catch (error) {
    console.error('Error getting API config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    // Validate and sanitize the updates
    const validKeys = [
      'geminiApiKey',
      'vapiApiKey', 
      'vapiWebhookSecret',
      'vapiAssistantId',
      'vapiPhoneNumberId',
      'twilioAccountSid',
      'twilioAuthToken',
      'twilioPhoneNumber',
      'salesforceConsumerKey',
      'salesforceConsumerSecret',
      'salesforceSecurityToken',
      'salesforceLoginUrl'
    ]
    
    const sanitizedUpdates: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (validKeys.includes(key) && typeof value === 'string') {
        // Only update if value is not empty and not a masked value
        if (value.trim() && !value.includes('****')) {
          sanitizedUpdates[key] = value.trim()
        }
      }
    }

    await updateApiConfig(sanitizedUpdates)
    
    return NextResponse.json({ 
      success: true, 
      message: 'API configuration updated successfully',
      updatedKeys: Object.keys(sanitizedUpdates)
    })
  } catch (error) {
    console.error('Error updating API config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function hasUserConfiguration(): Promise<boolean> {
  try {
    const config = await getApiConfig()
    // Check if any user-configured keys exist (not just env vars)
    return !!(config.geminiApiKey || config.vapiApiKey || config.twilioAccountSid)
  } catch {
    return false
  }
}