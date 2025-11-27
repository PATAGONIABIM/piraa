import React, { ReactNode } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  titleAlign?: 'left' | 'center';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, titleAlign = 'left' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center p-6 border-b border-white/5 ${titleAlign === 'center' ? 'justify-center' : 'justify-between'} relative`}>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className={`p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${titleAlign === 'center' ? 'absolute right-4' : ''}`}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;