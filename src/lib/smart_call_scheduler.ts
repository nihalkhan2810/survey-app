import { promises as fs } from 'fs';
import path from 'path';
import { getSurveyParticipants } from './participant_tracker';
import { triggerCallsForNonResponders } from './simple_call_reminder';

export interface CallSchedule {
  surveyId: string;
  batchId?: string;
  totalParticipants: number;
  surveyDurationMinutes: number;
  responseThresholdPercent: number; // e.g., 70
  callTriggerPercent: number; // e.g., 70 (of duration)
  createdAt: string;
  scheduledCallTime: string;
  status: 'scheduled' | 'triggered' | 'skipped' | 'completed';
  lastCheckedAt?: string;
  responseCount?: number;
  responseRate?: number;
}

/**
 * Create a smart call schedule for a survey
 */
export const createCallSchedule = async (
  surveyId: string,
  batchId: string | undefined,
  totalParticipants: number,
  surveyDurationMinutes: number,
  responseThresholdPercent: number = 70,
  callTriggerPercent: number = 70
): Promise<CallSchedule> => {
  const now = new Date();
  const callDelayMinutes = Math.floor((surveyDurationMinutes * callTriggerPercent) / 100);
  const scheduledCallTime = new Date(now.getTime() + callDelayMinutes * 60 * 1000);

  const schedule: CallSchedule = {
    surveyId,
    batchId,
    totalParticipants,
    surveyDurationMinutes,
    responseThresholdPercent,
    callTriggerPercent,
    createdAt: now.toISOString(),
    scheduledCallTime: scheduledCallTime.toISOString(),
    status: 'scheduled'
  };

  // Save schedule to file system
  const schedulesDir = path.join(process.cwd(), 'data', 'call_schedules');
  await fs.mkdir(schedulesDir, { recursive: true });
  
  const scheduleId = `${surveyId}_${batchId || 'all'}_${Date.now()}`;
  const schedulePath = path.join(schedulesDir, `${scheduleId}.json`);
  await fs.writeFile(schedulePath, JSON.stringify(schedule, null, 2));

  console.log(`📅 Call scheduled for survey ${surveyId} at ${scheduledCallTime.toLocaleString()}`);
  console.log(`⏰ Will check if ≥${responseThresholdPercent}% of ${totalParticipants} participants responded`);
  
  return schedule;
};

/**
 * Check and process due call schedules
 */
export const processDueCallSchedules = async (): Promise<void> => {
  try {
    const schedulesDir = path.join(process.cwd(), 'data', 'call_schedules');
    
    // Create directory if it doesn't exist
    try {
      await fs.access(schedulesDir);
    } catch {
      await fs.mkdir(schedulesDir, { recursive: true });
      return; // No schedules to process
    }

    const files = await fs.readdir(schedulesDir);
    const now = new Date();

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(schedulesDir, file);
      const data = await fs.readFile(filePath, 'utf8');
      const schedule: CallSchedule = JSON.parse(data);

      // Skip if not scheduled or past due
      if (schedule.status !== 'scheduled') continue;

      const scheduledTime = new Date(schedule.scheduledCallTime);
      if (now < scheduledTime) continue; // Not due yet

      console.log(`🔍 Processing due call schedule for survey ${schedule.surveyId}...`);

      // Get current response count for the specific batch
      let participants = [];
      let respondedCount = 0;
      
      if (schedule.batchId) {
        // Get participants from specific batch
        const participantsDir = path.join(process.cwd(), 'data', 'participants');
        const batchFile = `${schedule.surveyId}_${schedule.batchId}.json`;
        const filePath = path.join(participantsDir, batchFile);
        
        try {
          const data = await fs.readFile(filePath, 'utf8');
          const batch = JSON.parse(data);
          participants = batch.participants;
          respondedCount = participants.filter((p: any) => p.status === 'responded').length;
        } catch (error) {
          console.error(`Failed to read batch file ${batchFile}:`, error);
          continue;
        }
      } else {
        // Fallback to all participants
        participants = await getSurveyParticipants(schedule.surveyId);
        respondedCount = participants.filter(p => p.status === 'responded').length;
      }

      // Calculate thresholds with proper rounding
      const responseThresholdCount = Math.floor((schedule.totalParticipants * schedule.responseThresholdPercent) / 100);
      const responseRate = Math.floor((respondedCount / schedule.totalParticipants) * 100);

      // Update schedule with current stats
      schedule.lastCheckedAt = now.toISOString();
      schedule.responseCount = respondedCount;
      schedule.responseRate = responseRate;

      console.log(`📊 Survey ${schedule.surveyId}${schedule.batchId ? ` (batch ${schedule.batchId})` : ''}: ${respondedCount}/${schedule.totalParticipants} responses (${responseRate}%)`);
      console.log(`🎯 Need ${responseThresholdCount} responses (${schedule.responseThresholdPercent}% of ${schedule.totalParticipants}) to trigger calls`);

      // Check if we should trigger calls (use count threshold, not percentage)
      if (respondedCount >= responseThresholdCount) {
        console.log(`✅ ${respondedCount} responses ≥ ${responseThresholdCount} threshold (${schedule.responseThresholdPercent}% of ${schedule.totalParticipants}) - triggering calls for non-responders`);
        
        // Trigger calls for non-responders
        const result = await triggerCallsForNonResponders(schedule.surveyId);
        
        schedule.status = result.success > 0 ? 'completed' : 'triggered';
        console.log(`📞 Call trigger result: ${result.success} successful, ${result.failed} failed`);
      } else {
        console.log(`❌ ${respondedCount} responses < ${responseThresholdCount} threshold (${schedule.responseThresholdPercent}% of ${schedule.totalParticipants}) - skipping calls to save costs`);
        schedule.status = 'skipped';
      }

      // Save updated schedule
      await fs.writeFile(filePath, JSON.stringify(schedule, null, 2));
    }
  } catch (error) {
    console.error('Error processing call schedules:', error);
  }
};

/**
 * Get live response statistics for a survey
 */
export const getLiveResponseStats = async (surveyId: string): Promise<{
  totalParticipants: number;
  respondedCount: number;
  responseRate: number;
  nonRespondersCount: number;
  batches: Array<{
    batchId: string;
    totalParticipants: number;
    respondedCount: number;
    responseRate: number;
  }>;
}> => {
  try {
    // Get all participants for the survey
    const participants = await getSurveyParticipants(surveyId);
    const totalParticipants = participants.length;
    const respondedCount = participants.filter(p => p.status === 'responded').length;
    const responseRate = totalParticipants > 0 ? Math.floor((respondedCount / totalParticipants) * 100) : 0;
    const nonRespondersCount = totalParticipants - respondedCount;

    // Group by batch to get per-batch stats
    const batchMap = new Map<string, { total: number; responded: number }>();
    
    // Read all participant files to get batch info
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const files = await fs.readdir(participantsDir);
    
    for (const file of files) {
      if (file.startsWith(surveyId) && file.endsWith('.json')) {
        const filePath = path.join(participantsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const batch = JSON.parse(data);
        
        const batchTotal = batch.participants.length;
        const batchResponded = batch.participants.filter((p: any) => p.status === 'responded').length;
        
        batchMap.set(batch.batchId, { total: batchTotal, responded: batchResponded });
      }
    }

    const batches = Array.from(batchMap.entries()).map(([batchId, stats]) => ({
      batchId,
      totalParticipants: stats.total,
      respondedCount: stats.responded,
      responseRate: stats.total > 0 ? Math.floor((stats.responded / stats.total) * 100) : 0
    }));

    return {
      totalParticipants,
      respondedCount,
      responseRate,
      nonRespondersCount,
      batches
    };
  } catch (error) {
    console.error('Error getting live response stats:', error);
    return {
      totalParticipants: 0,
      respondedCount: 0,
      responseRate: 0,
      nonRespondersCount: 0,
      batches: []
    };
  }
};

/**
 * Start the call scheduler background process
 * This should be called periodically (e.g., every minute)
 */
export const startCallScheduler = (): NodeJS.Timeout => {
  console.log('🚀 Smart call scheduler started - checking every minute');
  
  // Process immediately
  processDueCallSchedules();
  
  // Then check every minute
  return setInterval(() => {
    processDueCallSchedules();
  }, 60 * 1000); // Check every minute
};

/**
 * Get all active call schedules for monitoring
 */
export const getActiveCallSchedules = async (): Promise<CallSchedule[]> => {
  try {
    const schedulesDir = path.join(process.cwd(), 'data', 'call_schedules');
    
    try {
      await fs.access(schedulesDir);
    } catch {
      return []; // Directory doesn't exist
    }

    const files = await fs.readdir(schedulesDir);
    const schedules: CallSchedule[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(schedulesDir, file);
      const data = await fs.readFile(filePath, 'utf8');
      const schedule: CallSchedule = JSON.parse(data);
      schedules.push(schedule);
    }

    return schedules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting active call schedules:', error);
    return [];
  }
};