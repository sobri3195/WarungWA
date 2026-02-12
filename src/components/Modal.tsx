import { useEffect } from 'react';
import { useModalStore } from '../lib/store';

export const ModalContainer = () => {
  const { isOpen, component, closeModal } = useModalStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeModal}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {component}
      </div>
    </div>
  );
};

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ title, children, onClose, size = 'md' }: ModalProps) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl ${sizes[size]} w-full`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
};
