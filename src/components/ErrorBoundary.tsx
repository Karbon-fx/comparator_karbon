/**
 * Error Boundary Component for handling React errors gracefully
 */

import React, { Component, ReactNode } from 'react';
import { CustomError, ErrorType, ErrorSeverity } from '@/types/errors';
import type { ErrorBoundaryState, ErrorFallbackProps } from '@/types/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: CustomError, errorInfo: any) => void;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
    <div className="text-red-600 mb-4">
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
    <p className="text-red-700 mb-4 text-center max-w-md">
      {error.getUserFriendlyMessage()}
    </p>
    <button
      onClick={resetError}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

/**
 * Error Boundary class component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Convert regular errors to CustomError
    const customError = error instanceof CustomError 
      ? error 
      : new CustomError(
          ErrorType.UNKNOWN_ERROR,
          error.message || 'An unexpected error occurred',
          ErrorSeverity.HIGH,
          { originalError: error },
          'Something went wrong. Please try again.'
        );

    return {
      hasError: true,
      error: customError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const customError = this.state.error || new CustomError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      ErrorSeverity.HIGH,
      { originalError: error, errorInfo }
    );

    this.setState({
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(customError, errorInfo);
    }

    // Log error for debugging
    console.error('Error caught by boundary:', customError.toJSON());
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
