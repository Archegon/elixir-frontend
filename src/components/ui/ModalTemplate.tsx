import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles } from '../../utils/containerStyles';
import { useModalScaling } from '../../hooks/useModalScaling';

interface ModalTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  height?: string;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'w-[1100px]',
  height = 'max-h-[80vh]'
}) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { scale, modalRef } = useModalScaling({ 
    isOpen, 
    isVisible,
    viewportThreshold: 0.9,
    scaleThreshold: 0.8,
    minScale: 0.6
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 10);
    } else if (isVisible) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 200);
    }
  }, [isOpen, isVisible]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
        isAnimating ? 'bg-black/0' : 'bg-black/40 backdrop-blur-sm'
      }`}
      onClick={handleClose}
    >
      <div 
        ref={modalRef}
        className={`${width} ${height} border shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{
          ...containerStyles.modal(currentTheme),
          transform: `scale(${scale}) ${isAnimating ? 'scale(0.95) translateY(1rem)' : ''}`,
          transformOrigin: 'center center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 
                className="text-2xl font-semibold"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                {title}
              </h2>
              {subtitle && (
                <p 
                  className="text-sm mt-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <button 
              onClick={handleClose}
              className="text-2xl hover:opacity-70 transition-all duration-200 hover:scale-110 active:scale-95 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ 
                color: currentTheme.colors.textSecondary,
                backgroundColor: `${currentTheme.colors.border}30`
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div style={containerStyles.modalContent(currentTheme)}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div 
            className="p-6 border-t"
            style={{ borderColor: currentTheme.colors.border }}
          >
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalTemplate; 