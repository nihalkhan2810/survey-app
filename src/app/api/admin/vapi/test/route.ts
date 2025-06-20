import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ 
        message: 'API key is required' 
      }, { status: 400 });
    }

    // Test VAPI connection
    const response = await fetch('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // Format assistants with necessary info
      const assistants = data.map((assistant: any) => ({
        id: assistant.id,
        name: assistant.name || 'Unnamed Assistant',
        voice: assistant.voice ? {
          provider: assistant.voice.provider,
          voiceId: assistant.voice.voiceId
        } : null
      }));
      
      return NextResponse.json({ 
        success: true,
        assistants: assistants,
        message: 'Connection successful'
      });
    } else {
      const errorData = await response.text();
      return NextResponse.json({ 
        message: `API connection failed: ${response.status} - ${errorData}` 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('VAPI test error:', error);
    return NextResponse.json({ 
      message: 'Connection test failed' 
    }, { status: 500 });
  }
}