'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
  { name: 'light', icon: SunIcon },
  { name: 'dark', icon: MoonIcon },
  { name: 'system', icon: ComputerDesktopIcon },
];

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-24 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 focus:outline-none transition-colors"
          aria-label={`Switch to ${t.name} theme`}
        >
          <AnimatePresence>
            {theme === t.name && (
              <motion.div
                layoutId="theme-switcher-active"
                className="absolute inset-0 bg-white dark:bg-gray-900 rounded-full shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </AnimatePresence>
          <t.icon className={`relative h-5 w-5 z-10 transition-colors ${theme === t.name ? 'text-emerald-600 dark:text-emerald-400' : 'hover:text-gray-900 dark:hover:text-white'}`} />
        </button>
      ))}
    </div>
  );
} 