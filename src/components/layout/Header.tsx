'use client';

import { useSession, signOut } from 'next-auth/react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { User, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SayzLogo } from '@/components/SayzLogo';

export function Header() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-b border-white/20 dark:border-gray-800/20 shadow-sm shadow-black/5">
            <div className="flex items-center justify-between h-16 px-6 lg:px-8">
                {/* Left spacer */}
                <div className="flex-1"></div>
                
                {/* Centered Logo */}
                <div className="flex items-center justify-center">
                    <Link href="/dashboard">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all duration-200 backdrop-blur-sm"
                        >
                            <SayzLogo size={28} />
                            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Sayz
                            </span>
                        </motion.div>
                    </Link>
                </div>

                {/* Right section with user controls */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <ThemeSwitcher />

                    {session?.user?.role === 'ADMIN' && (
                        <Link href="/admin">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                                title="Admin Panel"
                            >
                                <Shield className="h-4 w-4" />
                            </motion.button>
                        </Link>
                    )}

                    <div className="flex items-center gap-2 ml-1">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                                {session?.user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                                {session?.user?.email}
                            </p>
                        </div>
                        
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-gradient-to-br from-emerald-500/80 to-teal-600/80 text-white rounded-xl shadow-lg backdrop-blur-sm"
                        >
                            <User className="h-4 w-4" />
                        </motion.div>
                        
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
} 