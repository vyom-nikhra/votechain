import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          borderRadius: '0.5rem',
          border: '1px solid hsl(var(--b3))',
          fontSize: '14px',
          maxWidth: '400px',
        },
        
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: 'hsl(var(--su))',
            color: 'hsl(var(--suc))',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: 'hsl(var(--er))',
            color: 'hsl(var(--erc))',
          },
        },
        loading: {
          style: {
            background: 'hsl(var(--in))',
            color: 'hsl(var(--inc))',
          },
        },
      }}
    />
  );
};

export default ToastProvider;