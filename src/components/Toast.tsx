import React, { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

interface ToastProps {
  message: string | null;
  type: 'success' | 'error' | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // allow time for fade out animation before calling onClose
        setTimeout(onClose, 300); 
      }, 2700);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !type) {
    return null;
  }
    
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
  return (
    <div 
        className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white ${bgColor} transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        role="alert"
        aria-live="assertive"
    >
        <div className="flex items-center justify-between">
            <span className="mr-4">{message}</span>
            <button onClick={onClose} aria-label="Close notification" className="text-white hover:bg-white/20 rounded-full p-1">
                <CloseIcon className="h-4 w-4" />
            </button>
        </div>
    </div>
  );
};
