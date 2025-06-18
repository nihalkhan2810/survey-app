import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

// Simple in-memory database for testing - replace with DynamoDB later
const users = new Map()
const surveys = new Map()

// Create demo users
async function initializeUsers() {
  if (users.size === 0) {
    const adminPassword = await bcrypt.hash('admin123', 12)
    const userPassword = await bcrypt.hash('user123', 12)
    
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
    return [] as Array<{ submittedAt: string }>
  }
}