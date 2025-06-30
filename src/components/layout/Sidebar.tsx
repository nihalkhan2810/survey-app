'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Home, ClipboardList, Calendar, LayoutGrid, ChartBar, MessageCircle, Menu, X, PanelLeftClose } from 'lucide-react';
import { useState, useRef } from 'react';
import { SayzLogo, SayzIcon } from '@/components/SayzLogo';

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
            {/* Header Section */}
            <div className="border-b border-gray-200/30 dark:border-gray-800/30">
                {isCollapsed ? (
                    <div className="flex flex-col items-center space-y-3 p-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="collapsed"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-center"
                            >
                                <SayzIcon size={20} />
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Expand button for collapsed state */}
                        <motion.button
                            onClick={onToggle}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-md transition-all duration-200"
                            title="Expand sidebar"
                        >
                            <Menu className="h-4 w-4" />
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="expanded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                <SayzLogo size={32} />
                                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Sayz
                                </span>
                            </motion.div>
                        </AnimatePresence>
                        
                        <motion.button
                            onClick={onToggle}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-md transition-all duration-200"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex flex-col p-4 space-y-2 flex-1 overflow-hidden relative">
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
                                    className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group overflow-hidden
                                        ${isActive
                                            ? 'text-white shadow-md'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
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
                                    {/* Active background - only when active */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-link"
                                            className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-lg`}
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    
                                    {/* Icon */}
                                    <div className="relative z-10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                    </div>
                                    
                                    {/* Label */}
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.1 }}
                                                className="relative z-10 whitespace-nowrap overflow-hidden flex-1"
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

            {/* Footer - Only show when expanded */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 border-t border-gray-200/30 dark:border-gray-800/30 mt-auto"
                    >
                        <div className="p-3 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 dark:from-emerald-500/10 dark:to-blue-500/10 rounded-lg border border-emerald-200/20 dark:border-emerald-800/20">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quick tip</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">Use Ctrl+K for shortcuts</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
} 