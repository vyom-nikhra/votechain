import React, { createContext, useContext, useReducer } from 'react';
import toast from 'react-hot-toast';

// Error types
export const ERROR_TYPES = {
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  GENERAL_ERROR: 'GENERAL_ERROR',
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const initialState = {
  errors: [],
  hasErrors: false,
};

function errorReducer(state, action) {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload],
        hasErrors: true,
      };
    
    case 'REMOVE_ERROR':
      const filteredErrors = state.errors.filter(error => error.id !== action.payload);
      return {
        ...state,
        errors: filteredErrors,
        hasErrors: filteredErrors.length > 0,
      };
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        hasErrors: false,
      };
    
    default:
      return state;
  }
}

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (error) => {
    const errorObject = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: error.type || ERROR_TYPES.GENERAL_ERROR,
      severity: error.severity || ERROR_SEVERITY.MEDIUM,
      message: error.message || 'An unknown error occurred',
      details: error.details || null,
      context: error.context || null,
    };

    dispatch({ type: 'ADD_ERROR', payload: errorObject });

    // Show toast notification based on severity
    switch (errorObject.severity) {
      case ERROR_SEVERITY.CRITICAL:
        toast.error(errorObject.message, { duration: 8000 });
        break;
      case ERROR_SEVERITY.HIGH:
        toast.error(errorObject.message, { duration: 6000 });
        break;
      case ERROR_SEVERITY.MEDIUM:
        toast.error(errorObject.message, { duration: 4000 });
        break;
      case ERROR_SEVERITY.LOW:
        toast(errorObject.message, { duration: 3000 });
        break;
      default:
        toast.error(errorObject.message);
    }

    // Log error for debugging
    console.error('Error logged:', errorObject);

    return errorObject.id;
  };

  const removeError = (id) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const handleApiError = (error, context = null) => {
    let errorType = ERROR_TYPES.API_ERROR;
    let severity = ERROR_SEVERITY.MEDIUM;
    let message = 'An error occurred while processing your request';

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          message = data?.message || 'Invalid request data';
          errorType = ERROR_TYPES.VALIDATION_ERROR;
          severity = ERROR_SEVERITY.LOW;
          break;
        case 401:
          message = 'Authentication required. Please log in.';
          errorType = ERROR_TYPES.AUTH_ERROR;
          severity = ERROR_SEVERITY.HIGH;
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          errorType = ERROR_TYPES.AUTH_ERROR;
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 404:
          message = 'The requested resource was not found';
          severity = ERROR_SEVERITY.LOW;
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          severity = ERROR_SEVERITY.MEDIUM;
          break;
        case 500:
          message = 'Server error. Please try again later.';
          severity = ERROR_SEVERITY.HIGH;
          break;
        default:
          message = data?.message || `Request failed with status ${status}`;
      }
    } else if (error.code === 'NETWORK_ERROR') {
      message = 'Network connection failed. Please check your internet.';
      errorType = ERROR_TYPES.NETWORK_ERROR;
      severity = ERROR_SEVERITY.HIGH;
    }

    return addError({
      type: errorType,
      severity,
      message,
      details: error,
      context,
    });
  };

  const value = {
    ...state,
    addError,
    removeError,
    clearErrors,
    handleApiError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;