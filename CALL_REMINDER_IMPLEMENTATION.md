# Call Reminder Implementation Guide

## Overview
This implementation adds a VAPI voice call reminder feature that triggers calls to participants who haven't responded by the final email reminder. The system is designed with test mode capabilities for immediate testing.

## Features Implemented

### 1. Backend Module (`src/lib/call_reminder_scheduler.ts`)
- **Call scheduling logic** with 2-minute delay for testing (5 hours for production)
- **Participant response checking** to avoid unnecessary calls
- **VAPI integration** using existing call API
- **Status tracking** for call reminders
- **Test mode support** for compressed timeline simulation

### 2. Frontend Component (`src/components/CallReminderToggle.tsx`)
- **Enable/disable toggle** for call reminders
- **Phone number input** with formatting validation
- **Test mode indicator** and timeline preview
- **Simulation button** for immediate testing
- **Status display** for simulation results

### 3. API Integration
- **Modified survey creation API** to handle call reminder configuration
- **New test endpoint** (`/api/test-call-reminder`) for simulation
- **Call reminder scheduling** integrated into survey creation flow

### 4. UI Integration
- **Seamlessly integrated** into existing CreateSurveyForm
- **Positioned after** email reminder configuration
- **Conditional display** based on survey configuration

## Test Mode Configuration

### Timeline (6-minute simulation):
- **Survey Start**: Now
- **First Reminder**: 4 minutes after start
- **Second Reminder**: 5 minutes after start  
- **Survey End**: 6 minutes after start
- **Call Reminder**: 8 minutes after start (2 minutes after end)

### Production Timeline:
- **Call Reminder**: 5 hours after survey end time

## Usage Instructions

### 1. Create a Survey with Call Reminder
1. Navigate to `/surveys/create`
2. Fill in survey topic and questions
3. Set start/end dates (for testing, use 6-minute window)
4. Scroll to "Final Call Reminder (via VAPI)" section
5. Toggle "Enable Final Call Reminder" to ON
6. Enter your phone number in format: `+1 (XXX) XXX-XXXX`
7. Click "Create Survey"

### 2. Test the Call Reminder
1. After creating survey, use the "Simulate Voice Reminder" button
2. Monitor browser console for real-time updates
3. Wait 2 minutes after survey end time
4. Check console logs for call execution

### 3. Monitor Call Reminder Status
- Call reminders are stored in `data/call_reminders/` directory
- Each reminder has a status: `scheduled`, `call_initiated`, `call_failed`, `skipped_responded`
- Use the GET endpoint: `/api/test-call-reminder?surveyId=SURVEY_ID` to check status

## Configuration

### Environment Variables Required
```env
# VAPI Configuration (already set in .env.local)
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test phone number (optional, can be set in component)
TEST_PHONE_NUMBER=+1234567890
```

### File Structure
```
src/
├── lib/
│   └── call_reminder_scheduler.ts    # Core scheduling logic
├── components/
│   └── CallReminderToggle.tsx        # UI component
├── app/api/
│   ├── test-call-reminder/
│   │   └── route.ts                  # Test API endpoint
│   └── surveys/
│       └── route.ts                  # Modified to handle call reminders
data/
└── call_reminders/                   # Stores call reminder configs
```

## Implementation Notes

### 1. VAPI Integration
- Uses existing `/api/calls/vapi/start` endpoint
- Hardcoded to test phone number only (VAPI free tier limitation)
- Includes survey-specific assistant configuration
- Webhook integration for response processing

### 2. Response Checking
- Checks `data/responses/` directory for participant responses
- Matches by survey ID and response type
- Skips call if participant already responded

### 3. Scheduling Mechanism
- **Test Mode**: Uses `setTimeout` for immediate testing
- **Production**: Would integrate with job scheduler (AWS EventBridge, node-cron, etc.)
- Stores reminder configuration in JSON files

### 4. Error Handling
- Graceful fallback if call scheduling fails
- Comprehensive error logging
- Status tracking for debugging

## Testing Scenarios

### Scenario 1: Participant Doesn't Respond
1. Create survey with call reminder enabled
2. Don't respond to the survey
3. Wait for call reminder trigger (2 minutes after end)
4. Expect: VAPI call initiated to your phone

### Scenario 2: Participant Responds
1. Create survey with call reminder enabled
2. Submit a response before survey end time
3. Wait for call reminder trigger time
4. Expect: Call reminder skipped with status "skipped_responded"

### Scenario 3: Simulation Mode
1. Use "Simulate Voice Reminder" button
2. Creates test survey automatically
3. Immediately schedules call reminder
4. Monitor console for real-time progress

## Production Considerations

### 1. Job Scheduling
Replace `setTimeout` with proper job scheduler:
- **AWS EventBridge** for cloud deployment
- **node-cron** for server-based scheduling
- **Redis Queue** for distributed systems

### 2. Phone Number Management
- Implement participant-to-phone mapping
- Support multiple phone numbers per survey
- Phone number validation and formatting

### 3. Response Tracking
- Enhanced participant response matching
- Database-based response tracking
- Real-time response status updates

### 4. Scalability
- Batch call processing
- Rate limiting for VAPI calls
- Retry logic for failed calls

## Troubleshooting

### Common Issues

1. **Call not triggered**
   - Check console logs for errors
   - Verify VAPI API key configuration
   - Ensure phone number format is correct

2. **Phone number validation fails**
   - Use exact format: `+1 (XXX) XXX-XXXX`
   - Ensure it's your registered VAPI phone number

3. **Test mode not working**
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible
   - Monitor network tab for failed requests

### Debug Commands
```bash
# Check call reminder files
ls -la data/call_reminders/

# Monitor server logs
npm run dev

# Test VAPI connectivity
curl -X POST http://localhost:3000/api/calls/vapi/start \
  -H "Content-Type: application/json" \
  -d '{"surveyId":"test","phoneNumbers":["+1234567890"]}'
```

## Future Enhancements

1. **Multi-participant support** with proper phone number mapping
2. **Advanced scheduling** with timezone support
3. **Call analytics** and success rate tracking
4. **Integration with CRM systems** for participant management
5. **Voice message customization** per survey
6. **Retry logic** for failed calls
7. **Cost optimization** with call batching

## Security Considerations

- Phone numbers are stored locally in JSON files
- VAPI API keys should be properly secured
- Implement rate limiting to prevent abuse
- Validate phone numbers against allowlist in production
- Log sanitization to avoid exposing sensitive data