import { NextRequest, NextResponse } from 'next/server';
import { getLiveResponseStats } from '@/lib/smart_call_scheduler';

export async function GET(req: NextRequest, { params }: { params: { surveyId: string } }) {
  try {
    const { surveyId } = params;

    if (!surveyId) {
      return NextResponse.json({ 
        message: 'Survey ID is required' 
      }, { status: 400 });
    }

    const stats = await getLiveResponseStats(surveyId);

    return NextResponse.json({
      success: true,
      surveyId,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting live response stats:', error);
    return NextResponse.json({ 
      message: `Failed to get response stats: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}