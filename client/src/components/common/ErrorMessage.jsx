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
  retryText = 'Try Again',
  className = ''
}) {
  return (
    <div
      role="alert"
      className={`p-4 rounded-xl bg-coral-50 border border-coral-200 text-coral-800 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-coral-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs font-bold text-coral-900">{title}</h4>
          {message && (
            <p className="text-xs text-coral-700 mt-0.5 leading-relaxed">
              {message}
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
