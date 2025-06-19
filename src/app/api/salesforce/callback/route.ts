import { NextRequest, NextResponse } from 'next/server'
import { createSalesforceClient } from '@/lib/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const adminUrl = baseUrl.endsWith('/') 
      ? `${baseUrl}dashboard/admin`
      : `${baseUrl}/dashboard/admin`
    
    if (error) {
      return NextResponse.redirect(`${adminUrl}?sf_error=${error}`)
    }
    
    if (!code) {
      return NextResponse.redirect(`${adminUrl}?sf_error=no_code`)
    }

    const sfClient = createSalesforceClient()
    const redirectUri = baseUrl.endsWith('/') 
      ? `${baseUrl}api/salesforce/callback`
      : `${baseUrl}/api/salesforce/callback`
    
    await sfClient.handleOAuthCallback(code, redirectUri)
    
    // Store successful authentication in session/database
    return NextResponse.redirect(`${adminUrl}?sf_success=true`)
    
  } catch (error) {
    console.error('Salesforce OAuth callback error:', error)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const adminUrl = baseUrl.endsWith('/') 
      ? `${baseUrl}dashboard/admin`
      : `${baseUrl}/dashboard/admin`
    return NextResponse.redirect(`${adminUrl}?sf_error=callback_failed`)
  }
}