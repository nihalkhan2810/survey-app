import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

// Get survey responses for a specific call ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');
    const surveyId = searchParams.get('surveyId');

    if (!callId && !surveyId) {
      return NextResponse.json({ 
        error: 'Either callId or surveyId is required' 
      }, { status: 400 });
    }

    let responses = [];

    if (callId) {
      // Get response for specific call
      const allResponses = await database.getAllResponses();
      responses = allResponses.filter((response: any) => 
        response.callId === callId || response.metadata?.vapiCallId === callId
      );
    } else if (surveyId) {
      // Get all responses for a survey
      responses = await database.getResponsesBySurvey(surveyId);
    }

    // Filter for voice responses only and enhance with call log data
    const voiceResponses = responses.filter((response: any) => 
      response.type?.includes('voice-vapi')
    ).map((response: any) => ({
      ...response,
      isVoiceResponse: true,
      hasCallLogData: !!(response.callId || response.phoneNumber),
      extractionMethod: response.metadata?.extractionMethod || 'unknown',
      hasStructuredAnswers: response.metadata?.hasStructuredAnswers || false,
      processingTimestamp: response.metadata?.processingTimestamp
    }));

    return NextResponse.json({
      responses: voiceResponses,
      total: voiceResponses.length,
      success: true
    });

  } catch (error: any) {
    console.error('Error fetching call log responses:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// Link a call log to a survey response (for manual linking if needed)
export async function POST(req: NextRequest) {
  try {
    const { callId, responseId, surveyId } = await req.json();

    if (!callId || !responseId) {
      return NextResponse.json({ 
        error: 'callId and responseId are required' 
      }, { status: 400 });
    }

    // Get the existing response
    const allResponses = await database.getAllResponses();
    const response = allResponses.find((r: any) => r.id === responseId);

    if (!response) {
      return NextResponse.json({ 
        error: 'Response not found' 
      }, { status: 404 });
    }

    // Update the response with call log linkage
    const updatedResponse = {
      ...response,
      callId: callId,
      linkedAt: new Date().toISOString(),
      metadata: {
        ...response.metadata,
        manuallyLinked: true,
        linkedBy: 'admin'
      }
    };

    // Save the updated response
    await database.createResponse(updatedResponse);

    return NextResponse.json({
      message: 'Call log linked to response successfully',
      response: updatedResponse,
      success: true
    });

  } catch (error: any) {
    console.error('Error linking call log to response:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 