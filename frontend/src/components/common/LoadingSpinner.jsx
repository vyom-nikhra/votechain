import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl', 
    lg: 'text-6xl'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <FaSpinner className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="text-base-content/70 text-lg font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-base-200 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-10">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;