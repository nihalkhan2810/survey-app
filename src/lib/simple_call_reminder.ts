import { getNonResponders, markCallTriggered } from './participant_tracker';

/**
 * Simple call reminder system using participant tracking
 */
export const triggerCallsForNonResponders = async (surveyId: string): Promise<{ success: number; failed: number; results: any[] }> => {
  console.log(`Checking for non-responders in survey ${surveyId}...`);
  
  try {
    // Enable testing mode - only look at latest batch to avoid old responses
    const testingMode = process.env.NODE_ENV === 'development' || process.env.CALL_TESTING_MODE === 'true';
    const nonResponders = await getNonResponders(surveyId, testingMode);
    console.log(`Found ${nonResponders.length} non-responders`);
    
    if (nonResponders.length === 0) {
      return { success: 0, failed: 0, results: [] };
    }
    
    const results = [];
    let successCount = 0;
    let failedCount = 0;
    
    for (const participant of nonResponders) {
      console.log(`Triggering call for participant ${participant.id} (${participant.email} -> ${participant.phoneNumber})`);
      
      try {
        // Try to make VAPI call
        const callResult = await makeVAPICall(participant.surveyId, participant.phoneNumber);
        
        if (callResult.success) {
          // Mark participant as called
          await markCallTriggered(participant.id, callResult.callId);
          successCount++;
          results.push({
            participantId: participant.id,
            email: participant.email,
            phone: participant.phoneNumber,
            status: 'success',
            callId: callResult.callId
          });
        } else {
          failedCount++;
          results.push({
            participantId: participant.id,
            email: participant.email,
            phone: participant.phoneNumber,
            status: 'failed',
            error: callResult.error
          });
        }
      } catch (error) {
        console.error(`Failed to trigger call for participant ${participant.id}:`, error);
        failedCount++;
        results.push({
          participantId: participant.id,
          email: participant.email,
          phone: participant.phoneNumber,
          status: 'error',
          error: error.message
        });
      }
    }
    
    console.log(`Call reminder results: ${successCount} successful, ${failedCount} failed`);
    return { success: successCount, failed: failedCount, results };
    
  } catch (error) {
    console.error('Error in triggerCallsForNonResponders:', error);
    throw error;
  }
};

/**
 * Make a VAPI call to a specific phone number using the same flow as manual calls
 */
const makeVAPICall = async (surveyId: string, phoneNumber: string): Promise<{ success: boolean; callId?: string; error?: string }> => {
  try {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Check if we have VAPI API key from environment
    if (!process.env.VAPI_API_KEY) {
      return { success: false, error: 'VAPI API key not configured' };
    }
    
    // Get survey data from the surveys API
    const surveyResponse = await fetch(`${appBaseUrl}/api/surveys/${surveyId}`);
    if (!surveyResponse.ok) {
      return { success: false, error: 'Failed to get survey data' };
    }
    
    const surveyData = await surveyResponse.json();
    
    // Step 1: Create VAPI assistant (same as manual call button)
    const assistantResponse = await fetch(`${appBaseUrl}/api/surveys/vapi-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        surveyId: surveyId,
        surveyData: surveyData
      }),
    });
    
    if (!assistantResponse.ok) {
      const errorData = await assistantResponse.text();
      return { success: false, error: `Failed to create assistant: ${errorData}` };
    }
    
    const assistantResult = await assistantResponse.json();
    const assistantId = assistantResult.assistantId;
    
    // Step 2: Make call using the assistant (same as manual call button)
    const callResponse = await fetch(`${appBaseUrl}/api/surveys/vapi-assistant`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: assistantId,
        phoneNumber: phoneNumber,
        surveyId: surveyId
      }),
    });
    
    if (!callResponse.ok) {
      const errorData = await callResponse.text();
      return { success: false, error: `Failed to make call: ${errorData}` };
    }
    
    const callResult = await callResponse.json();
    
    return { success: true, callId: callResult.callId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};