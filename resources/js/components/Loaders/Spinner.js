import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export const RingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className} rounded-full border-primary/20 border-t-primary animate-spin`}></div>
  );
};