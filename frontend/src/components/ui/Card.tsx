import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn("bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border-0 transition-shadow duration-300 hover:shadow-md", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("px-8 py-6 border-b border-gray-100 flex flex-row items-center justify-between", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 className={cn("text-lg font-bold tracking-tight text-gray-900", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-8", className)} {...props} />;
}
