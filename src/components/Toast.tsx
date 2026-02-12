import { useEffect } from 'react';
import { useToastStore } from '../lib/store';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
}

const Toast = ({ type, title, message, onClose }: ToastProps) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`${colors[type]} text-white rounded-lg shadow-lg p-4 min-w-[300px] animate-slide-in`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl font-bold">{icons[type]}</span>
        </div>
        <div className="ml-3 flex-1">
          <p className="font-semibold">{title}</p>
          {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <span className="text-xl">×</span>
        </button>
      </div>
    </div>
  );
};
