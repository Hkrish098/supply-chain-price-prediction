"use client";
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  className, 
  children, 
  ...rest 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition px-5 py-3 text-sm';
  
  const variantStyles = {
    primary: 'bg-brand-700 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed',
    secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200 disabled:opacity-60 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-brand-600 border-2 border-brand-200 hover:bg-brand-50 disabled:opacity-60 disabled:cursor-not-allowed',
  };

  return (
    <motion.button
      className={clsx(baseStyles, variantStyles[variant], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
