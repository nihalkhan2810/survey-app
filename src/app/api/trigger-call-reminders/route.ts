import { NextRequest, NextResponse } from 'next/server';
import { triggerCallsForNonResponders } from '@/lib/simple_call_reminder';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, batchId } = await req.json();

    if (!surveyId) {
      return NextResponse.json({ 
        message: 'Survey ID is required' 
      }, { status: 400 });
    }

    if (batchId) {
      console.log(`Manual trigger requested for survey: ${surveyId}, batch: ${batchId}`);
    } else {
      console.log(`Manual trigger requested for survey: ${surveyId} (all batches)`);
    }
    const result = await triggerCallsForNonResponders(surveyId);

    return NextResponse.json({
      success: true,
      message: batchId 
        ? `Call reminders triggered for survey ${surveyId}, batch ${batchId}`
        : `Call reminders triggered for survey ${surveyId} (all batches)`,
      surveyId,
      batchId: batchId || 'all',
      callResults: {
        successful: result.success,
        failed: result.failed,
        details: result.results
      }
    });

  } catch (error: any) {
    console.error('Error triggering call reminders:', error);
    return NextResponse.json({ 
      message: `Failed to trigger call reminders: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}