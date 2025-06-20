# VAPI Voice Integration Setup

This document explains how to set up VAPI for AI-powered voice surveys with advanced features including Twilio integration and proper webhook authentication.

## What is VAPI?

VAPI is a voice AI platform that provides natural, conversational voice interactions powered by advanced AI models. It offers better voice quality, more natural conversations, and easier integration compared to traditional voice systems.

## Environment Variables Required

Add these variables to your `.env.local` file:

```bash
# VAPI Configuration (required for voice surveys)
VAPI_API_KEY=your_vapi_api_key_here
VAPI_WEBHOOK_SECRET=your_secure_webhook_secret_here

# Optional: For AI model selection (if you want to use Gemini instead of OpenAI)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# App URL (required for webhooks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Where to Get Your VAPI API Key

1. Go to [vapi.ai](https://vapi.ai)
2. Sign up for an account
3. Navigate to your dashboard
4. Go to the API Keys section
5. Create a new API key
6. Copy the key and add it to your environment variables as `VAPI_API_KEY`

### VAPI Webhook Secret

This is a security measure to verify that webhook calls are coming from VAPI using HMAC-SHA256 signature verification:

1. **Generate a secure random string** (you can use any password generator)
   ```bash
   # Using OpenSSL
   openssl rand -hex 32
   
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add it to your environment** as `VAPI_WEBHOOK_SECRET`

3. **Configure in VAPI Dashboard**: Use the same secret in your assistant or organization webhook configuration

## Features

### Voice Quality
- Uses ElevenLabs for high-quality, natural-sounding voices
- Multiple voice options available (default: "paula")
- Configurable voice settings for optimal clarity
- Background noise suppression enabled

### AI Models
- **Default**: OpenAI GPT-4o-mini (cost-effective, high quality)
- **Alternative**: Google Gemini (if you prefer Google's AI)
- Automatically selects Gemini if you have `GEMINI_API_KEY` but no `OPENAI_API_KEY`
- Smart conversation management with timeout handling

### Conversation Management
- Natural, conversational survey flow
- Intelligent question progression
- Handles off-topic responses gracefully
- Automatic call termination when survey is complete
- 10-minute maximum call duration with configurable timeouts

### Twilio Integration
- VAPI can work with Twilio SIP trunks for phone number management
- Supports both VAPI-managed and bring-your-own phone numbers
- Automatic fallback handling and call routing

## Configuration Options

### Voice Settings
You can customize the voice in `/src/app/api/calls/vapi/start/route.ts`:

```javascript
voice: {
  provider: "11labs",
  voiceId: "paula", // Options: paula, adam, domi, ryan, etc.
  model: "eleven_turbo_v2",
  stability: 0.5,
  similarityBoost: 0.8,
  style: 0.2,
  useSpeakerBoost: true
}
```

### Available Voice IDs
- `paula` - Friendly female voice (default)
- `adam` - Professional male voice
- `domi` - Confident female voice
- `ryan` - Casual male voice
- And many more available on ElevenLabs

### AI Model Settings
```javascript
model: {
  provider: "openai", // or "custom-llm" for Gemini
  model: "gpt-4o-mini",
  temperature: 0.7, // Controls creativity (0.0-1.0)
  maxTokens: 150 // Keeps responses concise
}
```

### Advanced Configuration
```javascript
// Timeout and behavior settings
silenceTimeoutSeconds: 30,
maxDurationSeconds: 600, // 10 minutes max
backgroundSound: "office",
backchannelingEnabled: true,
backgroundDenoisingEnabled: true,
modelOutputInMessagesEnabled: true
```

## Webhook Authentication

The updated integration uses **HMAC-SHA256 signature verification** for enhanced security:

1. **Webhook URL**: `https://yourdomain.com/api/calls/vapi/webhook`
2. **Signature Header**: `X-Vapi-Signature`
3. **Verification**: Compares HMAC-SHA256 hash of payload with provided signature

### Webhook Events Handled
- `status-update` - Call status changes (initiated, ringing, answered, ended)
- `transcript` - Real-time transcription updates
- `function-call` - Custom function executions (if implemented)
- `hang` / `end-of-call-report` - Call completion and final transcript
- `speech-update` - Real-time speech processing updates
- `conversation-update` - Conversation state changes

## Twilio Integration Options

### Option 1: VAPI-Managed Phone Numbers
- Purchase phone numbers directly through VAPI
- Simplified setup and management
- Automatic routing and configuration

### Option 2: Bring Your Own Twilio Numbers (BYO SIP)
Set up SIP trunk integration with your existing Twilio account:

#### 1. Configure Twilio SIP Trunk
```bash
# Create SIP trunk in Twilio Console
# Add termination URI: Your VAPI SIP endpoint
# Configure authentication credentials
```

#### 2. Add Twilio Credentials to VAPI
```bash
curl -X POST https://api.vapi.ai/credential \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "byo-sip-trunk",
    "name": "Twilio Trunk",
    "gateways": [
      {
        "ip": "YOUR_TWILIO_GATEWAY_ID"
      }
    ],
    "outboundLeadingPlusEnabled": true
  }'
```

#### 3. Register Phone Number
```bash
curl -X POST https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "byo-phone-number",
    "name": "Twilio SIP Number",
    "number": "YOUR_SIP_PHONE_NUMBER",
    "numberE164CheckEnabled": false,
    "credentialId": "YOUR_CREDENTIAL_ID"
  }'
```

## How It Works

1. **Survey Creation**: Create surveys as usual in the platform

2. **Voice Call Initiation**: 
   - Click the phone icon on any survey
   - Enter phone numbers (comma-separated)
   - Calls are initiated through VAPI API

3. **AI Conversation**:
   - VAPI calls the provided phone numbers
   - AI assistant introduces the survey topic
   - Conducts natural conversation to gather responses
   - Automatically ends call when complete

4. **Response Storage**:
   - Full conversation transcripts are saved
   - Responses are stored in the same format as other surveys
   - Can be viewed in the survey results dashboard

## Enhanced Error Handling

The updated integration includes:
- **Partial failure handling**: Some calls can succeed while others fail
- **Detailed error reporting**: Specific error messages for each failed call
- **Retry logic**: Built-in resilience for network issues
- **Call status tracking**: Real-time monitoring of call progress

## API Endpoints

### Start Voice Calls
```
POST /api/calls/vapi/start
```

**Request Body:**
```json
{
  "surveyId": "survey_id_here",
  "phoneNumbers": ["+1234567890", "+0987654321"]
}
```

**Response:**
```json
{
  "message": "Voice calls initiated with VAPI.",
  "total": 2,
  "successful": 2,
  "failed": 0,
  "calls": [
    {
      "phoneNumber": "+1234567890",
      "callId": "call_123",
      "status": "initiated"
    }
  ]
}
```

### Webhook Endpoint
```
POST /api/calls/vapi/webhook
```

Handles all webhook events from VAPI with signature verification.

## Cost Comparison

### VAPI + ElevenLabs + OpenAI
- **Pros**: Natural conversation flow, professional voice quality, better user experience
- **Cons**: Higher cost per call
- **Best for**: Professional surveys, complex interactions, brand reputation

### Traditional Twilio + TwiML
- **Pros**: Lower cost per call, good for simple use cases
- **Cons**: Robotic voice, limited conversation flow
- **Best for**: Simple notifications, basic data collection

## Security Features

- **HMAC-SHA256 webhook verification**: Ensures webhook authenticity
- **API key protection**: Secure API key management
- **Call recording encryption**: Secure storage of conversation data
- **Metadata sanitization**: Safe handling of survey data

## Troubleshooting

### Common Issues

1. **"VAPI API key not configured"**
   - Check that `VAPI_API_KEY` is set in your environment
   - Verify the API key is valid and active in VAPI dashboard

2. **Calls not initiating**
   - Verify `NEXT_PUBLIC_APP_URL` is set correctly
   - Check VAPI account credits/billing
   - Ensure phone numbers are in correct format (+1234567890)
   - Review VAPI dashboard for account limitations

3. **Webhook signature verification failures**
   - Verify `VAPI_WEBHOOK_SECRET` matches your VAPI configuration
   - Check that your domain is accessible from the internet
   - Review webhook logs in VAPI dashboard
   - Ensure webhook URL uses HTTPS in production

4. **Call quality issues**
   - Check internet connection stability
   - Verify ElevenLabs voice settings
   - Review background noise settings
   - Test with different voice models

### Testing Checklist

- [ ] Test with a single phone number first
- [ ] Check VAPI dashboard for call logs
- [ ] Review webhook responses in application logs
- [ ] Verify survey responses are being saved correctly
- [ ] Test webhook signature verification
- [ ] Confirm call recordings are accessible

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This will provide additional console output for debugging webhook events and API calls.

## Support

### VAPI-Specific Issues
- Visit [VAPI Documentation](https://docs.vapi.ai)
- Check the VAPI Discord community
- Contact VAPI support through their dashboard
- Review API status at [status.vapi.ai](https://status.vapi.ai)

### Integration Issues
- Check the application logs in your deployment platform
- Review webhook endpoint responses and timing
- Verify environment variable configuration
- Test webhook authentication separately

### Performance Optimization
- Monitor call durations and optimize prompts
- Review token usage for cost optimization
- Implement call result caching if needed
- Consider load balancing for high-volume use cases

## Migration from Legacy Twilio

The VAPI integration runs alongside existing Twilio integrations:

- **Legacy surveys**: Continue using existing Twilio endpoints
- **New surveys**: Automatically use VAPI endpoints
- **No data loss**: All existing functionality preserved
- **Gradual migration**: Switch surveys individually as needed

## Advanced Features

### Custom Function Calls
You can implement custom functions that the AI can call during conversations:

```javascript
// In webhook handler
case 'function-call':
  if (message.functionCall?.name === 'get_user_info') {
    return NextResponse.json({
      result: {
        userInfo: "Retrieved user information successfully"
      }
    });
  }
  break;
```

### Real-Time Transcription
Enable real-time transcription monitoring:

```javascript
case 'transcript':
  // Process real-time transcription
  console.log(`${message.role}: ${message.transcriptPart}`);
  // Can trigger real-time actions based on keywords
  break;
```

### Call Analytics
Track detailed call metrics:
- Call duration and completion rates
- Transcript analysis and sentiment
- Response quality scoring
- User engagement metrics