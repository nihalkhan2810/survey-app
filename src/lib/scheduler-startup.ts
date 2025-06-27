import { startCallScheduler } from './smart_call_scheduler';
import { startEmailReminderScheduler } from './email_reminder_scheduler';

// Global variable to ensure scheduler only starts once
let schedulerStarted = false;

/**
 * Initialize all schedulers on app startup
 * This should be called when the Next.js app starts
 */
export const initializeScheduler = () => {
  if (!schedulerStarted) {
    console.log('🚀 Starting automatic schedulers...');
    startCallScheduler();
    startEmailReminderScheduler();
    schedulerStarted = true;
  }
};

// Auto-start the scheduler when this module is imported
initializeScheduler();