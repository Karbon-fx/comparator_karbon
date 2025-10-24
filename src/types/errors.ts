/**
 * Application-wide error types for consistent error handling
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_FETCH_ERROR = 'RATE_FETCH_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: string;
}

export class CustomError extends Error {
  public readonly type: ErrorType;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(type: ErrorType, message: string, details?: any) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.name = 'CustomError';
  }

  toJSON(): AppError {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Error factory functions for common error scenarios
 */
export const createNetworkError = (message: string, details?: any) =>
  new CustomError(ErrorType.NETWORK_ERROR, message, details);

export const createApiError = (message: string, details?: any) =>
  new CustomError(ErrorType.API_ERROR, message, details);

export const createValidationError = (message: string, details?: any) =>
  new CustomError(ErrorType.VALIDATION_ERROR, message, details);

export const createRateFetchError = (message: string, details?: any) =>
  new CustomError(ErrorType.RATE_FETCH_ERROR, message, details);

export const createCalculationError = (message: string, details?: any) =>
  new CustomError(ErrorType.CALCULATION_ERROR, message, details);