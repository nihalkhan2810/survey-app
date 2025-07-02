import { simpleDb } from './simple-db'
import { userOperations, surveyOperations, responseOperations, apiConfigOperations, recipientOperations } from './dynamodb'

// Check if we should use DynamoDB based on environment configuration
// Support both AWS_ prefix and DYNAMODB_ prefix for flexibility
const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true' && 
                     ((process.env.DYNAMODB_ACCESS_KEY_ID && process.env.DYNAMODB_SECRET_ACCESS_KEY) ||
                      (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY))

// Log database configuration in production for debugging
if (process.env.NODE_ENV === 'production') {
  console.log('Database Configuration:', {
    USE_DYNAMODB,
    hasCredentials: !!(process.env.DYNAMODB_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID),
    region: process.env.DYNAMODB_REGION || process.env.AWS_REGION,
    tablesConfigured: !!process.env.DYNAMODB_USERS_TABLE
  })
}

export const database = {
  // User operations
  async findUserByEmail(email: string) {
    try {
      if (USE_DYNAMODB) {
        return await userOperations.findByEmail(email)
      }
      return await simpleDb.findUserByEmail(email)
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  },

  async findUserById(id: string) {
    try {
      if (USE_DYNAMODB) {
        return await userOperations.findById(id)
      }
      return await simpleDb.findUserById(id)
    } catch (error) {
      console.error('Error finding user by id:', error)
      throw error
    }
  },

  async createUser(userData: any) {
    try {
      if (USE_DYNAMODB) {
        return await userOperations.create(userData)
      }
      return await simpleDb.createUser(userData)
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async updateUser(id: string, updates: any) {
    try {
      if (USE_DYNAMODB) {
        return await userOperations.update(id, updates)
      }
      // Simple DB doesn't have update, so we'll just return the user
      return await simpleDb.findUserById(id)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  async getAllUsers() {
    try {
      if (USE_DYNAMODB) {
        // For now, scan all users (not efficient for large datasets)
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
        const { dynamodb, TABLES } = await import('./dynamodb')
        const command = new ScanCommand({ TableName: TABLES.USERS })
        const result = await dynamodb.send(command)
        return result.Items || []
      }
      return await simpleDb.getAllUsers()
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  },

  // Survey operations
  async createSurvey(surveyData: any) {
    try {
      if (USE_DYNAMODB) {
        return await surveyOperations.create(surveyData)
      }
      // Simple DB doesn't have survey operations, return mock
      return surveyData
    } catch (error) {
      console.error('Error creating survey:', error)
      throw error
    }
  },

  async findSurveyById(id: string) {
    try {
      if (USE_DYNAMODB) {
        return await surveyOperations.findById(id)
      }
      return null
    } catch (error) {
      console.error('Error finding survey by id:', error)
      throw error
    }
  },

  async getAllSurveys() {
    try {
      if (USE_DYNAMODB) {
        return await surveyOperations.getAll()
      }
      return await simpleDb.getAllSurveys()
    } catch (error) {
      console.error('Error getting all surveys:', error)
      throw error
    }
  },

  async updateSurvey(id: string, updates: any) {
    try {
      if (USE_DYNAMODB) {
        return await surveyOperations.update(id, updates)
      }
      return null
    } catch (error) {
      console.error('Error updating survey:', error)
      throw error
    }
  },

  async deleteSurvey(id: string) {
    try {
      if (USE_DYNAMODB) {
        return await surveyOperations.delete(id)
      }
      return null
    } catch (error) {
      console.error('Error deleting survey:', error)
      throw error
    }
  },

  // Response operations
  async createResponse(responseData: any) {
    try {
      if (USE_DYNAMODB) {
        return await responseOperations.create(responseData)
      }
      return await simpleDb.createResponse(responseData)
    } catch (error) {
      console.error('Error creating response:', error)
      throw error
    }
  },

  async getAllResponses() {
    try {
      if (USE_DYNAMODB) {
        return await responseOperations.getAll()
      }
      return await simpleDb.getAllResponses()
    } catch (error) {
      console.error('Error getting all responses:', error)
      throw error
    }
  },

  async getResponsesBySurvey(surveyId: string) {
    try {
      if (USE_DYNAMODB) {
        return await responseOperations.findBySurvey(surveyId)
      }
      return []
    } catch (error) {
      console.error('Error getting responses by survey:', error)
      throw error
    }
  },

  async findResponseByEmailAndSurvey(email: string, surveyId: string) {
    try {
      if (USE_DYNAMODB) {
        return await responseOperations.findByEmailAndSurvey(email, surveyId)
      }
      return await simpleDb.findResponseByEmailAndSurvey(email, surveyId)
    } catch (error) {
      console.error('Error finding response by email and survey:', error)
      throw error
    }
  },

  async findResponseByEmailSurveyAndBatch(email: string, surveyId: string, batchId?: string) {
    try {
      if (USE_DYNAMODB) {
        // For DynamoDB, just check by email and survey (ignore batch for now)
        // This means same email can't respond multiple times to same survey in DynamoDB mode
        return await responseOperations.findByEmailAndSurvey(email, surveyId)
      }
      return await simpleDb.findResponseByEmailSurveyAndBatch(email, surveyId, batchId)
    } catch (error) {
      console.error('Error finding response by email, survey and batch:', error)
      throw error
    }
  },

  // API Configuration operations
  async getApiConfig() {
    try {
      if (USE_DYNAMODB) {
        return await apiConfigOperations.getConfig()
      }
      // For local development, return empty config
      return null
    } catch (error) {
      console.error('Error getting API config:', error)
      throw error
    }
  },

  async updateApiConfig(config: any) {
    try {
      if (USE_DYNAMODB) {
        return await apiConfigOperations.updateConfig(config)
      }
      // For local development, just return the config
      return config
    } catch (error) {
      console.error('Error updating API config:', error)
      throw error
    }
  },

  async getApiConfigValue(key: string) {
    try {
      if (USE_DYNAMODB) {
        return await apiConfigOperations.getConfigValue(key)
      }
      // For local development, return null
      return null
    } catch (error) {
      console.error('Error getting API config value:', error)
      throw error
    }
  },

  async updateApiConfigValue(key: string, value: string) {
    try {
      if (USE_DYNAMODB) {
        return await apiConfigOperations.updateConfigValue(key, value)
      }
      // For local development, just return the value
      return value
    } catch (error) {
      console.error('Error updating API config value:', error)
      throw error
    }
  },

  // Recipient operations
  async createRecipients(surveyId: string, emails: string[]) {
    try {
      if (USE_DYNAMODB) {
        return await recipientOperations.createRecipients(surveyId, emails)
      }
      // For simple DB, we'll just return success (recipients not tracked in file system)
      return { batchId: Date.now().toString(), recipientCount: emails.length }
    } catch (error) {
      console.error('Error creating recipients:', error)
      throw error
    }
  },

  async getRecipientsBySurvey(surveyId: string) {
    try {
      if (USE_DYNAMODB) {
        return await recipientOperations.getRecipientsBySurvey(surveyId)
      }
      return []
    } catch (error) {
      console.error('Error getting recipients:', error)
      throw error
    }
  },

  async getNonRespondents(surveyId: string) {
    try {
      if (USE_DYNAMODB) {
        return await recipientOperations.getNonRespondents(surveyId)
      }
      return []
    } catch (error) {
      console.error('Error getting non-respondents:', error)
      throw error
    }
  },

  // Utility function to check database status
  async checkConnection() {
    try {
      if (USE_DYNAMODB) {
        // Try to scan users table to check connection
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
        const { dynamodb, TABLES } = await import('./dynamodb')
        const command = new ScanCommand({ 
          TableName: TABLES.USERS,
          Limit: 1 
        })
        await dynamodb.send(command)
        return { connected: true, type: 'DynamoDB' }
      }
      return { connected: true, type: 'In-Memory' }
    } catch (error) {
      console.error('Database connection check failed:', error)
      return { 
        connected: false, 
        type: USE_DYNAMODB ? 'DynamoDB' : 'In-Memory',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export a function to get current database type
export function getDatabaseType() {
  return USE_DYNAMODB ? 'DynamoDB' : 'In-Memory'
} 