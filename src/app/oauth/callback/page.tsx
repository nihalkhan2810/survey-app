'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering - this page can't be statically generated
// because it needs to read URL parameters at runtime
export const dynamic = 'force-dynamic';

export default function SalesforceCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state'); // This contains our code verifier

      if (error) {
        setStatus(`Error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('No authorization code received');
        return;
      }

      try {
        const codeVerifier = state; // Get code verifier from state parameter
        
        if (!codeVerifier) {
          setStatus('❌ Error: Missing code verifier in state parameter');
          return;
        }

        console.log('Using code verifier from state:', codeVerifier.substring(0, 10) + '...');

        // Exchange code for access token with PKCE
        const response = await fetch('/api/salesforce/oauth-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, codeVerifier }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus('✅ Authentication successful! Closing window...');
          // Close popup and refresh parent window
          setTimeout(() => {
            if (window.opener) {
              window.opener.location.reload();
              window.close();
            } else {
              router.push('/surveys/send');
            }
          }, 1000);
        } else {
          setStatus(`❌ Error: ${result.error}`);
        }
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Salesforce Authentication
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {status}
          </p>
          {status.includes('Error') && (
            <button
              onClick={() => router.push('/surveys/send')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Return to Survey Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}