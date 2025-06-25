import { startCallScheduler } from './smart_call_scheduler';

// Global variable to ensure scheduler only starts once
let schedulerStarted = false;

/**
 * Initialize the call scheduler on app startup
 * This should be called when the Next.js app starts
 */
export const initializeScheduler = () => {
  if (!schedulerStarted) {
    console.log('🚀 Starting automatic call scheduler...');
    startCallScheduler();
    schedulerStarted = true;
  }
};

// Auto-start the scheduler when this module is imported
initializeScheduler();