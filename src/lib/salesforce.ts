export interface SalesforceConfig {
  consumerKey: string
  consumerSecret: string
  securityToken: string
  loginUrl?: string
}

export interface SalesforceContact {
  Id: string
  FirstName: string
  LastName: string
  Email: string
  Phone?: string
  Account?: {
    Name: string
  }
}

export interface SalesforceAccount {
  Id: string
  Name: string
  Industry?: string
  Phone?: string
  Website?: string
}

export class SalesforceClient {
  private config: SalesforceConfig
  private accessToken?: string
  private instanceUrl?: string

  constructor(config: SalesforceConfig) {
    this.config = config
  }

  async authenticate(username: string, password: string): Promise<void> {
    try {
      const loginUrl = this.config.loginUrl || 'https://login.salesforce.com'
      const response = await fetch(`${loginUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.config.consumerKey,
          client_secret: this.config.consumerSecret,
          username: username,
          password: password + this.config.securityToken,
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const result = await response.json()
      this.accessToken = result.access_token
      this.instanceUrl = result.instance_url
    } catch (error) {
      throw new Error(`Salesforce authentication failed: ${error}`)
    }
  }

  async authenticateWithOAuth(): Promise<string> {
    const loginUrl = this.config.loginUrl || 'https://login.salesforce.com'
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUri = baseUrl.endsWith('/') 
      ? `${baseUrl}api/salesforce/callback`
      : `${baseUrl}/api/salesforce/callback`
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.consumerKey,
      redirect_uri: redirectUri,
      scope: 'api refresh_token',
    })
    
    return `${loginUrl}/services/oauth2/authorize?${params.toString()}`
  }

  async handleOAuthCallback(code: string, redirectUri: string): Promise<void> {
    try {
      const loginUrl = this.config.loginUrl || 'https://login.salesforce.com'
      const response = await fetch(`${loginUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.consumerKey,
          client_secret: this.config.consumerSecret,
          redirect_uri: redirectUri,
          code: code,
        }),
      })

      if (!response.ok) {
        throw new Error(`OAuth callback failed: ${response.statusText}`)
      }

      const result = await response.json()
      this.accessToken = result.access_token
      this.instanceUrl = result.instance_url
    } catch (error) {
      throw new Error(`OAuth callback failed: ${error}`)
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.accessToken || !this.instanceUrl) {
      throw new Error('Not authenticated. Please call authenticate() first.')
    }

    const url = `${this.instanceUrl}${endpoint}`
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getContacts(limit: number = 100): Promise<SalesforceContact[]> {
    try {
      const query = `SELECT Id, FirstName, LastName, Email, Phone, Account.Name FROM Contact WHERE Email != null LIMIT ${limit}`
      const result = await this.makeRequest(`/services/data/v57.0/query/?q=${encodeURIComponent(query)}`)
      
      return result.records as SalesforceContact[]
    } catch (error) {
      throw new Error(`Failed to fetch contacts: ${error}`)
    }
  }

  async getAccounts(limit: number = 100): Promise<SalesforceAccount[]> {
    try {
      const query = `SELECT Id, Name, Industry, Phone, Website FROM Account LIMIT ${limit}`
      const result = await this.makeRequest(`/services/data/v57.0/query/?q=${encodeURIComponent(query)}`)
      
      return result.records as SalesforceAccount[]
    } catch (error) {
      throw new Error(`Failed to fetch accounts: ${error}`)
    }
  }

  async searchRecords(searchTerm: string, objectType: 'Contact' | 'Account' = 'Contact'): Promise<any[]> {
    try {
      const searchQuery = `FIND {${searchTerm}} IN ALL FIELDS RETURNING ${objectType}(Id, Name, Email)`
      const result = await this.makeRequest(`/services/data/v57.0/search/?q=${encodeURIComponent(searchQuery)}`)
      
      return result.searchRecords || []
    } catch (error) {
      throw new Error(`Search failed: ${error}`)
    }
  }
}

export function createSalesforceClient(): SalesforceClient {
  const config: SalesforceConfig = {
    consumerKey: process.env.SALESFORCE_CONSUMER_KEY!,
    consumerSecret: process.env.SALESFORCE_CONSUMER_SECRET!,
    securityToken: process.env.SALESFORCE_SECURITY_TOKEN!,
    loginUrl: process.env.SALESFORCE_LOGIN_URL
  }

  return new SalesforceClient(config)
}