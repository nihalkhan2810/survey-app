'use client';

import dynamic from 'next/dynamic';

// Dynamically import CallLogs
const CallLogs = dynamic(
  () => import('@/components/admin/CallLogs').then(mod => ({ default: mod.CallLogs })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading call logs...</p>
      </div>
    )
  }
);

export default function CallLogsPage() {
  return <CallLogs />;
}
