import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-yellow-primary',
    secondary: 'text-gray-400',
    accent: 'text-yellow-accent'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`
          animate-spin rounded-full 
          border-2 border-gray-300 
          border-t-current 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
      />
    </div>
  );
};

export default LoadingSpinner;