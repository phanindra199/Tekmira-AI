import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Accessible Error Message Banner / Card
 */
export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  className = ''
}) {
  // Extract safe string representation even if an Error or ApiError object is passed
  const displayMessage = 
    typeof message === 'string' 
      ? message 
      : message?.message || (message ? String(message) : '');

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl bg-coral-50 border border-coral-200 text-coral-800 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-coral-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-coral-900">{title}</h4>
            {onDismiss && (
              <button 
                type="button" 
                onClick={onDismiss}
                className="text-xs text-coral-500 hover:text-coral-800 font-bold px-1"
                aria-label="Dismiss message"
              >
                ×
              </button>
            )}
          </div>
          {displayMessage && (
            <p className="text-xs text-coral-700 mt-0.5 leading-relaxed">
              {displayMessage}
            </p>
          )}

          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                icon={RefreshCw}
                className="bg-white text-coral-700 border-coral-300 hover:bg-coral-100"
              >
                {retryText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
