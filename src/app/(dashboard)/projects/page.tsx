'use client';

import { motion } from 'framer-motion';
import { LibraryIcon } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col items-center justify-center text-center h-[70vh]"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg mb-6">
          <LibraryIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        Projects
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
        This section is under construction. Soon, you'll be able to group your surveys and research into distinct projects right here.
      </p>
    </motion.div>
  );
} 