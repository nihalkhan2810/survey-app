import { simpleDb } from './simple-db'
import { userOperations, surveyOperations, responseOperations } from './dynamodb'

// Check if we should use DynamoDB based on environment configuration
// Support both AWS_ prefix and DYNAMODB_ prefix for flexibility
const USE_DYNAMODB = process.env.USE_DYNAMODB === 'true' && 
                     ((process.env.DYNAMODB_ACCESS_KEY_ID && process.env.DYNAMODB_SECRET_ACCESS_KEY) ||
                      (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY))

export const database = {
  // User operations
  async findUserByEmail(email: string) {
    if (USE_DYNAMODB) {
      return await userOperations.findByEmail(email)
    }
    return await simpleDb.findUserByEmail(email)
  },

  async findUserById(id: string) {
    if (USE_DYNAMODB) {
      return await userOperations.findById(id)
    }
    return await simpleDb.findUserById(id)
  },

  async createUser(userData: any) {
    if (USE_DYNAMODB) {
      return await userOperations.create(userData)
    }
    return await simpleDb.createUser(userData)
  },

  async updateUser(id: string, updates: any) {
    if (USE_DYNAMODB) {
      return await userOperations.update(id, updates)
    }
    // Simple DB doesn't have update, so we'll just return the user
    return await simpleDb.findUserById(id)
  },

  async getAllUsers() {
    if (USE_DYNAMODB) {
      // For now, scan all users (not efficient for large datasets)
      const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
      const { dynamodb, TABLES } = await import('./dynamodb')
      const command = new ScanCommand({ TableName: TABLES.USERS })
      const result = await dynamodb.send(command)
      return result.Items || []
    }
    return await simpleDb.getAllUsers()
  },

  // Survey operations
  async createSurvey(surveyData: any) {
    if (USE_DYNAMODB) {
      return await surveyOperations.create(surveyData)
    }
    // Simple DB doesn't have survey operations, return mock
    return surveyData
  },

  async findSurveyById(id: string) {
    if (USE_DYNAMODB) {
      return await surveyOperations.findById(id)
    }
    return null
  },

  async getAllSurveys() {
    if (USE_DYNAMODB) {
      return await surveyOperations.getAll()
    }
    return await simpleDb.getAllSurveys()
  },

  async updateSurvey(id: string, updates: any) {
    if (USE_DYNAMODB) {
      return await surveyOperations.update(id, updates)
    }
    return null
  },

  async deleteSurvey(id: string) {
    if (USE_DYNAMODB) {
      return await surveyOperations.delete(id)
    }
    return null
  },

  // Response operations
  async createResponse(responseData: any) {
    if (USE_DYNAMODB) {
      return await responseOperations.create(responseData)
    }
    return responseData
  },

  async getAllResponses() {
    if (USE_DYNAMODB) {
      return await responseOperations.getAll()
    }
    return await simpleDb.getAllResponses()
  },

  async getResponsesBySurvey(surveyId: string) {
    if (USE_DYNAMODB) {
      return await responseOperations.findBySurvey(surveyId)
    }
    return []
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