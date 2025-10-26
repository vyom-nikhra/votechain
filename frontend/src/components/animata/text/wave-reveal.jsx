import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export default function WaveReveal({
  text,
  className,
  blur = false,
  direction = 'up',
  delay = 200,
  duration = '1000ms',
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const letters = text.split('');

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : -20,
      filter: blur ? 'blur(4px)' : 'blur(0px)',
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.05,
        duration: parseFloat(duration) / 1000,
      },
    }),
  };

  return (
    <span className={cn('inline-flex', className)}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={variants}
          style={{ display: 'inline-block', whiteSpace: letter === ' ' ? 'pre' : 'normal' }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}
