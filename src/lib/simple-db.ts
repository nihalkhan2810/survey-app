import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

// Simple in-memory database for testing - replace with DynamoDB later
const users = new Map()
const surveys = new Map()
const responses = new Map() // Add responses storage

// Create demo users
async function initializeUsers() {
  if (users.size === 0) {
    const adminPassword = await bcrypt.hash('demo123', 12)
    const userPassword = await bcrypt.hash('demo123', 12)
    
    users.set('admin@sayz.com', {
      id: nanoid(),
      email: 'admin@sayz.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    
    users.set('user@sayz.com', {
      id: nanoid(),
      email: 'user@sayz.com',
      name: 'Demo User',
      password: userPassword,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
}

export const simpleDb = {
  async findUserByEmail(email: string) {
    await initializeUsers()
    return users.get(email) || null
  },

  async findUserById(id: string) {
    await initializeUsers()
    for (const user of users.values()) {
      if (user.id === id) return user
    }
    return null
  },

  async createUser(userData: any) {
    await initializeUsers()
    users.set(userData.email, userData)
    return userData
  },

  async getAllUsers() {
    await initializeUsers()
    return Array.from(users.values())
  },

  async getAllSurveys() {
    return Array.from(surveys.values())
  },

  async getAllResponses() {
    return Array.from(responses.values()).map(responseArray => responseArray).flat()
  },

  async findResponseByEmailAndSurvey(email: string, surveyId: string) {
    const surveyResponses = responses.get(surveyId) || []
    return surveyResponses.find((response: any) => 
      response.respondentEmail && 
      response.respondentEmail.toLowerCase().trim() === email.toLowerCase().trim()
    ) || null
  },

  async findResponseByEmailSurveyAndBatch(email: string, surveyId: string, batchId?: string) {
    const surveyResponses = responses.get(surveyId) || []
    return surveyResponses.find((response: any) => 
      response.respondentEmail && 
      response.respondentEmail.toLowerCase().trim() === email.toLowerCase().trim() &&
      response.batchId === batchId
    ) || null
  },

  async createResponse(responseData: any) {
    const responseId = nanoid()
    const response = {
      id: responseId,
      ...responseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!responses.has(responseData.surveyId)) {
      responses.set(responseData.surveyId, [])
    }
    
    responses.get(responseData.surveyId).push(response)
    return response
  }
}

// Export standalone function for saving responses
export async function saveResponse(surveyId: string, responseData: any) {
  const responseId = nanoid()
  const response = {
    id: responseId,
    surveyId,
    submittedAt: new Date().toISOString(),
    type: responseData.metadata?.provider || 'unknown',
    ...responseData
  }

  if (!responses.has(surveyId)) {
    responses.set(surveyId, [])
  }
  
  responses.get(surveyId).push(response)
  return response
}