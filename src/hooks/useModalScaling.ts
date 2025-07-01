import { useState, useEffect, useRef } from 'react';

interface ScalingOptions {
  baseWidth?: number;
  baseHeight?: number;
  minScale?: number;
  maxScale?: number;
}

interface UseModalScalingOptions {
  isOpen: boolean;
  isVisible?: boolean;
  viewportThreshold?: number; // Default 0.9 (90% of viewport)
  scaleThreshold?: number; // Default 0.8 (scale to 80% when exceeded)
  minScale?: number; // Default 0.6 (minimum scale for readability)
  measurementDelay?: number; // Default 50ms delay for rendering
}

// Global scale factor that persists across page changes
let globalScaleFactor = (() => {
  if (typeof window === 'undefined') return 1;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const baseWidth = 1920;
  const baseHeight = 1080;
  const scaleX = viewportWidth / baseWidth;
  const scaleY = viewportHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);
  return Math.max(0.4, Math.min(2.5, scale));
})();

// New general scaling hook for pages
export const useScaling = (options: ScalingOptions = {}) => {
  const {
    baseWidth = 1920,
    baseHeight = 1080,
    minScale = 0.4,
    maxScale = 2.5
  } = options;

  const [scaleFactor, setScaleFactor] = useState(globalScaleFactor);

  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const scaleX = viewportWidth / baseWidth;
      const scaleY = viewportHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const boundedScale = Math.max(minScale, Math.min(maxScale, scale));
      globalScaleFactor = boundedScale; // Update global scale
      setScaleFactor(boundedScale);
    };

    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [baseWidth, baseHeight, minScale, maxScale]);

  return scaleFactor;
};

// Original modal scaling hook for backward compatibility
export const useModalScaling = (options: UseModalScalingOptions) => {
  const {
    isOpen,
    isVisible = true,
    viewportThreshold = 0.9,
    scaleThreshold = 0.8,
    minScale = 0.6,
    measurementDelay = 50
  } = options;

  const [scale, setScale] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scale when modal closes
    if (!isOpen) {
      setScale(1);
      return;
    }

    const calculateScale = () => {
      if (modalRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get actual modal dimensions
        const rect = modalRef.current.getBoundingClientRect();
        const modalWidth = rect.width;
        const modalHeight = rect.height;
        
        // Only proceed if we have valid dimensions
        if (modalWidth > 0 && modalHeight > 0) {
          // Check if modal exceeds viewport threshold in either dimension
          const widthExceeds = modalWidth > viewportWidth * viewportThreshold;
          const heightExceeds = modalHeight > viewportHeight * viewportThreshold;
          
          if (widthExceeds || heightExceeds) {
            // Calculate scale factor for both dimensions
            const widthScale = viewportWidth * scaleThreshold / modalWidth;
            const heightScale = viewportHeight * scaleThreshold / modalHeight;
            
            // Use the smaller scale to ensure modal fits in both dimensions
            const newScale = Math.min(widthScale, heightScale);
            setScale(Math.max(minScale, newScale));
          } else {
            setScale(1);
          }
          return true; // Successful calculation
        }
        return false; // Invalid dimensions, need to retry
      }
      return false;
    };

    if (isOpen && modalRef.current && isVisible) {
      // Try immediate calculation first
      const immediate = calculateScale();
      
      if (!immediate) {
        // Fallback to small delay if immediate calculation failed
        const timer = setTimeout(calculateScale, 10); // Much smaller delay
        
        // Add resize listener
        window.addEventListener('resize', calculateScale);
        
        return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', calculateScale);
        };
      } else {
        // Immediate calculation succeeded, just add resize listener
        window.addEventListener('resize', calculateScale);

        return () => {
          window.removeEventListener('resize', calculateScale);
        };
      }
    }
  }, [isOpen, isVisible, viewportThreshold, scaleThreshold, minScale, measurementDelay]);

  return { scale, modalRef };
}; 