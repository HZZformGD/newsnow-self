// src/components/Modal.tsx

import React, { useCallback, useEffect } from 'react';
import Portal from './Portal';
import { clsx } from 'clsx'; // 使用 clsx 库 (您项目中已有)

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  // 可以自定义内容区域的宽度
  contentClass?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, contentClass }) => {
  
  // 监听键盘 Esc 键关闭 Modal
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 可选：防止页面在 Modal 打开时滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      {/* 1. 遮罩层 (Overlay) */}
      <div 
        // UnoCSS Classes for: Fixed position, full screen, high z-index, dark semi-transparent background
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300"
        onClick={onClose} // 点击遮罩层关闭 Modal
      >
        
        {/* 2. Modal 内容容器 */}
        <div
          // UnoCSS Classes for: Background, rounded corners, shadow, max-height, auto-scroll
          className={clsx(
            "bg-white dark:bg-gray-900 rounded-lg shadow-2xl transition-all duration-300 transform scale-100",
            "max-h-[90vh] overflow-y-auto",
            contentClass || "w-[90%] max-w-2xl" // 默认宽度
          )}
          onClick={(e) => e.stopPropagation()} // 阻止点击 Modal 内容时触发关闭
        >
          
          {/* 3. Modal 头部 (可选标题和关闭按钮) */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title || 'Modal'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="关闭"
            >
              {/* 使用 UnoCSS 图标作为关闭按钮 */}
              <span className="i-ph-x-bold w-6 h-6"></span> 
            </button>
          </div>
          
          {/* 4. Modal 主体内容 */}
          <div className="p-6">
            {children}
          </div>
          
        </div>
      </div>
    </Portal>
  );
};

export default Modal;