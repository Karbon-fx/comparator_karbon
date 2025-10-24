/**
 * Application-wide error types and classes for consistent error handling
 */

export enum ErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    API_ERROR = 'API_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RATE_FETCH_ERROR = 'RATE_FETCH_ERROR',
    CALCULATION_ERROR = 'CALCULATION_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  }
  
  export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
  }
  
  export interface AppError {
    type: ErrorType;
    message: string;
    severity: ErrorSeverity;
    details?: any;
    timestamp: string;
    userMessage?: string; // User-friendly message
  }
  
  export class CustomError extends Error {
    public readonly type: ErrorType;
    public readonly severity: ErrorSeverity;
    public readonly details?: any;
    public readonly timestamp: string;
    public readonly userMessage?: string;
  
    constructor(
      type: ErrorType, 
      message: string, 
      severity: ErrorSeverity = ErrorSeverity.MEDIUM,
      details?: any,
      userMessage?: string
    ) {
      super(message);
      this.type = type;
      this.severity = severity;
      this.details = details;
      this.timestamp = new Date().toISOString();
      this.userMessage = userMessage;
      this.name = 'CustomError';
    }
  
    toJSON(): AppError {
      return {
        type: this.type,
        message: this.message,
        severity: this.severity,
        details: this.details,
        timestamp: this.timestamp,
        userMessage: this.userMessage,
      };
    }
  
    getUserFriendlyMessage(): string {
      return this.userMessage || this.getDefaultUserMessage();
    }
  
    private getDefaultUserMessage(): string {
      switch (this.type) {
        case ErrorType.NETWORK_ERROR:
          return 'Connection issue. Please check your internet and try again.';
        case ErrorType.RATE_FETCH_ERROR:
          return 'Unable to fetch latest rates. Using cached data.';
        case ErrorType.VALIDATION_ERROR:
          return 'Please check your input and try again.';
        case ErrorType.TIMEOUT_ERROR:
          return 'Request timed out. Please try again.';
        default:
          return 'Something went wrong. Please try again.';
      }
    }
  }
  
  /**
   * Error factory functions for common error scenarios
   */
  export const createNetworkError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.NETWORK_ERROR, 
    message, 
    ErrorSeverity.HIGH, 
    details,
    userMessage
  );
  
  export const createApiError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.API_ERROR, 
    message, 
    ErrorSeverity.MEDIUM, 
    details,
    userMessage
  );
  
  export const createValidationError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.VALIDATION_ERROR, 
    message, 
    ErrorSeverity.LOW, 
    details,
    userMessage
  );
  
  export const createRateFetchError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.RATE_FETCH_ERROR, 
    message, 
    ErrorSeverity.MEDIUM, 
    details,
    userMessage
  );
  
  export const createCalculationError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.CALCULATION_ERROR, 
    message, 
    ErrorSeverity.HIGH, 
    details,
    userMessage
  );
  
  export const createTimeoutError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.TIMEOUT_ERROR, 
    message, 
    ErrorSeverity.MEDIUM, 
    details,
    userMessage
  );
  
  export const createUnknownError = (
    message: string, 
    details?: any,
    userMessage?: string
  ) => new CustomError(
    ErrorType.UNKNOWN_ERROR, 
    message, 
    ErrorSeverity.HIGH, 
    details,
    userMessage
  );
  
  /**
   * Error boundary helper types
   */
  export interface ErrorBoundaryState {
    hasError: boolean;
    error: CustomError | null;
    errorInfo: any;
  }
  
  export interface ErrorFallbackProps {
    error: CustomError;
    resetError: () => void;
  }
  