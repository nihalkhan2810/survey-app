import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { promises as fs } from 'fs';
import path from 'path';

// Simple pattern-based answer extraction
function extractAnswersWithPatterns(transcript: string, questions: any[]): Record<string, string> | null {
  try {
    const answers: Record<string, string> = {};
    
    // Handle different transcript formats
    let conversationPairs: Array<{question: string, answer: string}> = [];
    
    // Check if it's a structured conversation format (like from conversation files)
    if (transcript.includes('"role":') && transcript.includes('"parts":')) {
      try {
        const parsed = JSON.parse(transcript);
        if (parsed.history && Array.isArray(parsed.history)) {
          // Extract model questions and user responses
          for (let i = 0; i < parsed.history.length - 1; i++) {
            const current = parsed.history[i];
            const next = parsed.history[i + 1];
            
            if (current.role === 'model' && next.role === 'user') {
              const question = current.parts?.[0]?.text || '';
              const answer = next.parts?.[0]?.text || '';
              if (question && answer) {
                conversationPairs.push({ question: question.trim(), answer: answer.trim() });
              }
            }
          }
        }
      } catch (parseError) {
        console.log('Not a JSON conversation format, trying text parsing');
      }
    }
    
    // If no structured conversation found, try line-by-line parsing
    if (conversationPairs.length === 0) {
      const lines = transcript.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (let j = 0; j < lines.length - 1; j++) {
        const currentLine = lines[j];
        const nextLine = lines[j + 1];
        
        // Check various formats for assistant/user conversation
        const isAssistantLine = currentLine.toLowerCase().includes('assistant:') || 
                               currentLine.toLowerCase().includes('ai:') ||
                               currentLine.toLowerCase().includes('model:');
        const isUserLine = nextLine && (
          nextLine.toLowerCase().includes('user:') || 
          nextLine.toLowerCase().includes('human:') ||
          nextLine.toLowerCase().includes('customer:')
        );
        
        if (isAssistantLine && isUserLine) {
          const question = currentLine.replace(/^(assistant:|ai:|model:)/i, '').trim();
          const answer = nextLine.replace(/^(user:|human:|customer:)/i, '').trim();
          if (question && answer) {
            conversationPairs.push({ question, answer });
          }
        }
      }
    }
    
    // Match conversation pairs to survey questions
    for (let i = 0; i < questions.length; i++) {
      const surveyQuestion = questions[i];
      if (!surveyQuestion.text || surveyQuestion.text.trim() === '') continue;
      
      const questionText = surveyQuestion.text.toLowerCase().replace(/[^\w\s]/g, '');
      
      // Find the best matching conversation pair
      for (const pair of conversationPairs) {
        const conversationQuestion = pair.question.toLowerCase().replace(/[^\w\s]/g, '');
        
        // Check for question similarity (at least 30% of words match)
        const questionWords = questionText.split(/\s+/).filter((w: string) => w.length > 2);
        const conversationWords = conversationQuestion.split(/\s+/).filter((w: string) => w.length > 2);
        
        let matchCount = 0;
        for (const word of questionWords) {
          if (conversationWords.some(cw => cw.includes(word) || word.includes(cw))) {
            matchCount++;
          }
        }
        
        const similarity = questionWords.length > 0 ? matchCount / questionWords.length : 0;
        
        if (similarity > 0.3) { // At least 30% similarity
          let answer = pair.answer;
          
          // For multiple choice questions, try to match options
          if (surveyQuestion.options && surveyQuestion.options.length > 0) {
            const lowerAnswer = answer.toLowerCase();
            for (const option of surveyQuestion.options) {
              if (lowerAnswer.includes(option.toLowerCase()) || 
                  option.toLowerCase().includes(lowerAnswer.substring(0, Math.min(10, lowerAnswer.length)))) {
                answer = option;
                break;
              }
            }
          }
          
          if (answer.length > 0 && !answers[i.toString()]) {
            answers[i.toString()] = answer;
            break; // Found answer for this question, move to next
          }
        }
      }
    }
    
    return Object.keys(answers).length > 0 ? answers : null;
  } catch (error) {
    console.error('Error in pattern-based extraction:', error);
    return null;
  }
}

// AI-powered extraction using Gemini
async function extractAnswersWithAI(transcript: string, questions: any[]): Promise<Record<string, string> | null> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.warn('GEMINI_API_KEY not configured, skipping AI answer extraction');
      return null;
    }

    const extractionPrompt = `You are an expert at analyzing voice survey conversations and extracting the participant's specific answers.

SURVEY QUESTIONS:
${questions.map((q, i) => `Question ${i}: "${q.text}"${q.options ? ` (Multiple choice options: ${q.options.join(', ')})` : ''}`).join('\n')}

CONVERSATION TRANSCRIPT:
${transcript}

Your task: Extract ONLY the participant's direct answers to each question. Look for:
1. When the assistant asks each question
2. What the participant responds immediately after

Rules:
- Extract the participant's actual spoken words as answers
- For multiple choice questions, match the closest option if possible
- If a question wasn't clearly answered, omit it
- Return ONLY a JSON object with question indices as keys

Example: {"0": "Good", "1": "Computer Science"}

JSON Response:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: extractionPrompt }] }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error for answer extraction:', response.status);
      return null;
    }

    const data = await response.json();
    const extractedText = data.candidates[0]?.content?.parts[0]?.text?.trim();
    
    if (!extractedText) {
      console.warn('No answer extraction result from Gemini');
      return null;
    }

    // Parse the JSON response
    const cleanedJson = extractedText.replace(/```json\n?|\n?```/g, '').trim();
    const extractedAnswers = JSON.parse(cleanedJson);
    
    return extractedAnswers;
    
  } catch (error) {
    console.error('Error extracting answers with AI:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { surveyId, useAI = false, forceReprocess = false } = await req.json();
    
    if (!surveyId) {
      return NextResponse.json({ error: 'surveyId is required' }, { status: 400 });
    }

    console.log(`🔄 Reprocessing voice responses for survey: ${surveyId} (AI: ${useAI}, Force: ${forceReprocess})`);

    // Get survey questions
    let surveyQuestions: any[] = [];
    try {
      const survey = await database.findSurveyById(surveyId);
      if (survey?.questions) {
        surveyQuestions = survey.questions;
      }
    } catch (dbError) {
      // Fallback to file system
      try {
        const surveyPath = path.join(process.cwd(), 'data', 'surveys', `${surveyId}.json`);
        const surveyData = await fs.readFile(surveyPath, 'utf8');
        const survey = JSON.parse(surveyData);
        surveyQuestions = survey.questions || [];
      } catch (fileError: any) {
        return NextResponse.json({ 
          error: 'Could not load survey questions',
          details: fileError.message 
        }, { status: 404 });
      }
    }

    if (surveyQuestions.length === 0) {
      return NextResponse.json({ 
        error: 'No survey questions found' 
      }, { status: 404 });
    }

    // Get all responses for this survey
    const responses = await database.getResponsesBySurvey(surveyId);
    
    if (!responses || responses.length === 0) {
      return NextResponse.json({
        message: 'No responses found for this survey',
        surveyId,
        processed: 0
      });
    }

    let processedCount = 0;
    let updatedCount = 0;
    const processingResults: any[] = [];

    for (const response of responses) {
      // Only process voice responses
      const isVoiceResponse = response.type?.includes('voice');
      const hasTranscript = response.transcript && response.transcript.length > 50;
      const needsReprocessing = forceReprocess || 
                               !response.metadata?.hasStructuredAnswers || 
                               !response.answers || 
                               Object.keys(response.answers).length === 0;
      
      if (isVoiceResponse && hasTranscript && needsReprocessing) {
        console.log(`Processing response ${response.id} with transcript length: ${response.transcript.length}`);
        processedCount++;
        
        // Try pattern matching first
        let extractedAnswers = extractAnswersWithPatterns(response.transcript, surveyQuestions);
        let extractionMethod = 'pattern';
        
        // If pattern matching fails and AI is enabled, try AI extraction
        if ((!extractedAnswers || Object.keys(extractedAnswers).length === 0) && useAI) {
          extractedAnswers = await extractAnswersWithAI(response.transcript, surveyQuestions);
          extractionMethod = 'ai';
        }
        
        if (extractedAnswers && Object.keys(extractedAnswers).length > 0) {
          // Update the response with extracted answers
          response.answers = extractedAnswers;
          response.metadata = {
            ...response.metadata,
            hasStructuredAnswers: true,
            extractedAnswerCount: Object.keys(extractedAnswers).length,
            extractionMethod: extractionMethod,
            needsReprocessing: false,
            reprocessedAt: new Date().toISOString()
          };
          
          updatedCount++;
          
          processingResults.push({
            responseId: response.id,
            success: true,
            extractedAnswers: Object.keys(extractedAnswers).length,
            method: extractionMethod
          });
          
          console.log(`✅ Updated response ${response.id} with ${Object.keys(extractedAnswers).length} answers (${extractionMethod})`);
        } else {
          // Mark as processed but no answers found
          response.metadata = {
            ...response.metadata,
            hasStructuredAnswers: false,
            extractedAnswerCount: 0,
            extractionMethod: 'none',
            needsReprocessing: false,
            reprocessedAt: new Date().toISOString()
          };
          
          processingResults.push({
            responseId: response.id,
            success: false,
            reason: 'No answers extracted',
            method: 'none'
          });
          
          console.log(`⚠️ No answers extracted for response ${response.id}`);
        }
      }
    }

    // Save updated responses back to storage
    if (updatedCount > 0) {
      try {
        // For file system storage, save all responses back
        const responsesDir = path.join(process.cwd(), 'data', 'responses');
        const filePath = path.join(responsesDir, `${surveyId}.json`);
        await fs.writeFile(filePath, JSON.stringify(responses, null, 2));
        console.log(`💾 Saved ${updatedCount} updated responses to file system`);
      } catch (saveError) {
        console.error('Error saving updated responses:', saveError);
        return NextResponse.json({ 
          error: 'Failed to save updated responses',
          details: saveError instanceof Error ? saveError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Voice response reprocessing completed',
      surveyId,
      totalResponses: responses.length,
      voiceResponsesProcessed: processedCount,
      responsesUpdated: updatedCount,
      useAI,
      forceReprocess,
      processingResults,
      completedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error reprocessing voice responses:', error);
    return NextResponse.json({ 
      error: 'Failed to reprocess voice responses',
      details: error.message 
    }, { status: 500 });
  }
} 