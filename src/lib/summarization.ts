interface SummarizationResult {
  success: boolean
  summary?: string
  originalLength: number
  summaryLength?: number
  error?: string
}

interface ResponseToSummarize {
  text: string
  questionText?: string
  context?: string
}

const SUMMARIZATION_THRESHOLD = 200
const MAX_SUMMARY_LENGTH = 100

export async function shouldSummarize(text: string): Promise<boolean> {
  return text.length >= SUMMARIZATION_THRESHOLD
}

export async function summarizeResponse(response: ResponseToSummarize): Promise<SummarizationResult> {
  const { text, questionText, context } = response
  
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      originalLength: 0,
      error: 'Empty response text'
    }
  }

  const originalLength = text.length

  if (!await shouldSummarize(text)) {
    return {
      success: false,
      originalLength,
      error: 'Response too short to summarize'
    }
  }

  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) {
    return {
      success: false,
      originalLength,
      error: 'Gemini API key not configured'
    }
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`
    
    const prompt = createSummarizationPrompt(text, questionText, context)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.3,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return {
        success: false,
        originalLength,
        error: `API responded with status ${response.status}`
      }
    }

    const data = await response.json()
    const summary = data.candidates[0]?.content?.parts[0]?.text?.trim()
    
    if (!summary) {
      return {
        success: false,
        originalLength,
        error: 'No summary generated'
      }
    }

    return {
      success: true,
      summary,
      originalLength,
      summaryLength: summary.length
    }

  } catch (error: any) {
    console.error('Error summarizing response:', error)
    return {
      success: false,
      originalLength,
      error: error.message || 'Unknown summarization error'
    }
  }
}

function createSummarizationPrompt(text: string, questionText?: string, context?: string): string {
  let prompt = `You are an expert at summarizing survey responses. Your task is to create a concise, clear summary of the following response while preserving all key information and sentiment.

Requirements:
- Keep the summary under ${MAX_SUMMARY_LENGTH} characters
- Preserve the main points and sentiment
- Use clear, direct language
- Maintain the respondent's perspective and tone
- Do not add interpretation or analysis beyond what was stated

`

  if (questionText) {
    prompt += `Survey Question: "${questionText}"\n\n`
  }

  if (context) {
    prompt += `Context: ${context}\n\n`
  }

  prompt += `Response to summarize: "${text}"

Please provide only the summary, without any additional text or explanation.`

  return prompt
}

export async function summarizeMultipleResponses(responses: Array<{ questionId: string, text: string, questionText?: string }>): Promise<Record<string, SummarizationResult>> {
  const results: Record<string, SummarizationResult> = {}
  
  const summarizationPromises = responses.map(async (response) => {
    const result = await summarizeResponse({
      text: response.text,
      questionText: response.questionText
    })
    return { questionId: response.questionId, result }
  })

  const completedSummarizations = await Promise.allSettled(summarizationPromises)
  
  completedSummarizations.forEach((outcome, index) => {
    const questionId = responses[index].questionId
    if (outcome.status === 'fulfilled') {
      results[questionId] = outcome.value.result
    } else {
      results[questionId] = {
        success: false,
        originalLength: responses[index].text.length,
        error: 'Summarization promise rejected'
      }
    }
  })

  return results
}

export function formatSummarizedAnswer(originalText: string, summarizationResult: SummarizationResult) {
  return {
    original: originalText,
    summary: summarizationResult.success ? summarizationResult.summary : undefined,
    length: originalText.length,
    isSummarized: summarizationResult.success,
    summarizationError: summarizationResult.success ? undefined : summarizationResult.error
  }
}