import { NextRequest, NextResponse } from 'next/server'
import { createSalesforceClient } from '@/lib/salesforce'

export async function GET(request: NextRequest) {
  try {
    const sfClient = createSalesforceClient()
    const authUrl = await sfClient.authenticateWithOAuth()
    
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Salesforce auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Salesforce auth URL' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const sfClient = createSalesforceClient()
    await sfClient.authenticate(username, password)
    
    // Store connection info in session or database as needed
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Salesforce authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}