import { promises as fs } from 'fs';
import path from 'path';

// Test mode configuration - compresses 6-hour simulation into 6 minutes
const TEST_MODE = true;
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || "+1234567890"; // Your phone number

export interface CallReminderConfig {
  enabled: boolean;
  phoneNumber: string;
  surveyId: string;
  surveyTopic: string;
  callScheduledAt?: string;
  callTriggered?: boolean;
  testMode?: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  submittedAt: string;
  type: 'web' | 'voice-vapi' | 'voice-extracted';
}

/**
 * Calculate when the final call reminder should be triggered
 * In test mode: 2 minutes after survey end time
 * In production: 5 hours after survey end time
 */
export const calculateCallReminderTime = (surveyEndDate: string, testMode: boolean = TEST_MODE): string => {
  const endDate = new Date(surveyEndDate);
  const delayMinutes = testMode ? 2 : 300; // 2 minutes for test, 5 hours for production
  const callTime = new Date(endDate.getTime() + (delayMinutes * 60 * 1000));
  return callTime.toISOString();
};

/**
 * Check if a specific participant (phone number) has responded to the survey
 */
export const hasParticipantResponded = async (surveyId: string, phoneNumber: string): Promise<boolean> => {
  try {
    const responsesDir = path.join(process.cwd(), 'data', 'responses');
    const responseFiles = await fs.readdir(responsesDir);
    
    for (const file of responseFiles) {
      if (file.endsWith('.json')) {
        try {
          const responseData = await fs.readFile(path.join(responsesDir, file), 'utf8');
          const response: SurveyResponse = JSON.parse(responseData);
          
          // Check if this response is for our survey
          if (response.surveyId === surveyId) {
            // For voice responses, check if the phone number matches
            if (response.type === 'voice-vapi') {
              // In a real implementation, you'd have phone number stored in metadata
              // For now, we'll assume any voice response for this survey means the participant responded
              return true;
            }
            
            // For web responses, in test mode we'll assume the test participant responded
            // In a real implementation, you'd have better participant tracking
            if (response.type === 'web') {
              return true;
            }
          }
        } catch (error) {
          console.error(`Error reading response file ${file}:`, error);
          continue;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking participant responses:', error);
    return false;
  }
};

/**
 * Schedule a VAPI call reminder for a participant
 */
export const scheduleCallReminder = async (config: CallReminderConfig): Promise<void> => {
  try {
    const scheduledTime = calculateCallReminderTime(config.callScheduledAt || new Date().toISOString(), config.testMode);
    
    // Store the call reminder configuration
    const callRemindersDir = path.join(process.cwd(), 'data', 'call_reminders');
    await fs.mkdir(callRemindersDir, { recursive: true });
    
    const reminderConfig = {
      ...config,
      callScheduledAt: scheduledTime,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };
    
    const cleanPhone = config.phoneNumber.replace(/[^0-9]/g, '');
  const reminderPath = path.join(callRemindersDir, `${config.surveyId}_${cleanPhone}.json`);
    await fs.writeFile(reminderPath, JSON.stringify(reminderConfig, null, 2));
    
    console.log(`Call reminder scheduled for ${config.phoneNumber} at ${scheduledTime}`);
    
    // In a real implementation, you would use a job scheduler like node-cron, bull, or AWS EventBridge
    // For this demo, we'll use setTimeout for immediate testing
    if (config.testMode) {
      const delay = new Date(scheduledTime).getTime() - new Date().getTime();
      if (delay > 0) {
        setTimeout(() => {
          executeCallReminder(config);
        }, delay);
        console.log(`Test mode: Call reminder will execute in ${delay}ms`);
      }
    }
  } catch (error) {
    console.error('Error scheduling call reminder:', error);
    throw error;
  }
};

/**
 * Execute the call reminder - check if participant responded, if not, trigger VAPI call
 */
export const executeCallReminder = async (config: CallReminderConfig): Promise<void> => {
  try {
    console.log(`Executing call reminder for survey ${config.surveyId}, phone ${config.phoneNumber}`);
    
    // Check if participant has responded
    const hasResponded = await hasParticipantResponded(config.surveyId, config.phoneNumber);
    
    if (hasResponded) {
      console.log(`Participant ${config.phoneNumber} has already responded to survey ${config.surveyId}. Skipping call.`);
      await updateCallReminderStatus(config.surveyId, config.phoneNumber, 'skipped_responded');
      return;
    }
    
    console.log(`Participant ${config.phoneNumber} has not responded. Triggering VAPI call...`);
    
    // Trigger VAPI call
    const callResult = await triggerVAPICall(config);
    
    if (callResult.success) {
      console.log(`VAPI call initiated successfully. Call ID: ${callResult.callId}`);
      await updateCallReminderStatus(config.surveyId, config.phoneNumber, 'call_initiated', callResult.callId);
    } else {
      console.error(`Failed to initiate VAPI call: ${callResult.error}`);
      await updateCallReminderStatus(config.surveyId, config.phoneNumber, 'call_failed', undefined, callResult.error);
    }
  } catch (error) {
    console.error('Error executing call reminder:', error);
    await updateCallReminderStatus(config.surveyId, config.phoneNumber, 'error', undefined, error.message);
  }
};

/**
 * Trigger a VAPI call using the same flow as VapiCallModal (Bob)
 */
export const triggerVAPICall = async (config: CallReminderConfig): Promise<{ success: boolean; callId?: string; error?: string }> => {
  try {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Check if we have VAPI API key from environment
    if (!process.env.VAPI_API_KEY) {
      return { success: false, error: 'VAPI API key not configured' };
    }
    
    // Get survey data from the surveys API
    const surveyResponse = await fetch(`${appBaseUrl}/api/surveys/${config.surveyId}`);
    if (!surveyResponse.ok) {
      return { success: false, error: 'Failed to get survey data' };
    }
    
    const surveyData = await surveyResponse.json();
    
    // Use the same direct VAPI call approach as VapiCallModal (Bob)
    const response = await fetch(`${appBaseUrl}/api/calls/vapi/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        surveyId: config.surveyId,
        phoneNumbers: [config.phoneNumber],
        surveyData: {
          topic: surveyData.topic,
          questions: surveyData.questions
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || `HTTP ${response.status}` };
    }
    
    const result = await response.json();
    
    if (result.successful > 0 && result.calls && result.calls.length > 0) {
      return { success: true, callId: result.calls[0].callId };
    } else {
      return { success: false, error: result.errors?.[0]?.error || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update the status of a call reminder
 */
export const updateCallReminderStatus = async (
  surveyId: string, 
  phoneNumber: string, 
  status: string, 
  callId?: string, 
  error?: string
): Promise<void> => {
  try {
    const callRemindersDir = path.join(process.cwd(), 'data', 'call_reminders');
    // Clean phone number for file path - remove all non-alphanumeric characters
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const reminderPath = path.join(callRemindersDir, `${surveyId}_${cleanPhone}.json`);
    
    let config;
    try {
      // Try to read existing config
      const existingData = await fs.readFile(reminderPath, 'utf8');
      config = JSON.parse(existingData);
    } catch (error) {
      // If file doesn't exist, create a basic config
      config = {
        surveyId,
        phoneNumber,
        createdAt: new Date().toISOString(),
        status: 'unknown'
      };
    }
    
    // Update status
    config.status = status;
    config.lastUpdated = new Date().toISOString();
    
    if (callId) {
      config.callId = callId;
    }
    
    if (error) {
      config.error = error;
    }
    
    // Ensure directory exists
    await fs.mkdir(callRemindersDir, { recursive: true });
    
    // Save updated config
    await fs.writeFile(reminderPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error updating call reminder status:', error);
  }
};

/**
 * Get all scheduled call reminders for a survey
 */
export const getCallRemindersForSurvey = async (surveyId: string): Promise<CallReminderConfig[]> => {
  try {
    const callRemindersDir = path.join(process.cwd(), 'data', 'call_reminders');
    const files = await fs.readdir(callRemindersDir);
    const reminders: CallReminderConfig[] = [];
    
    for (const file of files) {
      if (file.startsWith(surveyId) && file.endsWith('.json')) {
        try {
          const data = await fs.readFile(path.join(callRemindersDir, file), 'utf8');
          const reminder = JSON.parse(data);
          reminders.push(reminder);
        } catch (error) {
          console.error(`Error reading reminder file ${file}:`, error);
        }
      }
    }
    
    return reminders;
  } catch (error) {
    console.error('Error getting call reminders:', error);
    return [];
  }
};

/**
 * Test function to simulate the call reminder process
 */
export const testCallReminderFlow = async (surveyId: string): Promise<void> => {
  console.log(`Testing call reminder flow for survey ${surveyId}`);
  
  const config: CallReminderConfig = {
    enabled: true,
    phoneNumber: TEST_PHONE_NUMBER,
    surveyId: surveyId,
    surveyTopic: 'Test Survey',
    testMode: true
  };
  
  // Schedule the call reminder
  await scheduleCallReminder(config);
  
  console.log('Call reminder scheduled successfully. Check console for execution in 2 minutes (test mode).');
};

/**
 * Create a call reminder watcher that monitors responses and triggers calls for non-responders
 */
export const createCallReminderWatcher = async (
  surveyId: string, 
  emails: string[], 
  phoneNumbers: string[]
): Promise<void> => {
  if (emails.length !== phoneNumbers.length) {
    throw new Error('Number of emails must match number of phone numbers');
  }

  // Create email-to-phone mapping
  const emailPhoneMap: Record<string, string> = {};
  emails.forEach((email, index) => {
    emailPhoneMap[email] = phoneNumbers[index];
  });

  // Store the mapping for this survey
  const watcherDir = path.join(process.cwd(), 'data', 'call_watchers');
  await fs.mkdir(watcherDir, { recursive: true });
  
  const watcherConfig = {
    surveyId,
    emailPhoneMap,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  const watcherPath = path.join(watcherDir, `${surveyId}_watcher.json`);
  await fs.writeFile(watcherPath, JSON.stringify(watcherConfig, null, 2));
  
  console.log(`Call reminder watcher created for survey ${surveyId} with ${emails.length} recipients`);
  
  // Start monitoring for responses (in a real implementation, this would be a background job)
  // For testing, we'll check responses periodically
  startResponseMonitoring(surveyId, emailPhoneMap);
};

/**
 * Monitor responses and trigger calls for non-responders
 */
export const startResponseMonitoring = (surveyId: string, emailPhoneMap: Record<string, string>): void => {
  const checkInterval = 30000; // Check every 30 seconds
  
  const checkForNonResponders = async () => {
    try {
      console.log(`Checking for non-responders in survey ${surveyId}...`);
      
      // Get all emails that should respond
      const allEmails = Object.keys(emailPhoneMap);
      
      // Check which emails have responded
      const respondedEmails: string[] = [];
      try {
        const responsesDir = path.join(process.cwd(), 'data', 'responses');
        const responseFiles = await fs.readdir(responsesDir);
        
        for (const file of responseFiles) {
          if (file.endsWith('.json')) {
            try {
              const responseData = await fs.readFile(path.join(responsesDir, file), 'utf8');
              const response: SurveyResponse = JSON.parse(responseData);
              
              if (response.surveyId === surveyId) {
                // For this test implementation, we'll simulate email tracking
                // In a real implementation, you'd have proper email-to-response mapping
                respondedEmails.push(`responder@example.com`); // Placeholder
              }
            } catch (error) {
              continue;
            }
          }
        }
      } catch (error) {
        console.log('No responses directory found or no responses yet');
      }
      
      // Find non-responders
      const nonResponders = allEmails.filter(email => !respondedEmails.includes(email));
      
      if (nonResponders.length > 0) {
        console.log(`Found ${nonResponders.length} non-responders:`, nonResponders);
        
        // Trigger calls for non-responders
        for (const email of nonResponders) {
          const phoneNumber = emailPhoneMap[email];
          if (phoneNumber) {
            console.log(`Triggering call reminder for ${email} -> ${phoneNumber}`);
            
            const callConfig: CallReminderConfig = {
              enabled: true,
              phoneNumber: phoneNumber,
              surveyId: surveyId,
              surveyTopic: `Survey ${surveyId}`,
              testMode: true
            };
            
            try {
              await executeCallReminder(callConfig);
            } catch (callError) {
              console.error(`Failed to trigger call for ${phoneNumber}:`, callError);
            }
          }
        }
        
        // Update watcher status to completed
        await updateWatcherStatus(surveyId, 'completed', `Calls triggered for ${nonResponders.length} non-responders`);
        return; // Stop monitoring after triggering calls
      } else {
        console.log('All recipients have responded. No calls needed.');
      }
      
      // Continue monitoring (in production, you'd use a proper job scheduler)
      setTimeout(checkForNonResponders, checkInterval);
      
    } catch (error) {
      console.error('Error in response monitoring:', error);
      setTimeout(checkForNonResponders, checkInterval); // Continue monitoring despite errors
    }
  };
  
  // Start the monitoring process
  setTimeout(checkForNonResponders, checkInterval);
};

/**
 * Update watcher status
 */
export const updateWatcherStatus = async (
  surveyId: string, 
  status: string, 
  message?: string
): Promise<void> => {
  try {
    const watcherDir = path.join(process.cwd(), 'data', 'call_watchers');
    const watcherPath = path.join(watcherDir, `${surveyId}_watcher.json`);
    
    const existingData = await fs.readFile(watcherPath, 'utf8');
    const config = JSON.parse(existingData);
    
    config.status = status;
    config.lastUpdated = new Date().toISOString();
    if (message) {
      config.message = message;
    }
    
    await fs.writeFile(watcherPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error updating watcher status:', error);
  }
};

/**
 * Manually trigger call reminders for testing (simulate non-responder detection)
 */
export const triggerTestCallReminders = async (surveyId: string): Promise<void> => {
  try {
    const watcherDir = path.join(process.cwd(), 'data', 'call_watchers');
    const watcherPath = path.join(watcherDir, `${surveyId}_watcher.json`);
    
    const watcherData = await fs.readFile(watcherPath, 'utf8');
    const config = JSON.parse(watcherData);
    
    const emailPhoneMap = config.emailPhoneMap;
    const allEmails = Object.keys(emailPhoneMap);
    
    console.log(`Manually triggering call reminders for all ${allEmails.length} recipients (test mode)`);
    
    for (const email of allEmails) {
      const phoneNumber = emailPhoneMap[email];
      console.log(`Triggering test call for ${email} -> ${phoneNumber}`);
      
      const callConfig: CallReminderConfig = {
        enabled: true,
        phoneNumber: phoneNumber,
        surveyId: surveyId,
        surveyTopic: `Test Survey ${surveyId}`,
        testMode: true
      };
      
      await executeCallReminder(callConfig);
    }
    
    await updateWatcherStatus(surveyId, 'test_completed', 'Manual test calls triggered');
  } catch (error) {
    console.error('Error triggering test call reminders:', error);
    throw error;
  }
};

/**
 * Create test survey data for simulation
 */
export const createTestSurvey = async (): Promise<string> => {
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + (6 * 60 * 1000)).toISOString(); // 6 minutes later
  
  const survey = {
    id: `test_${Date.now()}`,
    topic: 'Test Survey - Call Reminder Demo',
    questions: [
      {
        text: 'How would you rate your experience?',
        type: 'rating',
        min: 1,
        max: 5
      }
    ],
    start_date: startDate,
    end_date: endDate,
    reminder_dates: [
      new Date(now.getTime() + (4 * 60 * 1000)).toISOString(), // 4 minutes - first reminder
      new Date(now.getTime() + (5 * 60 * 1000)).toISOString()  // 5 minutes - second reminder
    ],
    reminder_config: [],
    auto_send_reminders: false,
    call_reminder_enabled: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  
  // Save survey
  const surveysDir = path.join(process.cwd(), 'data', 'surveys');
  await fs.mkdir(surveysDir, { recursive: true });
  const surveyPath = path.join(surveysDir, `${survey.id}.json`);
  await fs.writeFile(surveyPath, JSON.stringify(survey, null, 2));
  
  console.log(`Test survey created with ID: ${survey.id}`);
  console.log(`Survey timeline:`);
  console.log(`- Start: ${new Date(startDate).toLocaleString()}`);
  console.log(`- First reminder: ${new Date(survey.reminder_dates[0]).toLocaleString()}`);
  console.log(`- Second reminder: ${new Date(survey.reminder_dates[1]).toLocaleString()}`);
  console.log(`- End: ${new Date(endDate).toLocaleString()}`);
  console.log(`- Call reminder: ${new Date(endDate).toLocaleString()} + 2 minutes`);
  
  return survey.id;
};