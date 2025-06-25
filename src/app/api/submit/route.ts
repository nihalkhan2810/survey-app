import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { database } from '@/lib/database';
import { markParticipantResponded, getParticipant } from '@/lib/participant_tracker';
import { triggerCallsForNonResponders } from '@/lib/simple_call_reminder';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, answers, identity, participantId } = await req.json();

    if (!surveyId || !answers) {
      return NextResponse.json({ message: 'Missing surveyId or answers' }, { status: 400 });
    }

    // Create response record with identity information
    const responseData = {
      id: nanoid(),
      surveyId,
      answers,
      identity: identity || { isAnonymous: true }, // Default to anonymous if not provided
      submittedAt: new Date().toISOString(),
      type: 'web' // Mark as web submission vs voice
    };

    // Save response to database
    await database.createResponse(responseData);

    // Mark participant as responded if participant ID is provided
    if (participantId) {
      const marked = await markParticipantResponded(participantId);
      if (marked) {
        console.log(`Participant ${participantId} marked as responded`);
        
        // Get the participant to check if call reminders are enabled for this survey
        const participant = await getParticipant(participantId);
        if (participant) {
          console.log(`Response received from tracked participant. Triggering calls for non-responders in survey ${surveyId}...`);
          
          // Trigger calls for non-responders immediately after first response
          try {
            const result = await triggerCallsForNonResponders(surveyId);
            console.log(`Call trigger result: ${result.success} successful, ${result.failed} failed`);
          } catch (callError) {
            console.error('Failed to trigger calls for non-responders:', callError);
            // Don't fail the survey submission if call triggering fails
          }
        }
      }
    }

    return NextResponse.json({ message: 'Survey submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit survey:', error);
    return NextResponse.json({ message: 'Failed to submit survey' }, { status: 500 });
  }
} 