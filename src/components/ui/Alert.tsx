import React from 'react';

type Tone = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  title?: string;
  message?: string;
  tone?: Tone;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
}

const toneMap: Record<Tone, { bg: string; text: string; icon: React.ReactNode }> = {
  info: { bg: 'bg-primary-50', text: 'text-primary-700', icon: (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10A8 8 0 11.001 10 8 8 0 0118 10zm-8-4a1 1 0 11-.001 2A1 1 0 0110 6zm1 8a1 1 0 11-2 0V9a1 1 0 112 0v5z" clipRule="evenodd"/></svg>) },
  success: { bg: 'bg-success-50', text: 'text-success-700', icon: (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>) },
  warning: { bg: 'bg-warning-50', text: 'text-warning-700', icon: (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.594c.75 1.336-.213 3.007-1.743 3.007H3.482c-1.53 0-2.493-1.671-1.743-3.007L8.257 3.1zM11 13a1 1 0 11-2 0V9a1 1 0 112 0v4zm-1 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>) },
  error: { bg: 'bg-error-50', text: 'text-error-700', icon: (<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 10-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>) },
};

export const Alert: React.FC<AlertProps> = ({ title, message, tone = 'info', actionLabel, onAction, onClose, className = '' }) => {
  const toneStyles = toneMap[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneStyles.bg} ${className}`} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className={`${toneStyles.text}`}>{toneStyles.icon}</div>
        <div className="flex-1">
          {title && <h3 className={`text-sm font-semibold ${toneStyles.text}`}>{title}</h3>}
          {message && <p className="text-sm text-gray-700 mt-1">{message}</p>}
          {(actionLabel || onClose) && (
            <div className="mt-3 flex gap-2">
              {actionLabel && (
                <button className="btn btn-secondary text-sm py-1" onClick={onAction}>{actionLabel}</button>
              )}
              {onClose && (
                <button className="btn text-sm py-1" onClick={onClose}>Dismiss</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;

