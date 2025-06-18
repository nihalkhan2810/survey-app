'use client';

import { motion } from 'framer-motion';
import { UserCogIcon } from 'lucide-react';

export default function AdminPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col items-center justify-center text-center h-[70vh]"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg mb-6">
          <UserCogIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        Admin Panel
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          This section is under construction. Administrator controls for managing users, surveys, and system settings will be available here.
      </p>
    </motion.div>
  );
} 