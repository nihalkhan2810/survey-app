import { triggerCallsForNonResponders } from './simple_call_reminder';

export interface AutoCallConfig {
  surveyId: string;
  delayMinutes: number; // How long to wait before checking for non-responders
  batchId: string; // Specific batch to track
}

/**
 * Schedule automatic call reminders for non-responders
 */
export const scheduleAutomaticCalls = async (config: AutoCallConfig): Promise<void> => {
  const { surveyId, delayMinutes, batchId } = config;
  
  console.log(`Scheduling automatic calls for survey ${surveyId}, batch ${batchId} in ${delayMinutes} minutes`);
  
  // Use setTimeout to wait specified delay
  setTimeout(async () => {
    try {
      console.log(`Auto-trigger time reached for survey ${surveyId}, batch ${batchId}. Checking for non-responders...`);
      
      // Trigger calls for non-responders
      const result = await triggerCallsForNonResponders(surveyId);
      
      console.log(`Auto-trigger completed for survey ${surveyId}:`, {
        successful: result.success,
        failed: result.failed,
        totalProcessed: result.results.length
      });
      
      if (result.success > 0) {
        console.log(`✅ ${result.success} calls successfully triggered for non-responders`);
      }
      
      if (result.failed > 0) {
        console.log(`❌ ${result.failed} calls failed to trigger`);
      }
      
      if (result.results.length === 0) {
        console.log(`🎉 All participants responded! No calls needed for survey ${surveyId}`);
      }
      
    } catch (error) {
      console.error(`Auto-trigger failed for survey ${surveyId}:`, error);
    }
  }, delayMinutes * 60 * 1000); // Convert minutes to milliseconds
};

/**
 * Schedule calls with default timing (5 minutes for testing, can be adjusted)
 */
export const scheduleDefaultAutoCalls = async (surveyId: string, batchId: string): Promise<void> => {
  // Default to 5 minutes for testing - in production you might want 30 minutes or more
  const defaultDelay = 5;
  
  await scheduleAutomaticCalls({
    surveyId,
    delayMinutes: defaultDelay,
    batchId
  });
};