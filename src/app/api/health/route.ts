import { NextResponse } from 'next/server'
import { database, getDatabaseType } from '@/lib/database'

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await database.checkConnection()
    
    // Environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      USE_DYNAMODB: process.env.USE_DYNAMODB,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDynamoCredentials: !!(process.env.DYNAMODB_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID),
      dynamoRegion: process.env.DYNAMODB_REGION || process.env.AWS_REGION,
      tablesConfigured: !!process.env.DYNAMODB_USERS_TABLE,
    }

    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        ...dbStatus,
        databaseType: getDatabaseType(),
      },
      nextauth: {
        url: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET
      },
      build: {
        nextVersion: process.env.NEXT_RUNTIME || 'nodejs',
        standalone: true
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Health check failed'
      },
      { status: 500 }
    )
  }
} 