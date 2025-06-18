'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ClipboardList, FolderKanban, Calendar, LayoutGrid, ChartBar, Sparkles } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, gradient: 'from-violet-500 to-purple-600' },
    { name: 'Surveys', href: '/surveys', icon: ClipboardList, gradient: 'from-blue-500 to-cyan-600' },
    { name: 'Projects', href: '/projects', icon: FolderKanban, gradient: 'from-emerald-500 to-teal-600' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, gradient: 'from-orange-500 to-pink-600' },
    { name: 'Analytics', href: '/analytics', icon: ChartBar, gradient: 'from-rose-500 to-pink-600' },
    { name: 'Admin', href: '/admin', icon: LayoutGrid, gradient: 'from-indigo-500 to-purple-600' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <Link href="/dashboard">
                    <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Sayz
                        </h1>
                    </motion.div>
                </Link>
            </div>
            <nav className="flex flex-col p-4 space-y-2 flex-1">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={item.href}>
                                <motion.div
                                    className={`relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                                        ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-link"
                                            className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl`}
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={`relative z-10 p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                    </div>
                                    <span className="relative z-10">{item.name}</span>
                                </motion.div>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 rounded-xl">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pro tip</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">Press Ctrl+K for quick actions</p>
                </div>
            </div>
        </aside>
    );
} 