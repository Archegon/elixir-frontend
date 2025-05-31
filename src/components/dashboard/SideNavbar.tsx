import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { containerStyles, containerClasses, getStatusIndicatorStyle } from '../../utils/containerStyles';
import { Palette, Home, Settings, BarChart3, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

interface SideNavbarProps {
  onThemeModalOpen: () => void;
  onEnvControls?: () => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ onThemeModalOpen, onEnvControls }) => {
  const { currentTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: Bell, label: 'Alerts', active: false },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav 
      className={`h-full flex flex-col transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-22' : 'w-64'}`}
      style={{
        backgroundColor: currentTheme.colors.secondary,
        borderRight: `1px solid ${currentTheme.colors.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      {/* Logo Section */}
      <div className="border-b flex-shrink-0 p-6 h-28 relative" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex items-center justify-center min-w-0 h-16 w-full">
          <div className="flex items-center justify-center min-w-0 w-full">
            <img 
              src="/O2genes logo no text.png" 
              alt="O2genes Logo" 
              className={`w-auto h-16 max-w-20 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
              style={{ 
                objectFit: 'contain',
                transitionDelay: isCollapsed ? '0ms' : '150ms'
              }}
            />
          </div>
          
          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="absolute right-6 flex-shrink-0 p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 w-8 h-8"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.textSecondary,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 min-h-0">
        <div className="px-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-w-0 h-12 px-4"
              style={{
                backgroundColor: item.active ? `${currentTheme.colors.brand}20` : 'transparent',
                color: item.active ? currentTheme.colors.brand : currentTheme.colors.textSecondary,
                border: item.active ? `1px solid ${currentTheme.colors.brand}30` : '1px solid transparent'
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <item.icon size={18} />
              </div>
              <span 
                className={`ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                style={{ 
                  transitionDelay: isCollapsed ? '0ms' : '150ms'
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Section */}
      <div className="flex-shrink-0 space-y-3 border-t p-4" style={{ borderColor: currentTheme.colors.border }}>
        {/* System Status */}
        <div 
          className="flex items-center rounded-lg text-xs min-w-0 h-8 px-3"
          style={{ 
            backgroundColor: `${currentTheme.colors.warning}15`,
            border: `1px solid ${currentTheme.colors.warning}30`
          }}
          title={isCollapsed ? 'Pressurizing' : undefined}
        >
          <div 
            className="animate-pulse flex-shrink-0 w-2 h-2 flex items-center justify-center"
            style={getStatusIndicatorStyle(currentTheme, 'warning')}
          ></div>
          <span 
            className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
            style={{ 
              color: currentTheme.colors.warning,
              transitionDelay: isCollapsed ? '0ms' : '150ms'
            }}
          >
            Pressurizing
          </span>
        </div>
        
        {/* Connection Status */}
        <div 
          className="flex items-center rounded-lg text-xs min-w-0 h-8 px-3"
          style={{ 
            backgroundColor: `${currentTheme.colors.success}15`,
            border: `1px solid ${currentTheme.colors.success}30`,
            color: currentTheme.colors.success
          }}
          title={isCollapsed ? 'Online' : undefined}
        >
          <div className="flex-shrink-0 w-2 h-2 flex items-center justify-center">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: currentTheme.colors.success,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></div>
          </div>
          <span 
            className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
            style={{ 
              transitionDelay: isCollapsed ? '0ms' : '150ms'
            }}
          >
            Online
          </span>
        </div>

        {/* Theme Button */}
        <button
          onClick={onThemeModalOpen}
          className="w-full flex items-center rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-w-0 h-8 px-3"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.textPrimary,
            border: `1px solid ${currentTheme.colors.border}`
          }}
          title={isCollapsed ? 'Change Theme' : undefined}
        >
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <Palette size={14} />
          </div>
          <span 
            className={`ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
            style={{ 
              transitionDelay: isCollapsed ? '0ms' : '150ms'
            }}
          >
            Change Theme
          </span>
        </button>

        {/* Environmental Controls Button */}
        {onEnvControls && (
          <button
            onClick={onEnvControls}
            className="w-full flex items-center rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-w-0 h-8 px-3"
            style={{ 
              backgroundColor: `${currentTheme.colors.info}20`,
              color: currentTheme.colors.info,
              border: `1px solid ${currentTheme.colors.info}30`
            }}
            title={isCollapsed ? 'Environmental Controls' : undefined}
          >
            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              <Settings size={14} />
            </div>
            <span 
              className={`ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
              style={{ 
                transitionDelay: isCollapsed ? '0ms' : '150ms'
              }}
            >
              Environmental
            </span>
          </button>
        )}

        {/* Time Display */}
        <div 
          className={`text-center rounded-lg text-xs font-mono transition-all duration-300 px-3 ${isCollapsed ? 'opacity-0 h-0 py-0' : 'opacity-100 h-8 py-2'}`}
          style={{
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.textSecondary,
            border: `1px solid ${currentTheme.colors.border}`,
            transitionDelay: isCollapsed ? '0ms' : '150ms',
            overflow: 'hidden'
          }}
        >
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </nav>
  );
};

export default SideNavbar; 