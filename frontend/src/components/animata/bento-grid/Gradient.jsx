import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export function MovingGradient({ children, className }) {
  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function BentoGrid({ children, className }) {
  return (
    <div
      className={cn(
        'grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon: Icon,
  className,
  children,
}) {
  return (
    <MovingGradient
      className={cn(
        'group relative rounded-2xl border border-gray-700/50 bg-gray-900/30 backdrop-blur-md p-6 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800/50 border border-gray-700/50 text-blue-400">
            <Icon className="h-6 w-6" />
          </div>
        )}
        {title && (
          <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        )}
        {description && (
          <p className="mb-4 text-gray-400">{description}</p>
        )}
        {children}
      </div>
    </MovingGradient>
  );
}
