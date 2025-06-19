import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.USE_DYNAMODB === 'true' ? 'DynamoDB' : 'In-Memory'
  })
} 