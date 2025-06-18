import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { simpleDb } from '@/lib/simple-db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get dashboard statistics using simple database
    const users = await simpleDb.getAllUsers()
    const surveys = await simpleDb.getAllSurveys()
    const responses = await simpleDb.getAllResponses()

    // Calculate statistics
    const totalUsers = users.length
    const totalSurveys = surveys.length
    const totalResponses = responses.length
    
    const activeUsers = users.filter(user => 
      new Date(user.updatedAt) >= thirtyDaysAgo
    ).length
    
    const surveysThisMonth = surveys.filter(survey => 
      new Date(survey.createdAt) >= startOfMonth
    ).length
    
    const responsesThisMonth = responses.filter(response => 
      new Date(response.submittedAt) >= startOfMonth
    ).length

    return NextResponse.json({
      totalUsers,
      totalSurveys,
      totalResponses,
      activeUsers,
      surveysThisMonth,
      responsesThisMonth
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}