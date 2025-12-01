import React from 'react';

interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export const Spinner: React.FC<SpinnerProps> = ({ label, size = 'md', className = '', fullScreen }) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`} aria-live="polite" role="status">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeMap[size]} mb-3`} />
      {label && <span className="text-sm text-gray-600 font-medium">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;

