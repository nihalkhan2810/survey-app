import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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

    // Get dashboard statistics
    const [
      totalUsers,
      totalSurveys,
      totalResponses,
      activeUsers,
      surveysThisMonth,
      responsesThisMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.survey.count(),
      prisma.response.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.survey.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.response.count({
        where: {
          submittedAt: {
            gte: startOfMonth
          }
        }
      })
    ])

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