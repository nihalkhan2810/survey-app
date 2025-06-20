import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { saveResponse } from '@/lib/simple-db';

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

// Helper to ensure directory exists
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Save survey responses
async function saveSurveyResponse(surveyId: string, answers: Record<string, string>, callData: any) {
  try {
    const responseData = {
      answers,
      metadata: {
        callId: callData.call?.id,
        duration: callData.call?.duration,
        timestamp: new Date().toISOString(),
        phoneNumber: callData.call?.customer?.number,
        cost: callData.call?.cost,
        provider: 'vapi'
      }
    };

    await saveResponse(surveyId, responseData);
    console.log(`Saved survey response for surveyId: ${surveyId}`);
  } catch (error) {
    console.error('Error saving survey response:', error);
  }
}

// Parse survey completion from transcript
function parseSurveyCompletion(transcript: string) {
  try {
    // Look for SURVEY_COMPLETE marker
    const completionIndex = transcript.lastIndexOf('SURVEY_COMPLETE');
    if (completionIndex === -1) return null;
    
    // Extract JSON after the marker
    const jsonPart = transcript.substring(completionIndex + 'SURVEY_COMPLETE'.length).trim();
    const parsed = JSON.parse(jsonPart);
    
    return parsed.answers || null;
  } catch (error) {
    console.error('Error parsing survey completion:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify webhook secret
    const expectedSecret = process.env.VAPI_WEBHOOK_SECRET || 'default-secret';
    const providedSecret = req.headers.get('x-vapi-secret');
    
    if (providedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('VAPI Webhook received:', JSON.stringify(body, null, 2));

    // Handle different VAPI events
    switch (body.message?.type) {
      case 'transcript':
        await handleTranscript(body);
        break;
      case 'hang':
      case 'end-of-call-report':
        await handleCallEnd(body);
        break;
      default:
        console.log('Unhandled VAPI event type:', body.message?.type);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('VAPI webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleTranscript(body: any) {
  try {
    const transcript = body.message.transcript;
    const role = body.message.role; // 'assistant' or 'user'
    
    // Check if this is an assistant message containing SURVEY_COMPLETE
    if (role === 'assistant' && transcript.includes('SURVEY_COMPLETE')) {
      console.log('Survey completion detected in transcript');
      
      // Extract the JSON from the transcript
      const match = transcript.match(/SURVEY_COMPLETE\s*({.*})/);
      if (match) {
        try {
          const answersData = JSON.parse(match[1]);
          const surveyId = body.call?.metadata?.surveyId;
          
          if (surveyId && answersData.answers) {
            await saveSurveyResponse(surveyId, answersData.answers, body);
            console.log('Survey response saved successfully');
          }
        } catch (parseError) {
          console.error('Failed to parse survey completion data:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling transcript:', error);
  }
}

async function handleCallEnd(body: any) {
  try {
    console.log('Call ended:', {
      callId: body.call?.id,
      duration: body.call?.duration,
      endedReason: body.call?.endedReason,
      cost: body.call?.cost
    });

    // Try to extract survey results from the full call transcript
    const transcript = body.call?.transcript || '';
    const surveyId = body.call?.metadata?.surveyId;
    
    if (surveyId && transcript.includes('SURVEY_COMPLETE')) {
      const match = transcript.match(/SURVEY_COMPLETE\s*({.*})/);
      if (match) {
        try {
          const answersData = JSON.parse(match[1]);
          await saveSurveyResponse(surveyId, answersData.answers, body);
          console.log('Survey response saved from call end');
        } catch (parseError) {
          console.error('Failed to parse survey data from call end:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling call end:', error);
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'VAPI survey webhook is active',
    timestamp: new Date().toISOString()
  });
} 