# VAPI Voice Call Integration - Fixed Implementation

## Overview
This document explains the fixed VAPI voice call integration that now properly captures and stores survey responses.

## What Was Fixed

### 1. **Consolidated Webhook Architecture**
- **Before**: Multiple conflicting webhook endpoints with different logic
- **After**: Single unified webhook at `/api/calls/vapi/webhook` with comprehensive response processing

### 2. **Enhanced Response Processing**
- **Structured Response Parsing**: Detects `SURVEY_COMPLETE` markers with JSON data
- **AI-Powered Answer Extraction**: Uses Gemini AI to extract answers from conversation transcripts
- **Smart Fallback**: Falls back to transcript storage if structured parsing fails

### 3. **Improved Assistant Instructions**
- **Before**: Basic conversational instructions without structured output
- **After**: Clear instructions to output `SURVEY_COMPLETE {"answers": {...}}` format after survey completion

### 4. **Unified Storage Layer**
- **Database Abstraction**: Uses database.ts for consistent storage across DynamoDB and file system
- **Proper ID Generation**: Ensures all responses have unique IDs
- **Enhanced Metadata**: Tracks extraction methods, summarization status, and response types

## How It Works Now

### 1. **VAPI Assistant Creation**
```javascript
// Enhanced system prompt includes structured response instructions
const systemPrompt = `You are a friendly AI survey agent...

CRITICAL: When you have collected answers to ALL questions, you MUST end with:
"Thank you for completing our survey! Have a great day!"

Then immediately output: SURVEY_COMPLETE {"answers": {"0": "answer1", "1": "answer2", ...}}
`;
```

### 2. **Webhook Processing Flow**
```
VAPI Call → Webhook Event → Response Processing → Database Storage
                           ↓
                    Structured Parsing ✓
                           ↓
                    AI Answer Extraction (fallback)
                           ↓
                    Transcript Storage (final fallback)
```

### 3. **Response Storage Types**
- **`voice-vapi-structured`**: Successfully parsed structured answers
- **`voice-vapi-transcript`**: Transcript-only storage when extraction fails

### 4. **Database Integration**
- **DynamoDB**: Production storage with proper table structure
- **File System**: Development fallback with JSON storage
- **Automatic Fallback**: Seamlessly switches between storage methods

## Environment Configuration

### Required Variables
```env
# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=secure_webhook_secret

# Base URL for webhook endpoints
NEXT_PUBLIC_APP_URL=https://your-domain.com
# OR
NEXTAUTH_URL=https://your-domain.com

# AI Processing (for answer extraction)
GEMINI_API_KEY=your_gemini_api_key
# OR
OPENAI_API_KEY=your_openai_api_key
```

### Optional Variables
```env
# Custom webhook URL (defaults to baseUrl/api/calls/vapi/webhook)
VAPI_WEBHOOK_URL=https://your-domain.com/api/calls/vapi/webhook

# VAPI phone number for outbound calls
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id

# Pre-configured assistant ID (optional)
VAPI_ASSISTANT_ID=your_assistant_id
```

## API Endpoints

### 1. **Unified Webhook** - `/api/calls/vapi/webhook`
- Handles all VAPI webhook events
- Processes both structured and unstructured responses
- Provides comprehensive logging and error handling

### 2. **Assistant Creation** - `/api/surveys/vapi-assistant`
- Creates survey-specific assistants with enhanced instructions
- Configures webhook URLs automatically
- Returns assistant ID for call initiation

### 3. **Call Initiation** - `/api/calls/vapi/start`
- Initiates VAPI calls with survey context
- Supports bulk calling to multiple phone numbers
- Uses enhanced assistant instructions

## Response Data Structure

### Structured Response
```json
{
  "id": "response_id",
  "surveyId": "survey_id", 
  "type": "voice-vapi-structured",
  "submittedAt": "2024-01-01T00:00:00.000Z",
  "answers": {
    "0": "Yes, I liked the professor",
    "1": "Computer Science"
  },
  "transcript": "full conversation transcript",
  "metadata": {
    "callId": "vapi_call_id",
    "hasStructuredAnswers": true,
    "extractionMethod": "structured|ai-extracted",
    "extractedAnswerCount": 2
  }
}
```

### Transcript-Only Response
```json
{
  "id": "response_id",
  "surveyId": "survey_id",
  "type": "voice-vapi-transcript", 
  "submittedAt": "2024-01-01T00:00:00.000Z",
  "transcript": "processed transcript or summary",
  "metadata": {
    "callId": "vapi_call_id",
    "hasStructuredAnswers": false,
    "transcriptProcessed": true,
    "originalTranscriptLength": 1500
  }
}
```

## Features

### ✅ **Automated Answer Extraction**
- Detects structured `SURVEY_COMPLETE` responses
- Uses AI to extract answers from natural conversation
- Maintains conversation context and survey question mapping

### ✅ **Smart Response Processing**
- Automatic text summarization for lengthy responses
- Question-answer mapping preservation
- Multiple storage format support

### ✅ **Robust Error Handling**
- Graceful fallback between processing methods
- Comprehensive webhook event logging
- Database connection resilience

### ✅ **Production Ready**
- Webhook signature verification
- Environment-based configuration
- Scalable database architecture

## Testing

### 1. **Test Call Flow**
1. Create a survey with 2-3 questions
2. Use VapiCallModal to initiate a test call
3. Answer questions naturally during the call
4. Check survey responses in the dashboard

### 2. **Verify Response Storage**
- Check `/admin` page for response counts
- View individual survey results
- Confirm response data includes both answers and transcript

### 3. **Monitor Webhook Events**
- Check server logs for webhook processing
- Verify structured parsing vs AI extraction
- Confirm database storage success

## Troubleshooting

### Common Issues
1. **No Responses Captured**
   - Verify webhook URL is reachable from VAPI
   - Check webhook secret configuration
   - Review server logs for processing errors

2. **Assistant Not Following Instructions**
   - Ensure OPENAI_API_KEY or GEMINI_API_KEY is configured
   - Verify assistant creation includes enhanced instructions
   - Test with shorter, clearer survey questions

3. **Database Storage Failures**
   - Check DynamoDB credentials and permissions
   - Verify table names match environment configuration
   - Confirm fallback to file system is working

### Debug Logs
Key log messages to monitor:
- `"Processing VAPI survey response for surveyId"`
- `"Successfully extracted X answers using AI"`
- `"Survey response saved via database"`
- `"Database save failed, falling back to file system"`

## Next Steps

1. **Monitor response quality** and adjust AI extraction prompts if needed
2. **Add response validation** to ensure answer completeness
3. **Implement call quality metrics** for optimization
4. **Add real-time response viewing** for live survey monitoring

The VAPI integration is now fully functional and will reliably capture voice survey responses!