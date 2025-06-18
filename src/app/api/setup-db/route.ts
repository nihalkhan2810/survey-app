import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLES } from '@/lib/dynamodb'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  // AWS automatically provides credentials in AWS environments
})

async function createTable(tableName: string) {
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }))
    return { exists: true, tableName }
  } catch (error: any) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error
    }
  }

  // Create table
  const createCommand = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  })

  await client.send(createCommand)
  return { created: true, tableName }
}

export async function POST(req: NextRequest) {
  try {
    const results = []

    // Create all tables
    for (const tableName of Object.values(TABLES)) {
      const result = await createTable(tableName)
      results.push(result)
    }

    // Wait a bit for tables to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create demo users
    const adminId = nanoid()
    const userId = nanoid()
    const adminPassword = await bcrypt.hash('admin123', 12)
    const userPassword = await bcrypt.hash('user123', 12)

    await Promise.all([
      dynamodb.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: adminId,
          email: 'admin@sayz.com',
          name: 'Admin User',
          password: adminPassword,
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })),
      dynamodb.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: userId,
          email: 'user@sayz.com',
          name: 'Demo User',
          password: userPassword,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }))
    ])

    return NextResponse.json({
      success: true,
      message: 'Database setup completed!',
      tables: results,
      demoAccounts: [
        { email: 'admin@sayz.com', password: 'admin123', role: 'ADMIN' },
        { email: 'user@sayz.com', password: 'user123', role: 'USER' }
      ]
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed', details: error },
      { status: 500 }
    )
  }
}