import { promises as fs } from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export interface EmailReminderConfig {
  surveyId: string;
  emails: string[];
  surveyTopic: string;
  surveyLink: string;
  reminderTime: string; // ISO string
  status: 'scheduled' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  testMode?: boolean;
}

/**
 * Calculate reminder time: 6 hours before survey expiry for surveys > 1 day
 * For testing: use 2 minutes before expiry for surveys < 10 minutes
 */
export const calculateReminderTime = (endDate: string, testMode: boolean = false): string | null => {
  const end = new Date(endDate);
  const now = new Date();
  const durationMs = end.getTime() - now.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // For surveys less than 1 day (24 hours), no reminder
  if (durationHours < 24 && !testMode) {
    return null;
  }
  
  let reminderTime: Date;
  
  if (testMode && durationHours < 1) {
    // Test mode: for surveys < 1 hour, schedule reminder 2 minutes before end
    reminderTime = new Date(end.getTime() - (2 * 60 * 1000));
  } else {
    // Normal mode: 6 hours before survey expiry
    reminderTime = new Date(end.getTime() - (6 * 60 * 60 * 1000));
  }
  
  // Don't schedule reminders in the past
  if (reminderTime.getTime() <= now.getTime()) {
    return null;
  }
  
  return reminderTime.toISOString();
};

/**
 * Schedule email reminders for a survey
 */
export const scheduleEmailReminders = async (
  surveyId: string,
  emails: string[],
  surveyTopic: string,
  surveyLink: string,
  endDate: string,
  testMode: boolean = false
): Promise<boolean> => {
  try {
    const reminderTime = calculateReminderTime(endDate, testMode);
    
    if (!reminderTime) {
      console.log(`No reminder scheduled for survey ${surveyId} - duration too short or invalid`);
      return false;
    }
    
    const reminderConfig: EmailReminderConfig = {
      surveyId,
      emails,
      surveyTopic,
      surveyLink,
      reminderTime,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      testMode
    };
    
    // Save reminder configuration
    const remindersDir = path.join(process.cwd(), 'data', 'email_reminders');
    await fs.mkdir(remindersDir, { recursive: true });
    
    const reminderPath = path.join(remindersDir, `${surveyId}_reminder.json`);
    await fs.writeFile(reminderPath, JSON.stringify(reminderConfig, null, 2));
    
    const reminderDate = new Date(reminderTime);
    console.log(`📧 Email reminder scheduled for survey "${surveyTopic}" (${surveyId})`);
    console.log(`📅 Reminder will be sent at: ${reminderDate.toLocaleString()}`);
    console.log(`👥 Recipients: ${emails.length} emails`);
    console.log(`🧪 Test mode: ${testMode ? 'ON (2 min before)' : 'OFF (6 hours before)'}`);
    
    // In a real implementation, you would use a job scheduler
    // For demo purposes, we'll use setTimeout for testing
    if (testMode) {
      const delay = reminderDate.getTime() - new Date().getTime();
      if (delay > 0 && delay < 10 * 60 * 1000) { // Only if within 10 minutes
        setTimeout(() => {
          executeEmailReminder(reminderConfig);
        }, delay);
        console.log(`⏰ Test reminder will execute in ${Math.round(delay / 1000)} seconds`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error scheduling email reminder:', error);
    return false;
  }
};

/**
 * Execute an email reminder
 */
export const executeEmailReminder = async (config: EmailReminderConfig): Promise<void> => {
  try {
    console.log(`📤 Executing email reminder for survey ${config.surveyId}`);
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    const subject = `⏰ Survey Reminder: "${config.surveyTopic}" expires soon!`;
    const message = `
🔔 Friendly Reminder!

Your survey "${config.surveyTopic}" will expire in 6 hours.

Don't miss your chance to participate! Your feedback is valuable and will help us gather important insights.

📝 Take the survey now: ${config.surveyLink}

Thank you for your time!

---
This is an automated reminder. The survey will no longer be available after the expiration time.
    `.trim();
    
    // Send emails with personalized links
    const emailPromises = config.emails.map(email => {
      // Create a token for the email (using timestamp as batch for reminders)
      const reminderBatch = Date.now().toString();
      const token = Buffer.from(`${email}:${reminderBatch}`).toString('base64');
      
      // Create personalized survey link with token parameter
      const hasParams = config.surveyLink.includes('?');
      const personalizedLink = `${config.surveyLink}${hasParams ? '&' : '?'}t=${token}`;
      
      const personalizedMessage = `
🔔 Friendly Reminder!

Your survey "${config.surveyTopic}" will expire in 6 hours.

Don't miss your chance to participate! Your feedback is valuable and will help us gather important insights.

📝 Take the survey now: ${personalizedLink}

Thank you for your time!

---
This is an automated reminder. The survey will no longer be available after the expiration time.
      `.trim();
      
      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: personalizedMessage,
      });
    });
    
    await Promise.all(emailPromises);
    
    // Update reminder status
    await updateReminderStatus(config.surveyId, 'sent');
    
    console.log(`✅ Email reminder sent successfully to ${config.emails.length} recipients`);
  } catch (error) {
    console.error('Error executing email reminder:', error);
    await updateReminderStatus(config.surveyId, 'failed');
  }
};

/**
 * Update reminder status
 */
export const updateReminderStatus = async (
  surveyId: string,
  status: 'sent' | 'failed'
): Promise<void> => {
  try {
    const remindersDir = path.join(process.cwd(), 'data', 'email_reminders');
    const reminderPath = path.join(remindersDir, `${surveyId}_reminder.json`);
    
    const data = await fs.readFile(reminderPath, 'utf8');
    const config: EmailReminderConfig = JSON.parse(data);
    
    config.status = status;
    config.sentAt = new Date().toISOString();
    
    await fs.writeFile(reminderPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error updating reminder status:', error);
  }
};

/**
 * Check and process due email reminders
 */
export const processDueEmailReminders = async (): Promise<void> => {
  try {
    const remindersDir = path.join(process.cwd(), 'data', 'email_reminders');
    
    try {
      await fs.access(remindersDir);
    } catch {
      return; // Directory doesn't exist
    }
    
    const files = await fs.readdir(remindersDir);
    const now = new Date();
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(remindersDir, file);
      const data = await fs.readFile(filePath, 'utf8');
      const config: EmailReminderConfig = JSON.parse(data);
      
      // Skip if not scheduled or already processed
      if (config.status !== 'scheduled') continue;
      
      const reminderTime = new Date(config.reminderTime);
      if (now >= reminderTime) {
        console.log(`⏰ Processing due email reminder for survey ${config.surveyId}`);
        await executeEmailReminder(config);
      }
    }
  } catch (error) {
    console.error('Error processing due email reminders:', error);
  }
};

/**
 * Start the email reminder background process
 */
export const startEmailReminderScheduler = (): NodeJS.Timeout => {
  console.log('📧 Email reminder scheduler started - checking every minute');
  
  // Process immediately
  processDueEmailReminders();
  
  // Then check every minute
  return setInterval(() => {
    processDueEmailReminders();
  }, 60 * 1000);
};

/**
 * Get all email reminders for a survey
 */
export const getEmailReminders = async (surveyId?: string): Promise<EmailReminderConfig[]> => {
  try {
    const remindersDir = path.join(process.cwd(), 'data', 'email_reminders');
    
    try {
      await fs.access(remindersDir);
    } catch {
      return [];
    }
    
    const files = await fs.readdir(remindersDir);
    const reminders: EmailReminderConfig[] = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      if (surveyId && !file.startsWith(surveyId)) continue;
      
      const filePath = path.join(remindersDir, file);
      const data = await fs.readFile(filePath, 'utf8');
      const config: EmailReminderConfig = JSON.parse(data);
      reminders.push(config);
    }
    
    return reminders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting email reminders:', error);
    return [];
  }
};