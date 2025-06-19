import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLES } from '@/lib/dynamodb'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { database, getDatabaseType } from '@/lib/database'

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

export async function GET(req: NextRequest) {
  try {
    // Check database connection
    const dbStatus = await database.checkConnection()
    
    return NextResponse.json({
      status: 'ok',
      database: {
        ...dbStatus,
        type: getDatabaseType()
      },
      message: dbStatus.connected 
        ? `Connected to ${dbStatus.type} database` 
        : `Failed to connect to ${dbStatus.type}: ${dbStatus.error}`
    })
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to check database connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // This endpoint can be used to trigger database setup
    // For now, it just returns the connection status
    const dbType = getDatabaseType()
    
    if (dbType === 'DynamoDB') {
      return NextResponse.json({
        message: 'DynamoDB is configured. Run "npm run setup-db" to create tables.',
        instructions: [
          '1. Ensure AWS credentials are set in .env.local',
          '2. Run: npm run setup-db',
          '3. Check AWS DynamoDB console to verify tables'
        ]
      })
    }
    
    return NextResponse.json({
      message: 'Using in-memory database. Configure AWS credentials to use DynamoDB.',
      instructions: [
        '1. Add AWS credentials to .env.local',
        '2. Set USE_DYNAMODB=true',
        '3. Restart the application'
      ]
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to check setup status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}