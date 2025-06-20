import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to ensure directory exists
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Save survey responses from VAPI call
async function saveSurveyResponse(surveyId: string, callId: string, transcript: string, metadata: any) {
  try {
    const responsesDir = path.join(process.cwd(), 'data', 'responses');
    await ensureDir(responsesDir);
    const filePath = path.join(responsesDir, `${surveyId}.json`);
    
    let allResponses: any[] = [];
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      allResponses = JSON.parse(fileContents);
    } catch {
      // File doesn't exist yet, start with empty array
    }

    const response = {
      submittedAt: new Date().toISOString(),
      type: 'voice-vapi',
      callId: callId,
      transcript: transcript,
      metadata: metadata,
      // You can add more structured answer extraction here if needed
    };
    
    allResponses.push(response);
    await fs.writeFile(filePath, JSON.stringify(allResponses, null, 2));
    
    console.log(`Survey response saved for surveyId: ${surveyId}, callId: ${callId}`);
  } catch (error) {
    console.error('Error saving survey response:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    // Verify webhook signature for security
    const signature = req.headers.get('x-vapi-signature');
    const secret = process.env.VAPI_WEBHOOK_SECRET || 'default-secret-change-me';
    
    if (!signature || !verifyWebhookSignature(body, signature, secret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    console.log('VAPI Webhook received:', webhookData.message?.type || 'unknown');

    // Handle different webhook message types
    const message = webhookData.message;
    if (!message) {
      console.log('No message in webhook data');
      return NextResponse.json({ received: true });
    }

    switch (message.type) {
      case 'status-update':
        console.log(`Call ${message.call?.id} status: ${message.call?.status}`);
        
        // Handle call status updates
        if (message.call?.status === 'ended') {
          const call = message.call;
          if (call?.metadata?.surveyId) {
            const transcript = call.transcript || 'No transcript available';
            await saveSurveyResponse(call.metadata.surveyId, call.id, transcript, call.metadata);
          }
        }
        break;

      case 'transcript':
        console.log(`Transcript from ${message.role}: ${message.transcriptPart || message.transcript}`);
        break;

      case 'function-call':
        // Handle function calls if you implement them
        console.log('Function call received:', message.functionCall);
        
        // You can return data for function calls here
        if (message.functionCall?.name === 'get_survey_info') {
          return NextResponse.json({
            result: {
              message: "Survey information retrieved successfully"
            }
          });
        }
        break;

      case 'hang':
      case 'end-of-call-report':
        // Call ended - save the survey response
        const call = message.call;
        if (call?.metadata?.surveyId) {
          const transcript = call.transcript || 'No transcript available';
          await saveSurveyResponse(call.metadata.surveyId, call.id, transcript, call.metadata);
        }
        console.log(`Call ${call?.id} ended. Survey response saved.`);
        break;

      case 'speech-update':
        // Handle real-time speech updates if needed
        console.log(`Speech update: ${message.status}`);
        break;

      case 'conversation-update':
        // Handle conversation state changes
        console.log(`Conversation update for call ${message.call?.id}`);
        break;

      default:
        console.log(`Unhandled webhook type: ${message.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('VAPI Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

// VAPI also sends GET requests for webhook verification
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'VAPI webhook endpoint is active',
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
}