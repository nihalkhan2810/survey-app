'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Home, ClipboardList, Calendar, LayoutGrid, ChartBar, MessageCircle, Menu, X } from 'lucide-react';
import { useState, useRef } from 'react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, gradient: 'from-violet-500 to-purple-600' },
    { name: 'Surveys', href: '/surveys', icon: ClipboardList, gradient: 'from-blue-500 to-cyan-600' },
    { name: 'Responses', href: '/responses', icon: MessageCircle, gradient: 'from-emerald-500 to-teal-600' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, gradient: 'from-orange-500 to-pink-600' },
    { name: 'Analytics', href: '/analytics', icon: ChartBar, gradient: 'from-rose-500 to-pink-600' },
    { name: 'Admin', href: '/admin', icon: LayoutGrid, gradient: 'from-indigo-500 to-purple-600' },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

    return (
        <motion.aside
            initial={false}
            animate={{ 
                width: isCollapsed ? 64 : 256,
                transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    duration: 0.3
                }
            }}
            className="fixed left-0 top-0 z-50 h-screen bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-800/30 flex flex-col shadow-2xl"
        >
            {/* Toggle Button */}
            <div className="p-4 border-b border-gray-200/30 dark:border-gray-800/30">
                <motion.button
                    onClick={onToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                    <motion.div
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </motion.div>
                </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col p-3 space-y-1 flex-1 overflow-hidden relative">
                {/* Hover Trail Effect */}
                <AnimatePresence>
                    {hoveredIndex !== null && (
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg"
                                style={{
                                    x: springX,
                                    y: springY,
                                    filter: 'blur(1px)',
                                }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.8, 1, 0.8],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            {/* Additional trail particles */}
                            <motion.div
                                className="w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-sm"
                                style={{
                                    x: springX,
                                    y: springY,
                                    filter: 'blur(0.5px)',
                                }}
                                animate={{
                                    scale: [0.5, 1, 0.5],
                                    opacity: [0.6, 0.9, 0.6],
                                    x: [0, -8, 0],
                                    y: [0, -4, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.3
                                }}
                            />
                            <motion.div
                                className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm"
                                style={{
                                    x: springX,
                                    y: springY,
                                    filter: 'blur(0.5px)',
                                }}
                                animate={{
                                    scale: [0.3, 0.8, 0.3],
                                    opacity: [0.4, 0.7, 0.4],
                                    x: [0, 6, 0],
                                    y: [0, 3, 0],
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.6
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={item.href}>
                                <motion.div
                                    className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group
                                        ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                                        }`}
                                    whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                                    whileTap={{ scale: 0.98 }}
                                    title={isCollapsed ? item.name : undefined}
                                    onMouseEnter={(e) => {
                                        setHoveredIndex(index);
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const navRect = e.currentTarget.closest('nav')?.getBoundingClientRect();
                                        if (navRect) {
                                            mouseX.set(rect.left - navRect.left + rect.width / 2);
                                            mouseY.set(rect.top - navRect.top + rect.height / 2);
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        if (hoveredIndex === index) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const navRect = e.currentTarget.closest('nav')?.getBoundingClientRect();
                                            if (navRect) {
                                                mouseX.set(e.clientX - navRect.left);
                                                mouseY.set(e.clientY - navRect.top);
                                            }
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredIndex(null);
                                    }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-link"
                                            className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl`}
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    
                                    <motion.div 
                                        className={`relative z-10 flex items-center justify-center ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-gray-100/50 dark:bg-gray-800/50 group-hover:bg-gray-200/50 dark:group-hover:bg-gray-700/50'}`}
                                        animate={{ 
                                            width: isCollapsed ? 24 : 32,
                                            height: isCollapsed ? 24 : 32
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                    </motion.div>
                                    
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.1 }}
                                                className="relative z-10 whitespace-nowrap overflow-hidden"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Pro Tip - Only show when expanded */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 border-t border-gray-200/30 dark:border-gray-800/30"
                    >
                        <div className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 rounded-xl">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pro tip</p>
                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1">Press Ctrl+K for quick actions</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
} 