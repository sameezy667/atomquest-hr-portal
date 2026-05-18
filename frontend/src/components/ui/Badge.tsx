import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    outline: "bg-transparent text-gray-500 border border-gray-200",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase",
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
}
