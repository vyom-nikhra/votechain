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
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
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
        'group relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-gray-600',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
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
