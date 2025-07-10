'use client';

import { useSession, signOut } from 'next-auth/react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { User, LogOut, Shield, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeaderProps {
    onMobileMenuToggle?: () => void;
    isMobile?: boolean;
}

export function Header({ onMobileMenuToggle, isMobile = false }: HeaderProps) {
    const { data: session } = useSession();

    return (
        <header className={`sticky top-0 z-30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-b border-white/20 dark:border-gray-800/20 shadow-sm shadow-black/5 ${
            isMobile ? 'mobile-header' : ''
        }`}>
            <div className={`flex items-center justify-between ${
                isMobile ? 'h-14 px-3' : 'h-16 px-4 sm:px-6 lg:px-8'
            }`}>
                {/* Mobile Menu Button */}
                {isMobile && onMobileMenuToggle && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onMobileMenuToggle}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <Menu className="h-5 w-5" />
                    </motion.button>
                )}

                <div className="flex items-center justify-end flex-1">
                    {/* Right section with user controls */}
                    <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                        <ThemeSwitcher />

                        {session?.user?.role === 'ADMIN' && (
                            <Link href="/admin">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`${isMobile ? 'p-2' : 'p-2 sm:p-3'} bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center`}
                                    title="Admin Panel"
                                >
                                    <Shield className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
                                </motion.button>
                            </Link>
                        )}

                        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'ml-0' : 'ml-1'}`}>
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
                                className={`${isMobile ? 'p-2' : 'p-2 sm:p-3'} bg-gradient-to-br from-emerald-500/80 to-teal-600/80 text-white rounded-xl shadow-lg backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center`}
                            >
                                <User className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
                            </motion.div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                                className={`${isMobile ? 'p-2' : 'p-2 sm:p-3'} text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center`}
                                title="Sign Out"
                            >
                                <LogOut className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}