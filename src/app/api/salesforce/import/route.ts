import { NextRequest, NextResponse } from 'next/server'
import { createSalesforceClient } from '@/lib/salesforce'
import { database } from '@/lib/database'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { dataType, username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Salesforce credentials are required' },
        { status: 400 }
      )
    }

    const sfClient = createSalesforceClient()
    await sfClient.authenticate(username, password)
    
    let importedData: any[] = []
    let importCount = 0

    if (dataType === 'contacts' || dataType === 'all') {
      const contacts = await sfClient.getContacts(500)
      
      // Convert Salesforce contacts to users for the survey system
      for (const contact of contacts) {
        if (contact.Email) {
          const existingUser = await database.findUserByEmail(contact.Email)
          
          if (!existingUser) {
            const defaultPassword = await bcrypt.hash('salesforce123', 12)
            const userData = {
              id: nanoid(),
              email: contact.Email,
              name: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
              password: defaultPassword,
              role: 'USER',
              source: 'salesforce',
              salesforceId: contact.Id,
              phone: contact.Phone || null,
              company: contact.Account?.Name || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            await database.createUser(userData)
            importCount++
            importedData.push({
              type: 'contact',
              email: contact.Email,
              name: userData.name,
              company: contact.Account?.Name
            })
          }
        }
      }
    }

    if (dataType === 'accounts' || dataType === 'all') {
      const accounts = await sfClient.getAccounts(200)
      
      // Store account information for reference
      importedData.push(...accounts.map(account => ({
        type: 'account',
        id: account.Id,
        name: account.Name,
        industry: account.Industry,
        phone: account.Phone,
        website: account.Website
      })))
    }

    return NextResponse.json({
      success: true,
      importCount,
      totalRecords: importedData.length,
      data: importedData,
      message: `Successfully imported ${importCount} new users from Salesforce`
    })
    
  } catch (error) {
    console.error('Salesforce import error:', error)
    return NextResponse.json(
      { error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')
    const objectType = searchParams.get('type') as 'Contact' | 'Account' || 'Contact'
    
    // This would require stored authentication - simplified for demo
    return NextResponse.json({
      message: 'Search functionality requires active Salesforce session',
      searchTerm,
      objectType
    })
    
  } catch (error) {
    console.error('Salesforce search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}