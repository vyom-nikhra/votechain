import React from 'react';
import { cn } from '../../lib/utils';
import './SkewButton.css';

const SkewButton = ({ children, className, onClick, type = 'button', disabled = false }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn('skew-button', className)}
    >
      <span className="skew-button-text">{children}</span>
    </button>
  );
};

export default SkewButton;
