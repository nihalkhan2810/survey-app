import { motion, Variants } from 'framer-motion';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  progress: number;
  color: 'blue' | 'green' | 'red' | 'yellow';
};

const gradients = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-teal-600',
    red: 'from-rose-500 to-pink-600',
    yellow: 'from-orange-500 to-amber-600',
}

const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    yellow: 'text-orange-600 dark:text-orange-400',
}

const iconBgColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-emerald-100 dark:bg-emerald-900/30',
    red: 'bg-rose-100 dark:bg-rose-900/30',
    yellow: 'bg-orange-100 dark:bg-orange-900/30',
}

export function StatCard({ title, value, icon: Icon, progress, color }: StatCardProps) {
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[color]} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${iconBgColorClasses[color]}`}>
              <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${gradients[color]} shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 