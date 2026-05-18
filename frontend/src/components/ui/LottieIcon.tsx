import React from 'react';

interface LottieIconProps {
  name?: 'loading' | 'empty' | 'success' | 'error';
  className?: string;
  size?: number;
}

export function LottieIcon({ name = 'loading', className = '', size }: LottieIconProps) {
  // Simple CSS-based animations instead of external Lottie files
  
  if (name === 'loading') {
    return (
      <div className={`flex items-center justify-center ${className}`} style={size ? { width: size, height: size } : {}}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (name === 'empty') {
    return (
      <div className={`flex items-center justify-center ${className}`} style={size ? { width: size, height: size } : {}}>
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
    );
  }
  
  if (name === 'success') {
    return (
      <div className={`flex items-center justify-center ${className}`} style={size ? { width: size, height: size } : {}}>
        <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  
  if (name === 'error') {
    return (
      <div className={`flex items-center justify-center ${className}`} style={size ? { width: size, height: size } : {}}>
        <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  
  return null;
}
