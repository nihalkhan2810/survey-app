import { NextRequest, NextResponse } from 'next/server';
import { getVapiApiKey } from '@/app/api/admin/vapi/config/route';

export async function GET(req: NextRequest) {
  try {
    // Get VAPI API key
    const vapiApiKey = await getVapiApiKey();
    if (!vapiApiKey) {
      return NextResponse.json({ 
        error: 'VAPI API key not configured' 
      }, { status: 500 });
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Fetch calls from VAPI API
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VAPI API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch call logs from VAPI',
        details: errorText 
      }, { status: response.status });
    }

    const callsData = await response.json();
    let calls = Array.isArray(callsData) ? callsData : [];

    // Transform VAPI call data to our format
    const transformedCalls = calls.map((call: any) => {
      // Process transcript data - handle both message format and transcript format
      let transcriptData = [];
      let hasTranscript = false;

      if (call.artifact?.messages && call.artifact.messages.length > 0) {
        // Use artifact messages (more detailed)
        transcriptData = call.artifact.messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          text: msg.message || msg.content || '',
          timestamp: msg.time || msg.secondsFromStart || 0,
          endTime: msg.endTime || null
        }));
        hasTranscript = true;
      } else if (call.messages && call.messages.length > 0) {
        // Fallback to messages array
        transcriptData = call.messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          text: msg.message || msg.content || '',
          timestamp: msg.time || msg.secondsFromStart || 0,
          endTime: msg.endTime || null
        }));
        hasTranscript = true;
      } else if (call.transcript && Array.isArray(call.transcript)) {
        // Handle direct transcript array
        transcriptData = call.transcript.map((item: any, index: number) => ({
          role: item.role || (index % 2 === 0 ? 'user' : 'assistant'),
          text: item.text || item.content || item.message || '',
          timestamp: item.timestamp || item.time || index,
          endTime: item.endTime || null
        }));
        hasTranscript = transcriptData.length > 0;
      }

      return {
        id: call.id,
        callId: call.id,
        direction: call.type === 'inboundPhoneCall' ? 'inbound' : 'outbound',
        phoneNumber: call.customer?.number || 'Unknown',
        customerNumber: call.customer?.number || 'Unknown',
        assistantNumber: call.phoneNumber?.number || 'Unknown',
        duration: call.endedAt && call.startedAt 
          ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
          : 0,
        status: call.status || 'unknown',
        endedReason: call.endedReason || 'unknown',
        timestamp: call.createdAt || call.startedAt || new Date().toISOString(),
        startTime: call.startedAt,
        endTime: call.endedAt,
        surveyId: call.metadata?.surveyId || call.assistantId,
        surveyName: call.metadata?.surveyTopic || call.assistant?.name || 'Unknown Survey',
        assistantName: call.assistant?.name || 'Survey Assistant',
        respondentName: call.customer?.name || 'Unknown',
        recording: call.recordingEnabled || Boolean(call.recordingUrl),
        transcript: hasTranscript,
        transcriptData: transcriptData,
        cost: call.cost || 0,
        analysis: call.analysis || null,
        metadata: call.metadata || {},
        recordingUrl: call.recordingUrl || null
      };
    });

    // Apply filters
    let filteredCalls = transformedCalls;

    // Status filter
    if (status && status !== 'all') {
      filteredCalls = filteredCalls.filter(call => {
        switch (status) {
          case 'completed':
            return call.status === 'ended' && call.endedReason !== 'customer-did-not-answer';
          case 'missed':
            return call.endedReason === 'customer-did-not-answer' || call.status === 'no-answer';
          case 'failed':
            return call.status === 'failed' || call.endedReason === 'assistant-error';
          case 'ongoing':
            return call.status === 'ringing' || call.status === 'in-progress';
          default:
            return true;
        }
      });
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCalls = filteredCalls.filter(call => 
        call.phoneNumber.toLowerCase().includes(searchLower) ||
        call.respondentName.toLowerCase().includes(searchLower) ||
        call.surveyName.toLowerCase().includes(searchLower) ||
        call.assistantName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    filteredCalls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCalls = filteredCalls.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: filteredCalls.length,
      completed: filteredCalls.filter(call => 
        call.status === 'ended' && call.endedReason !== 'customer-did-not-answer'
      ).length,
      missed: filteredCalls.filter(call => 
        call.endedReason === 'customer-did-not-answer' || call.status === 'no-answer'
      ).length,
      failed: filteredCalls.filter(call => 
        call.status === 'failed' || call.endedReason === 'assistant-error'
      ).length,
      ongoing: filteredCalls.filter(call => 
        call.status === 'ringing' || call.status === 'in-progress'
      ).length
    };

    return NextResponse.json({
      calls: paginatedCalls,
      pagination: {
        page,
        limit,
        total: filteredCalls.length,
        totalPages: Math.ceil(filteredCalls.length / limit),
        hasNext: endIndex < filteredCalls.length,
        hasPrev: page > 1
      },
      stats,
      success: true
    });

  } catch (error: any) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// GET individual call details with transcript
export async function POST(req: NextRequest) {
  try {
    const { callId } = await req.json();
    
    if (!callId) {
      return NextResponse.json({ 
        error: 'Call ID is required' 
      }, { status: 400 });
    }

    // Get VAPI API key
    const vapiApiKey = await getVapiApiKey();
    if (!vapiApiKey) {
      return NextResponse.json({ 
        error: 'VAPI API key not configured' 
      }, { status: 500 });
    }

    // Fetch specific call details from VAPI API
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VAPI API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch call details from VAPI',
        details: errorText 
      }, { status: response.status });
    }

    const call = await response.json();

    // Process detailed transcript data
    let detailedTranscriptData = [];
    let hasTranscript = false;

    if (call.artifact?.messages && call.artifact.messages.length > 0) {
      // Use artifact messages (most detailed)
      detailedTranscriptData = call.artifact.messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        text: msg.message || msg.content || '',
        timestamp: msg.time || msg.secondsFromStart || 0,
        endTime: msg.endTime || null,
        duration: msg.endTime && msg.time ? msg.endTime - msg.time : null
      }));
      hasTranscript = true;
    } else if (call.messages && call.messages.length > 0) {
      // Fallback to messages array
      detailedTranscriptData = call.messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        text: msg.message || msg.content || '',
        timestamp: msg.time || msg.secondsFromStart || 0,
        endTime: msg.endTime || null,
        duration: msg.endTime && msg.time ? msg.endTime - msg.time : null
      }));
      hasTranscript = true;
    } else if (call.transcript && Array.isArray(call.transcript)) {
      // Handle direct transcript array
      detailedTranscriptData = call.transcript.map((item: any, index: number) => ({
        role: item.role || (index % 2 === 0 ? 'user' : 'assistant'),
        text: item.text || item.content || item.message || '',
        timestamp: item.timestamp || item.time || index,
        endTime: item.endTime || null,
        duration: item.duration || null
      }));
      hasTranscript = detailedTranscriptData.length > 0;
    }

    // Transform and return detailed call data
    const detailedCall = {
      id: call.id,
      callId: call.id,
      direction: call.type === 'inboundPhoneCall' ? 'inbound' : 'outbound',
      phoneNumber: call.customer?.number || 'Unknown',
      customerNumber: call.customer?.number || 'Unknown',
      assistantNumber: call.phoneNumber?.number || 'Unknown',
      duration: call.endedAt && call.startedAt 
        ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : 0,
      status: call.status || 'unknown',
      endedReason: call.endedReason || 'unknown',
      timestamp: call.createdAt || call.startedAt || new Date().toISOString(),
      startTime: call.startedAt,
      endTime: call.endedAt,
      surveyId: call.metadata?.surveyId || call.assistantId,
      surveyName: call.metadata?.surveyTopic || call.assistant?.name || 'Unknown Survey',
      assistantName: call.assistant?.name || 'Survey Assistant',
      respondentName: call.customer?.name || 'Unknown',
      recording: call.recordingEnabled || Boolean(call.recordingUrl),
      recordingUrl: call.recordingUrl || null,
      transcript: hasTranscript,
      transcriptData: detailedTranscriptData,
      cost: call.cost || 0,
      analysis: call.analysis || null,
      metadata: call.metadata || {},
      messages: call.messages || [],
      artifacts: call.artifacts || call.artifact || null,
      rawCallData: call // Include raw data for debugging
    };

    return NextResponse.json({
      call: detailedCall,
      success: true
    });

  } catch (error: any) {
    console.error('Error fetching call details:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
