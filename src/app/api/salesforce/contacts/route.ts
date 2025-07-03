import { NextRequest, NextResponse } from 'next/server';
import { createSalesforceClient } from '@/lib/salesforce';

// Direct Salesforce API access function
async function getContactsDirectly(accessToken: string, instanceUrl: string, searchTerm: string = '', limit: number = 50) {
  let query: string;
  
  if (searchTerm.trim()) {
    query = `SELECT Id, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, Account.Name 
             FROM Contact 
             WHERE Email != null 
             AND (FirstName LIKE '%${searchTerm}%' 
                  OR LastName LIKE '%${searchTerm}%' 
                  OR Email LIKE '%${searchTerm}%' 
                  OR Account.Name LIKE '%${searchTerm}%')
             ORDER BY LastName, FirstName 
             LIMIT ${limit}`;
  } else {
    query = `SELECT Id, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, Account.Name 
             FROM Contact 
             WHERE Email != null 
             ORDER BY LastName, FirstName 
             LIMIT ${limit}`;
  }

  const response = await fetch(`${instanceUrl}/services/data/v57.0/query/?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Salesforce API error details:', {
      status: response.status,
      statusText: response.statusText,
      response: errorText,
      url: `${instanceUrl}/services/data/v57.0/query/?q=${encodeURIComponent(query)}`
    });
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    throw new Error(`Salesforce API error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  const contacts = data.records || [];

  // Format contacts for the survey system
  return contacts.map((contact: any) => ({
    id: contact.Id,
    email: contact.Email,
    phone: contact.Phone || contact.MobilePhone || null,
    firstName: contact.FirstName || '',
    lastName: contact.LastName || '',
    name: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
    company: contact.Account?.Name || '',
    title: contact.Title || '',
    department: contact.Department || '',
    source: 'salesforce',
    salesforceId: contact.Id
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Check for access token first (from OAuth or session)
    if (process.env.SALESFORCE_ACCESS_TOKEN && process.env.SALESFORCE_INSTANCE_URL) {
      // Use direct Salesforce API call with session token (fallback)
      const accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
      const instanceUrl = process.env.SALESFORCE_INSTANCE_URL.replace(/\/$/, ''); // Remove trailing slash
      
      const contacts = await getContactsDirectly(accessToken, instanceUrl, search, limit);
      return NextResponse.json({
        success: true,
        contacts: contacts,
        total: contacts.length,
        searchTerm: search
      });
    } else if (process.env.SALESFORCE_USERNAME && process.env.SALESFORCE_PASSWORD && process.env.SALESFORCE_CONSUMER_KEY) {
      const sfClient = createSalesforceClient();
      
      // Authenticate with stored credentials
      await sfClient.authenticate(
        process.env.SALESFORCE_USERNAME!,
        process.env.SALESFORCE_PASSWORD!
      );

      // Get contacts with enhanced fields including phone numbers
      const contacts = await sfClient.getEnhancedContacts(search, limit);

      // Format contacts for the survey system (same structure as manual entry)
      const formattedContacts = contacts.map(contact => ({
        id: contact.Id,
        email: contact.Email,
        phone: contact.Phone || contact.MobilePhone || null,
        firstName: contact.FirstName || '',
        lastName: contact.LastName || '',
        name: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
        company: contact.Account?.Name || '',
        title: contact.Title || '',
        department: contact.Department || '',
        source: 'salesforce',
        salesforceId: contact.Id
      }));

      return NextResponse.json({
        success: true,
        contacts: formattedContacts,
        total: formattedContacts.length,
        searchTerm: search
      });
    } else if (process.env.SALESFORCE_ACCESS_TOKEN && process.env.SALESFORCE_INSTANCE_URL) {
      // Fallback to direct access with token (if available)
      const accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
      const instanceUrl = process.env.SALESFORCE_INSTANCE_URL.replace(/\/$/, ''); // Remove trailing slash
      
      // Use direct Salesforce API call
      const contacts = await getContactsDirectly(accessToken, instanceUrl, search, limit);
      return NextResponse.json({
        success: true,
        contacts: contacts,
        total: contacts.length,
        searchTerm: search
      });
    } else {
      return NextResponse.json(
        { error: 'Salesforce credentials not configured' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Salesforce contacts fetch error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch contacts from Salesforce',
        details: 'Please check your Salesforce credentials and connection'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { selectedContacts, surveyId } = await request.json();

    if (!selectedContacts || !Array.isArray(selectedContacts)) {
      return NextResponse.json(
        { error: 'Selected contacts array is required' },
        { status: 400 }
      );
    }

    // Validate contact data structure (same as manual entry)
    const validatedContacts = selectedContacts.map(contact => ({
      id: contact.id || contact.salesforceId,
      email: contact.email,
      phone: contact.phone || null,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      company: contact.company || '',
      source: 'salesforce',
      salesforceId: contact.salesforceId || contact.id
    }));

    // Filter out contacts without email addresses
    const contactsWithEmail = validatedContacts.filter(contact => 
      contact.email && contact.email.includes('@')
    );

    return NextResponse.json({
      success: true,
      processedContacts: contactsWithEmail,
      imported: contactsWithEmail.length,
      skipped: selectedContacts.length - contactsWithEmail.length,
      message: `Successfully processed ${contactsWithEmail.length} contacts from Salesforce`
    });

  } catch (error) {
    console.error('Salesforce contact processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process selected contacts' },
      { status: 500 }
    );
  }
}