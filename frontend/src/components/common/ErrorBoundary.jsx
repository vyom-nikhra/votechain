import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // Send to logging service
      console.error('Production error:', {
        error: error.toString(),
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <FaExclamationTriangle className="text-6xl text-error" />
              </div>
              
              <h2 className="card-title text-2xl justify-center text-error mb-2">
                Oops! Something went wrong
              </h2>
              
              <p className="text-base-content/70 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe. 
                You can try refreshing the page or go back to the homepage.
              </p>

              {/* Error Details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="collapse collapse-arrow bg-base-200 mb-4">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    View Error Details (Dev Mode)
                  </div>
                  <div className="collapse-content">
                    <div className="text-xs text-left bg-base-300 p-3 rounded font-mono overflow-auto max-h-32">
                      <strong>Error:</strong> {this.state.error.toString()}
                      <br /><br />
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-actions justify-center gap-3">
                <button 
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                  disabled={this.state.retryCount >= 3}
                >
                  <FaRedo className="text-lg" />
                  {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                </button>
                
                <button 
                  onClick={this.handleGoHome}
                  className="btn btn-outline"
                >
                  <FaHome className="text-lg" />
                  Go Home
                </button>
              </div>

              {this.state.retryCount > 0 && (
                <div className="text-sm text-base-content/50 mt-2">
                  Retry attempts: {this.state.retryCount}/3
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;