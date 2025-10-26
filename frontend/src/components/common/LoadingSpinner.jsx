const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32', 
    lg: 'w-48 h-48'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`custom-loader ${sizeClasses[size]}`}>
        <div className="loader__inner" />
        <div className="loader__orbit">
          <div className="loader__dot" />
          <div className="loader__dot" />
          <div className="loader__dot" />
          <div className="loader__dot" />
        </div>
      </div>
      {text && (
        <p className="text-slate-300 text-lg font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10">
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