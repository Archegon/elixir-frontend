import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { containerStyles, containerClasses } from '../utils/containerStyles';
import { useModalScaling } from '../hooks/useModalScaling';

/**
 * Modal Template - Standard Pattern for Responsive Modals
 * 
 * This template provides the consistent structure and behavior for all modals in the application.
 * 
 * Features:
 * - Responsive scaling that adapts to viewport size
 * - Consistent styling using containerStyles
 * - Smooth animations for open/close
 * - Proper accessibility and UX patterns
 * - Apple-inspired design language
 */

interface ModalTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  width?: string; // e.g., 'w-[800px]', 'w-[900px]', 'w-[1100px]'
  height?: string; // e.g., 'max-h-[600px]', 'max-h-[700px]'
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({
  isOpen,
  onClose,
  title = "Modal Title",
  subtitle,
  width = "w-[800px]",
  height = "max-h-[600px]",
  children,
  footerActions
}) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Responsive scaling hook - scales modal when it exceeds 90% of viewport
  const { scale, modalRef } = useModalScaling({ 
    isOpen, 
    isVisible,
    viewportThreshold: 0.9, // Scale when modal > 90% of viewport
    scaleThreshold: 0.8,    // Scale to 80% of viewport when triggered
    minScale: 0.6          // Minimum scale for readability
  });

  // Animation logic for modal open/close
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
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Modal Footer (Optional) */}
        {footerActions && (
          <div 
            className="p-6 border-t"
            style={{ borderColor: currentTheme.colors.border }}
          >
            {footerActions}
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalTemplate;

/**
 * Usage Example:
 * 
 * ```tsx
 * const MyModal = ({ isOpen, onClose }) => {
 *   const { currentTheme } = useTheme();
 *   
 *   const footerActions = (
 *     <div className="flex justify-end gap-3">
 *       <button
 *         onClick={onClose}
 *         className="px-6 py-3 rounded-xl font-semibold"
 *         style={{
 *           backgroundColor: `${currentTheme.colors.border}20`,
 *           border: `1px solid ${currentTheme.colors.border}40`,
 *           color: currentTheme.colors.textPrimary
 *         }}
 *       >
 *         Cancel
 *       </button>
 *       <button
 *         onClick={handleSave}
 *         style={{
 *           backgroundColor: currentTheme.colors.brand,
 *           border: `1px solid ${currentTheme.colors.brand}`,
 *           color: '#ffffff'
 *         }}
 *       >
 *         Save
 *       </button>
 *     </div>
 *   );
 *   
 *   return (
 *     <ModalTemplate
 *       isOpen={isOpen}
 *       onClose={onClose}
 *       title="My Modal Title"
 *       subtitle="Optional subtitle"
 *       width="w-[900px]"
 *       height="max-h-[700px]"
 *       footerActions={footerActions}
 *     >
 *       <div>
 *         Your modal content goes here...
 *       </div>
 *     </ModalTemplate>
 *   );
 * };
 * ```
 * 
 * Standard Modal Sizes:
 * - Small: w-[600px] max-h-[500px]
 * - Medium: w-[800px] max-h-[600px] 
 * - Large: w-[900px] max-h-[700px]
 * - Extra Large: w-[1100px] max-h-[800px]
 */ 