'use client';

import { useEffect, useState } from 'react';

type Question = {
  text: string;
};
type Answer = { [key: number]: string };
type Response = { submittedAt: string; answers: Answer, type?: string, callSid?: string };
type ResultsData = {
  survey: { topic: string; questions: Question[] };
  responses: Response[];
};

export function ResultsModal({ surveyId, onClose }: { surveyId: string; onClose: () => void }) {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/surveys/${surveyId}/results`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      });
  }, [surveyId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
        {loading ? (
          <p>Loading results...</p>
        ) : results ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Results for: {results.survey.topic}</h2>
                <p className="my-2 text-gray-600 dark:text-gray-400">
                  {results.responses.length} response(s) submitted.
                </p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
            </div>
            <div className="mt-6 space-y-6">
              {results.survey.questions.map((q, qIndex) => (
                <div key={qIndex} className="rounded-lg border bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{qIndex + 1}. {q.text}</h3>
                  <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-2">
                    {results.responses.length > 0 ? (
                      results.responses.map((r, rIndex) => (
                        <div key={rIndex} className="rounded border bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-700/50">
                          <p className="text-gray-800 dark:text-gray-200">
                            {r.answers[qIndex] || <span className="italic text-gray-500">No answer provided</span>}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {r.type === 'voice-ai' ? `(Voice AI @ ${r.callSid?.slice(-4)})` : '(Web)'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-sm text-gray-500">No responses yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Could not load results.</p>
        )}
      </div>
    </div>
  );
} 