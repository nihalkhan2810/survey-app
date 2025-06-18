'use client';

import { useState } from 'react';

type Survey = {
  id: string;
  topic: string;
};

export function CallModal({ survey, onClose }: { survey: Survey; onClose: () => void }) {
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [status, setStatus] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalling(true);
    setStatus('Initiating calls...');

    const numbers = phoneNumbers.split(',').map((num) => num.trim()).filter(Boolean);

    try {
      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: survey.id, phoneNumbers: numbers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to start calls.');
      setStatus('Calls initiated successfully!');
      setTimeout(onClose, 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
        setIsCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Start Voice Survey</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
        </div>
        <p className="mt-2 text-gray-500">Call students for <span className="font-semibold">{survey.topic}</span></p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="phoneNumbers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Phone Numbers (comma-separated)</label>
              <textarea id="phoneNumbers" value={phoneNumbers} onChange={(e) => setPhoneNumbers(e.target.value)} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            
            <div className="flex justify-end items-center gap-4 pt-4">
                {status && <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>}
                <button type="submit" disabled={isCalling} className="rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700 disabled:opacity-50">
                    {isCalling ? 'Initiating...' : 'Start Calls'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
} 