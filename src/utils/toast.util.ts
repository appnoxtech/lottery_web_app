// Web-compatible toast utility for React
import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

export const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info"
) => {
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      minHeight: '70px',
      fontSize: '16px',
      fontWeight: '500',
    }
  };

  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "warning":
      toast.warning(message, toastOptions);
      break;
    case "info":
      toast.info(message, toastOptions);
      break;
    default:
      toast.info(message, toastOptions);
  }
};

// Keep the initializeToast function for backward compatibility
export const initializeToast = (
  showToastFunc: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void
) => {
  // Override the default showToast function
const originalShowToast = showToast;
  (globalThis as any).showToast = showToastFunc;
};
