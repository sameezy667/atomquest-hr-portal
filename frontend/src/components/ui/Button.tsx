import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-gray-900 text-white hover:bg-black shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100 font-semibold',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-[15px] rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
