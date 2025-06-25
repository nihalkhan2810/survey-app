import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export interface Participant {
  id: string;
  email: string;
  phoneNumber: string;
  surveyId: string;
  sentAt: string;
  respondedAt?: string;
  callTriggered?: boolean;
  callId?: string;
  status: 'sent' | 'responded' | 'called' | 'no_response';
}

export interface ParticipantBatch {
  surveyId: string;
  batchId: string;
  createdAt: string;
  participants: Participant[];
}

/**
 * Create participant records for a survey
 */
export const createParticipants = async (
  surveyId: string,
  emailPhonePairs: { email: string; phone: string }[]
): Promise<ParticipantBatch> => {
  const batchId = nanoid(10);
  const participants: Participant[] = emailPhonePairs.map(pair => ({
    id: nanoid(12),
    email: pair.email,
    phoneNumber: pair.phone,
    surveyId,
    sentAt: new Date().toISOString(),
    status: 'sent'
  }));

  const batch: ParticipantBatch = {
    surveyId,
    batchId,
    createdAt: new Date().toISOString(),
    participants
  };

  // Save to file system
  const participantsDir = path.join(process.cwd(), 'data', 'participants');
  await fs.mkdir(participantsDir, { recursive: true });
  
  const batchPath = path.join(participantsDir, `${surveyId}_${batchId}.json`);
  await fs.writeFile(batchPath, JSON.stringify(batch, null, 2));

  console.log(`Created ${participants.length} participants for survey ${surveyId}`);
  return batch;
};

/**
 * Mark a participant as responded
 */
export const markParticipantResponded = async (participantId: string): Promise<boolean> => {
  try {
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const files = await fs.readdir(participantsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(participantsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const batch: ParticipantBatch = JSON.parse(data);
        
        const participant = batch.participants.find(p => p.id === participantId);
        if (participant) {
          participant.status = 'responded';
          participant.respondedAt = new Date().toISOString();
          
          // Save updated batch
          await fs.writeFile(filePath, JSON.stringify(batch, null, 2));
          console.log(`Marked participant ${participantId} as responded`);
          return true;
        }
      }
    }
    
    console.warn(`Participant ${participantId} not found`);
    return false;
  } catch (error) {
    console.error('Error marking participant as responded:', error);
    return false;
  }
};

/**
 * Get non-responders for a survey (all batches)
 * Deduplicates by email/phone and prioritizes the latest status
 */
export const getNonResponders = async (surveyId: string, testingMode: boolean = false): Promise<Participant[]> => {
  try {
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const files = await fs.readdir(participantsDir);
    let allParticipants: Participant[] = [];
    
    if (testingMode) {
      // Testing mode: Only look at the latest batch
      const surveyFiles = files
        .filter(file => file.startsWith(surveyId) && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(participantsDir, file);
          return { file, filePath };
        });
      
      if (surveyFiles.length === 0) {
        console.log(`No participant files found for survey ${surveyId}`);
        return [];
      }
      
      // Get file stats to find the most recent one
      const filesWithStats = await Promise.all(
        surveyFiles.map(async ({ file, filePath }) => {
          const stats = await fs.stat(filePath);
          return { file, filePath, mtime: stats.mtime };
        })
      );
      
      // Sort by modification time and get the latest
      const latestFile = filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];
      
      console.log(`Testing mode: Using latest batch file ${latestFile.file}`);
      const data = await fs.readFile(latestFile.filePath, 'utf8');
      const batch: ParticipantBatch = JSON.parse(data);
      allParticipants = batch.participants;
    } else {
      // Normal mode: Collect all participants across all batches
      for (const file of files) {
        if (file.startsWith(surveyId) && file.endsWith('.json')) {
          const filePath = path.join(participantsDir, file);
          const data = await fs.readFile(filePath, 'utf8');
          const batch: ParticipantBatch = JSON.parse(data);
          allParticipants.push(...batch.participants);
        }
      }
    }
    
    // Deduplicate by email/phone, keeping the latest status
    const participantMap = new Map<string, Participant>();
    
    for (const participant of allParticipants) {
      const key = `${participant.email}_${participant.phoneNumber}`;
      const existing = participantMap.get(key);
      
      if (!existing) {
        participantMap.set(key, participant);
      } else {
        // Keep the one with the latest timestamp or highest priority status
        const existingDate = new Date(existing.sentAt);
        const currentDate = new Date(participant.sentAt);
        
        // If existing participant has responded, keep them (don't replace)
        if (existing.status === 'responded') {
          // Keep existing - they already responded
          continue;
        } else if (participant.status === 'responded') {
          // New participant has responded, replace existing
          participantMap.set(key, participant);
        } else if (currentDate > existingDate) {
          // Neither has responded, keep the most recent
          participantMap.set(key, participant);
        }
      }
    }
    
    // Filter for non-responders only
    const nonResponders = Array.from(participantMap.values()).filter(p => 
      p.status === 'sent' || p.status === 'no_response'
    );
    
    const modeText = testingMode ? "Testing mode: latest batch only" : "All batches";
    console.log(`Found ${nonResponders.length} unique non-responders (deduplicated from ${allParticipants.length} total participants) for survey ${surveyId} [${modeText}]`);
    return nonResponders;
  } catch (error) {
    console.error('Error getting non-responders:', error);
    return [];
  }
};

/**
 * Get non-responders for a specific batch
 */
export const getNonRespondersForBatch = async (surveyId: string, batchId: string): Promise<Participant[]> => {
  try {
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const batchFile = `${surveyId}_${batchId}.json`;
    const filePath = path.join(participantsDir, batchFile);
    
    const data = await fs.readFile(filePath, 'utf8');
    const batch: ParticipantBatch = JSON.parse(data);
    
    const nonResponders = batch.participants.filter(p => 
      p.status === 'sent' || p.status === 'no_response'
    );
    
    console.log(`Found ${nonResponders.length} non-responders in batch ${batchId} for survey ${surveyId}`);
    return nonResponders;
  } catch (error) {
    console.error(`Error getting non-responders for batch ${batchId}:`, error);
    return [];
  }
};

/**
 * Mark participant call as triggered
 */
export const markCallTriggered = async (participantId: string, callId?: string): Promise<boolean> => {
  try {
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const files = await fs.readdir(participantsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(participantsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const batch: ParticipantBatch = JSON.parse(data);
        
        const participant = batch.participants.find(p => p.id === participantId);
        if (participant) {
          participant.status = 'called';
          participant.callTriggered = true;
          if (callId) {
            participant.callId = callId;
          }
          
          // Save updated batch
          await fs.writeFile(filePath, JSON.stringify(batch, null, 2));
          console.log(`Marked participant ${participantId} call as triggered`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error marking call as triggered:', error);
    return false;
  }
};

/**
 * Get participant by ID
 */
export const getParticipant = async (participantId: string): Promise<Participant | null> => {
  try {
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const files = await fs.readdir(participantsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(participantsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const batch: ParticipantBatch = JSON.parse(data);
        
        const participant = batch.participants.find(p => p.id === participantId);
        if (participant) {
          return participant;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting participant:', error);
    return null;
  }
};

/**
 * Get all participants for a survey
 */
export const getSurveyParticipants = async (surveyId: string): Promise<Participant[]> => {
  try {
    const participantsDir = path.join(process.cwd(), 'data', 'participants');
    const files = await fs.readdir(participantsDir);
    const participants: Participant[] = [];
    
    for (const file of files) {
      if (file.startsWith(surveyId) && file.endsWith('.json')) {
        const filePath = path.join(participantsDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        const batch: ParticipantBatch = JSON.parse(data);
        participants.push(...batch.participants);
      }
    }
    
    return participants;
  } catch (error) {
    console.error('Error getting survey participants:', error);
    return [];
  }
};