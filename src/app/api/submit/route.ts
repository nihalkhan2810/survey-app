import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { promises as fs } from 'fs';
import path from 'path';
import { database } from '@/lib/database';
import { markParticipantResponded, getParticipant, getSurveyParticipants } from '@/lib/participant_tracker';
import { createCallSchedule } from '@/lib/smart_call_scheduler';

/**
 * Calculate survey duration in minutes from start and end dates
 */
function calculateSurveyDurationMinutes(startDate: string, endDate: string): number {
  if (!startDate || !endDate) {
    console.warn('⚠️ Missing start_date or end_date, using default 10 minutes');
    return 10;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.warn('⚠️ Invalid date format, using default 10 minutes');
    return 10;
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  
  console.log(`📅 Survey duration calculation: ${start.toISOString()} to ${end.toISOString()} = ${diffMinutes} minutes`);
  
  return diffMinutes;
}

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
          console.log(`Response received from tracked participant in survey ${surveyId}`);
          
          // Check if this is the first response for this batch - if so, schedule smart calls
          try {
            // Get survey data to determine duration
            const surveyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surveys/${surveyId}`);
            if (surveyResponse.ok) {
              const surveyData = await surveyResponse.json();
              
              console.log(`📊 Survey data for ${surveyId}:`, {
                start_date: surveyData.start_date,
                end_date: surveyData.end_date,
                topic: surveyData.topic
              });
              
              // Calculate actual survey duration from start and end dates
              const surveyDurationMinutes = calculateSurveyDurationMinutes(surveyData.start_date, surveyData.end_date);
              console.log(`⏱️ Calculated survey duration: ${surveyDurationMinutes} minutes`);
              
              // Get the current participant's batch info
              const participantsDir = path.join(process.cwd(), 'data', 'participants');
              const files = await fs.readdir(participantsDir);
              
              let currentBatch = null;
              let currentBatchParticipants = 0;
              
              // Find which batch this participant belongs to
              for (const file of files) {
                if (file.startsWith(surveyId) && file.endsWith('.json')) {
                  const filePath = path.join(participantsDir, file);
                  const data = await fs.readFile(filePath, 'utf8');
                  const batch = JSON.parse(data);
                  
                  // Check if current participant is in this batch
                  const foundParticipant = batch.participants.find((p: any) => p.id === participantId);
                  if (foundParticipant) {
                    currentBatch = batch;
                    currentBatchParticipants = batch.participants.length;
                    break;
                  }
                }
              }
              
              if (currentBatch && currentBatchParticipants > 0) {
                console.log(`📅 Scheduling smart calls for survey ${surveyId}, batch ${currentBatch.batchId} (${currentBatchParticipants} participants, ${surveyDurationMinutes} min duration)`);
                
                await createCallSchedule(
                  surveyId,
                  currentBatch.batchId, // Use specific batch ID
                  currentBatchParticipants,
                  surveyDurationMinutes,
                  70, // 70% response threshold
                  70  // Trigger at 70% of duration
                );
              }
            }
          } catch (scheduleError) {
            console.error('Failed to schedule smart calls:', scheduleError);
            // Don't fail the survey submission if scheduling fails
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