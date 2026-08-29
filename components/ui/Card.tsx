import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding = false, ariaLabel }) => {
  const classes = `surface ${noPadding ? '' : 'p-5 sm:p-6'} ${onClick ? 'surface-interactive' : ''} ${className}`;
  if (onClick) {
    return (
      <motion.button type="button" onClick={onClick} aria-label={ariaLabel} whileTap={{ scale: 0.985 }} className={`${classes} block w-full text-left`}>
        {children}
      </motion.button>
    );
  }
  return <div className={classes}>{children}</div>;
};
