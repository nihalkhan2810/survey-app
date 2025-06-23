import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'

// Create DynamoDB client with alternative environment variable names for AWS
const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: (process.env.DYNAMODB_ACCESS_KEY_ID && process.env.DYNAMODB_SECRET_ACCESS_KEY) ? {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  } : (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
})

export const dynamodb = DynamoDBDocumentClient.from(client)

// Table names
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'sayz-users',
  SURVEYS: process.env.DYNAMODB_SURVEYS_TABLE || 'sayz-surveys',
  QUESTIONS: process.env.DYNAMODB_QUESTIONS_TABLE || 'sayz-questions',
  RESPONSES: process.env.DYNAMODB_RESPONSES_TABLE || 'sayz-responses',
  ANSWERS: process.env.DYNAMODB_ANSWERS_TABLE || 'sayz-answers',
  REMINDERS: process.env.DYNAMODB_REMINDERS_TABLE || 'sayz-reminders',
  API_CONFIGS: process.env.DYNAMODB_API_CONFIGS_TABLE || 'sayz-api-configs',
}

// User operations
export const userOperations = {
  async findByEmail(email: string) {
    const command = new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    })
    
    const result = await dynamodb.send(command)
    return result.Items?.[0] || null
  },

  async findById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id },
    })
    
    const result = await dynamodb.send(command)
    return result.Item || null
  },

  async create(userData: {
    id: string
    email: string
    name?: string
    password: string
    role?: string
  }) {
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        ...userData,
        role: userData.role || 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    
    await dynamodb.send(command)
    return userData
  },

  async update(id: string, updates: any) {
    const updateExpression = Object.keys(updates)
      .map((key, index) => `#${key} = :val${index}`)
      .join(', ')
    
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key
      return acc
    }, {} as any)
    
    const expressionAttributeValues = Object.keys(updates).reduce((acc, key, index) => {
      acc[`:val${index}`] = updates[key]
      return acc
    }, {} as any)

    const command = new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}, updatedAt = :updatedAt`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })

    const result = await dynamodb.send(command)
    return result.Attributes
  },
}

// Survey operations
export const surveyOperations = {
  async findById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.SURVEYS,
      Key: { id },
    })
    
    const result = await dynamodb.send(command)
    return result.Item || null
  },

  async findByUser(userId: string) {
    const command = new ScanCommand({
      TableName: TABLES.SURVEYS,
      FilterExpression: 'createdBy = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
    
    const result = await dynamodb.send(command)
    return result.Items || []
  },

  async create(surveyData: any) {
    const command = new PutCommand({
      TableName: TABLES.SURVEYS,
      Item: {
        ...surveyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    
    await dynamodb.send(command)
    return surveyData
  },

  async update(id: string, updates: any) {
    const updateExpression = Object.keys(updates)
      .map((key, index) => `#${key} = :val${index}`)
      .join(', ')
    
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key
      return acc
    }, {} as any)
    
    const expressionAttributeValues = Object.keys(updates).reduce((acc, key, index) => {
      acc[`:val${index}`] = updates[key]
      return acc
    }, {} as any)

    const command = new UpdateCommand({
      TableName: TABLES.SURVEYS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}, updatedAt = :updatedAt`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })

    const result = await dynamodb.send(command)
    return result.Attributes
  },

  async delete(id: string) {
    const command = new DeleteCommand({
      TableName: TABLES.SURVEYS,
      Key: { id },
    })
    
    await dynamodb.send(command)
  },

  async getAll() {
    const command = new ScanCommand({
      TableName: TABLES.SURVEYS,
    })
    
    const result = await dynamodb.send(command)
    return result.Items || []
  },
}

// Question operations
export const questionOperations = {
  async findBySurvey(surveyId: string) {
    const command = new ScanCommand({
      TableName: TABLES.QUESTIONS,
      FilterExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId,
      },
    })
    
    const result = await dynamodb.send(command)
    return result.Items || []
  },

  async create(questionData: any) {
    const command = new PutCommand({
      TableName: TABLES.QUESTIONS,
      Item: {
        ...questionData,
        createdAt: new Date().toISOString(),
      },
    })
    
    await dynamodb.send(command)
    return questionData
  },

  async createMany(questions: any[]) {
    const promises = questions.map(question => this.create(question))
    return await Promise.all(promises)
  },
}

// Response operations
export const responseOperations = {
  async findBySurvey(surveyId: string) {
    const command = new ScanCommand({
      TableName: TABLES.RESPONSES,
      FilterExpression: 'surveyId = :surveyId',
      ExpressionAttributeValues: {
        ':surveyId': surveyId,
      },
    })
    
    const result = await dynamodb.send(command)
    return result.Items || []
  },

  async create(responseData: any) {
    const command = new PutCommand({
      TableName: TABLES.RESPONSES,
      Item: {
        ...responseData,
        submittedAt: new Date().toISOString(),
      },
    })
    
    await dynamodb.send(command)
    return responseData
  },

  async getAll() {
    const command = new ScanCommand({
      TableName: TABLES.RESPONSES,
    })
    
    const result = await dynamodb.send(command)
    return result.Items || []
  },
}

// Answer operations
export const answerOperations = {
  async findByResponse(responseId: string) {
    const command = new ScanCommand({
      TableName: TABLES.ANSWERS,
      FilterExpression: 'responseId = :responseId',
      ExpressionAttributeValues: {
        ':responseId': responseId,
      },
    })
    
    const result = await dynamodb.send(command)
    return result.Items || []
  },

  async createMany(answers: any[]) {
    const promises = answers.map(answer => {
      const command = new PutCommand({
        TableName: TABLES.ANSWERS,
        Item: {
          ...answer,
          createdAt: new Date().toISOString(),
        },
      })
      return dynamodb.send(command)
    })
    
    return await Promise.all(promises)
  },
}

// API Configuration operations
export const apiConfigOperations = {
  async getConfig() {
    const command = new GetCommand({
      TableName: TABLES.API_CONFIGS,
      Key: { id: 'global' },
    })
    
    const result = await dynamodb.send(command)
    return result.Item || null
  },

  async updateConfig(config: any) {
    const command = new PutCommand({
      TableName: TABLES.API_CONFIGS,
      Item: {
        id: 'global',
        ...config,
        updatedAt: new Date().toISOString(),
      },
    })
    
    await dynamodb.send(command)
    return config
  },

  async getConfigValue(key: string) {
    const config = await this.getConfig()
    return config?.[key] || null
  },

  async updateConfigValue(key: string, value: string) {
    const config = await this.getConfig() || {}
    config[key] = value
    return await this.updateConfig(config)
  },
}