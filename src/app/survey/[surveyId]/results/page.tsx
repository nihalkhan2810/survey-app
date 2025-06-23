'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// You might want to share these types in a dedicated file
type Question = {
  text: string;
  type: 'text' | 'multiple-choice';
  options?: string[];
};

type Survey = {
  id: string;
  topic: string;
  questions: Question[];
};

type Answer = {
  [key: number]: string;
};

type RespondentIdentity = {
  isAnonymous: boolean;
  name?: string;
  email?: string;
};

type Response = {
  submittedAt: string;
  answers: Answer;
  type?: string;
  identity?: RespondentIdentity;
};

type ResultsData = {
  survey: Survey;
  responses: Response[];
};

const formatRespondentInfo = (response: Response, index: number) => {
  if (response.identity?.isAnonymous === false) {
    const parts = [];
    if (response.identity.name) parts.push(response.identity.name);
    if (response.identity.email) parts.push(`(${response.identity.email})`);
    return parts.length > 0 ? parts.join(' ') : `Respondent ${index + 1}`;
  }
  return 'Anonymous';
};

const getResponseTypeLabel = (response: Response) => {
  if (response.type === 'voice-ai' || response.type?.includes('voice')) {
    return 'Voice';
  }
  return 'Web';
};

export default function ResultsPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId) {
      fetch(`/api/surveys/${surveyId}/results`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Could not load survey results.');
          }
          return res.json();
        })
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [surveyId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p>Loading results...</p>
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

  if (!results) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-indigo-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="my-4 text-3xl font-bold text-gray-800 dark:text-white">
          Results for: {results.survey.topic}
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {results.responses.length} response(s) submitted.
        </p>

        {results.survey.questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {qIndex + 1}. {q.text}
            </h2>
            <div className="mt-4 space-y-3">
              {results.responses.length > 0 ? (
                results.responses.map((r, rIndex) => (
                  <div key={rIndex} className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {formatRespondentInfo(r, rIndex)}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {getResponseTypeLabel(r)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(r.submittedAt).toLocaleDateString()} at {new Date(r.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {r.answers[qIndex] || <span className="italic text-gray-400">No answer provided</span>}
                    </p>
                  </div>
                ))
              ) : (
                <p className="italic text-gray-500">No responses yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 