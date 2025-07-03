'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type Question = {
  text: string;
  type: 'text' | 'multiple-choice' | 'single-choice' | 'rating';
  options?: string[];
  min?: number;
  max?: number;
};

type Survey = {
  id: string;
  topic: string;
  questions: Question[];
  start_date?: string;
  end_date?: string;
};

type Answers = {
  [key: number]: string | string[] | number;
};

type RespondentIdentity = {
  isAnonymous: boolean;
};

function SurveyPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const surveyId = params.surveyId as string;
  const participantId = searchParams.get('participantId');
  // Decode email and batch from token
  const token = searchParams.get('t');
  let recipientEmail: string | null = null;
  let batchId: string | null = null;
  
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [email, batch] = decoded.split(':');
      recipientEmail = email;
      batchId = batch;
    } catch (error) {
      console.warn('Invalid token:', token);
    }
  }
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [identity, setIdentity] = useState<RespondentIdentity>({
    isAnonymous: true
  });

  useEffect(() => {
    if (surveyId) {
      fetch(`/api/surveys/${surveyId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Survey not found.');
          }
          return res.json();
        })
        .then((data) => {
          setSurvey(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [surveyId]);

  // Check for duplicate submission when email is available from URL
  useEffect(() => {
    if (surveyId && recipientEmail && batchId) {
      checkDuplicateSubmission(recipientEmail, batchId);
    } else {
      // Clear already submitted state when no URL email is available
      setAlreadySubmitted(false);
    }
  }, [surveyId, recipientEmail, batchId]);

  const checkDuplicateSubmission = async (email: string, batch: string) => {
    try {
      const response = await fetch(`/api/check-submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, email: email.trim(), batchId: batch }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasSubmitted) {
          setAlreadySubmitted(true);
        }
      }
    } catch (error) {
      // If check fails, allow submission (fail open)
      console.warn('Failed to check duplicate submission:', error);
    }
  };

  const handleInputChange = (questionIndex: number, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleMultipleChoiceChange = (questionIndex: number, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = (prev[questionIndex] as string[]) || [];
      if (checked) {
        return { ...prev, [questionIndex]: [...currentAnswers, option] };
      } else {
        return { ...prev, [questionIndex]: currentAnswers.filter(answer => answer !== option) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Always use email from URL for tracking, regardless of anonymous/identify choice
      const actualEmail = recipientEmail; // Only use URL email for tracking
      
      const responsePayload = {
        surveyId,
        answers,
        identity: identity.isAnonymous ? { 
          isAnonymous: true 
        } : {
          isAnonymous: false,
          email: recipientEmail // Show the URL email when user chooses to identify
        },
        actualEmail: actualEmail, // Always include the actual email for tracking
        batchId: batchId, // Include batch ID for tracking
        participantId: participantId || undefined
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading survey...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-bold text-green-600">Thank You!</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Your survey has been submitted successfully.
          </p>
        </div>
      </main>
    );
  }

  if (alreadySubmitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-bold text-blue-600">Already Submitted</h1>
          <p className="text-gray-700 dark:text-gray-300">
            You have already submitted the survey, thanks.
          </p>
        </div>
      </main>
    );
  }

  if (!survey) {
    return null; // Should be handled by the error state
  }

  // Check if survey is expired
  const now = new Date();
  const endDate = survey.end_date ? new Date(survey.end_date) : null;
  const startDate = survey.start_date ? new Date(survey.start_date) : null;
  
  if (endDate && now > endDate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-bold text-red-600">Survey Expired</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This survey closed on {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Thank you for your interest, but responses are no longer being accepted.
          </p>
        </div>
      </main>
    );
  }

  if (startDate && now < startDate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-bold text-orange-600">Survey Not Yet Available</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This survey will open on {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Please check back at the scheduled time.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-8 dark:bg-gray-900">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
          {survey.topic}
        </h1>
        
        {/* Identity Section */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-700/50">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Response Identification (Optional)
          </h2>
          {!recipientEmail && (
            <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You are accessing this survey directly. Your response will not be tracked by email.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="responseType"
                  checked={identity.isAnonymous}
                  onChange={() => setIdentity({ isAnonymous: true })}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Submit anonymously
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="responseType"
                  checked={!identity.isAnonymous}
                  onChange={() => setIdentity(prev => ({ ...prev, isAnonymous: false }))}
                  disabled={!recipientEmail}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={`ml-2 text-sm ${!recipientEmail ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  Identify myself {!recipientEmail ? '(requires email link)' : ''}
                </span>
              </label>
            </div>
            
            {!identity.isAnonymous && recipientEmail && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your response will be identified with email: <strong>{recipientEmail}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {survey.questions.map((q, index) => (
            <div key={index}>
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                {index + 1}. {q.text}
              </label>
              {q.type === 'text' && (
                <input
                  type="text"
                  required
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 p-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              )}
              {q.type === 'single-choice' && q.options && (
                <div className="mt-2 space-y-2">
                  {q.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        required
                        id={`q${index}-o${optionIndex}`}
                        name={`q${index}`}
                        value={option}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`q${index}-o${optionIndex}`}
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'multiple-choice' && q.options && (
                <div className="mt-2 space-y-2">
                  {q.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`q${index}-o${optionIndex}`}
                        value={option}
                        checked={(answers[index] as string[] || []).includes(option)}
                        onChange={(e) => handleMultipleChoiceChange(index, option, e.target.checked)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 rounded"
                      />
                      <label
                        htmlFor={`q${index}-o${optionIndex}`}
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'rating' && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{q.min || 1}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{q.max || 10}</span>
                  </div>
                  <input
                    type="range"
                    min={q.min || 1}
                    max={q.max || 10}
                    value={answers[index] as number || q.min || 1}
                    onChange={(e) => handleInputChange(index, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                    required
                  />
                  <div className="text-center mt-2">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium">
                      {answers[index] as number || q.min || 1} / {q.max || 10}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Survey'}
          </button>
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </form>
      </div>
    </main>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </main>
    }>
      <SurveyPageContent />
    </Suspense>
  );
} 