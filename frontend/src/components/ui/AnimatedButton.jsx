import React from 'react';
import { cn } from '../../lib/utils';

export default function AnimatedButton({ children = 'Submit', className = '', onClick, as = 'button', ...props }) {
  const Tag = as;
  return (
    <Tag onClick={onClick} className={cn('animated-btn relative overflow-hidden inline-block', className)} {...props}>
      <span className="circle c1" />
      <span className="circle c2" />
      <span className="circle c3" />
      <span className="circle c4" />
      <span className="circle c5" />
      <span className="btn-text">{children}</span>
    </Tag>
  );
}
