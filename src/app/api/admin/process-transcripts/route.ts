import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Simple function to extract answers from conversation using Gemini
async function extractAnswersFromConversation(conversation: any): Promise<any> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.log('No Gemini API key, skipping AI extraction');
    return null;
  }

  try {
    // Build the conversation text
    let conversationText = '';
    if (conversation.history && Array.isArray(conversation.history)) {
      conversationText = conversation.history
        .map((msg: any) => {
          const role = msg.role === 'model' ? 'AI' : 'User';
          const text = msg.parts?.[0]?.text || '';
          return `${role}: ${text}`;
        })
        .join('\n');
    }

    if (!conversationText) return null;

    // Get survey questions
    const questions = conversation.survey?.questions || [];
    if (questions.length === 0) return null;

    const prompt = `Extract the user's answers from this conversation:

SURVEY QUESTIONS:
${questions.map((q: any, i: number) => `${i}: ${q.text}`).join('\n')}

CONVERSATION:
${conversationText}

Extract the user's actual answers to each question. Return ONLY a JSON object like:
{"0": "user's answer to question 0", "1": "user's answer to question 1"}

If a question wasn't answered, omit it. Return only the JSON, nothing else:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.candidates[0]?.content?.parts[0]?.text?.trim();
    
    if (!result) return null;

    // Clean and parse JSON
    const cleanJson = result.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error('Error extracting answers:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Processing transcripts to extract voice responses...');

    // Read all conversation files
    const conversationsDir = path.join(process.cwd(), 'data', 'conversations');
    let files: string[] = [];
    
    try {
      files = await fs.readdir(conversationsDir);
    } catch (error) {
      return NextResponse.json({ error: 'No conversations directory found' }, { status: 404 });
    }

    let processedCount = 0;
    let successCount = 0;
    const results: any[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      try {
        const filePath = path.join(conversationsDir, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const conversation = JSON.parse(fileContent);

        console.log(`Processing conversation: ${file}`);
        
        if (!conversation.survey?.id) {
          console.log(`No survey ID in ${file}, skipping`);
          continue;
        }

        const surveyId = conversation.survey.id;
        const callSid = conversation.callSid || file.replace('.json', '');

        // Extract answers using AI
        const extractedAnswers = await extractAnswersFromConversation(conversation);
        
        if (extractedAnswers && Object.keys(extractedAnswers).length > 0) {
          // Create response object
          const response = {
            id: nanoid(),
            surveyId: surveyId,
            submittedAt: conversation.startTime || new Date().toISOString(),
            answers: extractedAnswers,
            identity: { isAnonymous: true }, // Voice responses are anonymous by default
            type: 'voice-extracted',
            callSid: callSid,
            metadata: {
              extractedFrom: file,
              questionCount: conversation.survey.questions?.length || 0,
              extractedAnswers: Object.keys(extractedAnswers).length
            }
          };

          // Save to responses file
          const responsesDir = path.join(process.cwd(), 'data', 'responses');
          const responseFile = path.join(responsesDir, `${surveyId}.json`);

          // Read existing responses
          let existingResponses: any[] = [];
          try {
            const existing = await fs.readFile(responseFile, 'utf8');
            existingResponses = JSON.parse(existing);
          } catch {
            // File doesn't exist, start fresh
          }

          // Check if we already processed this call
          const alreadyExists = existingResponses.some(r => r.callSid === callSid);
          
          if (!alreadyExists) {
            existingResponses.push(response);
            
            // Ensure responses directory exists
            await fs.mkdir(responsesDir, { recursive: true });
            
            // Write back to file
            await fs.writeFile(responseFile, JSON.stringify(existingResponses, null, 2));
            
            successCount++;
            results.push({
              file,
              surveyId,
              callSid,
              extractedAnswers: Object.keys(extractedAnswers).length,
              status: 'success'
            });
            
            console.log(`✅ Extracted ${Object.keys(extractedAnswers).length} answers from ${file}`);
          } else {
            results.push({
              file,
              surveyId,
              callSid,
              status: 'already_exists'
            });
            console.log(`⚠️ Response already exists for ${file}`);
          }
        } else {
          results.push({
            file,
            surveyId,
            callSid,
            status: 'no_answers_extracted'
          });
          console.log(`❌ No answers extracted from ${file}`);
        }

        processedCount++;
        
      } catch (error: any) {
        console.error(`Error processing ${file}:`, error);
        results.push({
          file,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Transcript processing completed',
      processedFiles: processedCount,
      successfulExtractions: successCount,
      results
    });

  } catch (error: any) {
    console.error('Error processing transcripts:', error);
    return NextResponse.json({ 
      error: 'Failed to process transcripts',
      details: error.message 
    }, { status: 500 });
  }
} 