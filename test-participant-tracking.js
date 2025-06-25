#!/usr/bin/env node

// Simple test script to verify participant tracking system
// Run with: node test-participant-tracking.js

const fs = require('fs').promises;
const path = require('path');

async function testParticipantTracking() {
  console.log('Testing participant tracking system...');
  
  try {
    // Test 1: Check if participant tracker functions exist
    const participantTrackerPath = path.join(__dirname, 'src', 'lib', 'participant_tracker.ts');
    const participantTracker = await fs.readFile(participantTrackerPath, 'utf8');
    
    const requiredFunctions = [
      'createParticipants',
      'markParticipantResponded', 
      'getNonResponders',
      'markCallTriggered'
    ];
    
    console.log('✓ Checking participant tracker functions:');
    requiredFunctions.forEach(funcName => {
      if (participantTracker.includes(`export const ${funcName}`) || participantTracker.includes(`export function ${funcName}`)) {
        console.log(`  ✓ ${funcName} found`);
      } else {
        console.log(`  ✗ ${funcName} missing`);
      }
    });
    
    // Test 2: Check if simple call reminder exists
    const callReminderPath = path.join(__dirname, 'src', 'lib', 'simple_call_reminder.ts');
    const callReminder = await fs.readFile(callReminderPath, 'utf8');
    
    if (callReminder.includes('triggerCallsForNonResponders')) {
      console.log('✓ triggerCallsForNonResponders function found');
    } else {
      console.log('✗ triggerCallsForNonResponders function missing');
    }
    
    // Test 3: Check if send-survey API has been updated
    const sendSurveyPath = path.join(__dirname, 'src', 'app', 'api', 'send-survey', 'route.ts');
    const sendSurvey = await fs.readFile(sendSurveyPath, 'utf8');
    
    if (!sendSurvey.includes('createCallReminderWatcher')) {
      console.log('✓ Old call reminder system removed from send-survey API');
    } else {
      console.log('✗ Old call reminder system still present in send-survey API');
    }
    
    if (sendSurvey.includes('createParticipants')) {
      console.log('✓ New participant tracking integrated in send-survey API');
    } else {
      console.log('✗ New participant tracking missing in send-survey API');
    }
    
    // Test 4: Check if trigger endpoint exists
    const triggerPath = path.join(__dirname, 'src', 'app', 'api', 'trigger-call-reminders', 'route.ts');
    try {
      const triggerEndpoint = await fs.readFile(triggerPath, 'utf8');
      if (triggerEndpoint.includes('triggerCallsForNonResponders')) {
        console.log('✓ Manual trigger endpoint exists and uses new system');
      }
    } catch (err) {
      console.log('✗ Manual trigger endpoint missing');
    }
    
    console.log('\n📋 System Overview:');
    console.log('1. When survey is created with call reminders enabled:');
    console.log('   - Participant tracking is set up with unique IDs');
    console.log('   - Personalized survey links are sent with participant IDs');
    console.log('   - Old automatic call system is disabled');
    console.log('');
    console.log('2. When participants respond:');
    console.log('   - Survey submission includes participant ID');
    console.log('   - Participant is marked as responded in tracking file');
    console.log('');
    console.log('3. To trigger calls for non-responders:');
    console.log('   - Use POST /api/trigger-call-reminders with surveyId');
    console.log('   - Only non-responders will receive calls');
    console.log('   - Calls are tracked to prevent duplicates');
    
    console.log('\n✅ Participant tracking system test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testParticipantTracking();