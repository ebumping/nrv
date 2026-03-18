import React, { useEffect, useState } from 'react';

/**
 * AlertBanner - NERV Emergency/Alert Banner
 * 
 * Full-width horizontal band with:
 * - Animated chevron/hazard stripe pattern (>>><<<)
 * - Bilingual label stack (EN + JP)
 * - Pulse/strobe animation for emergency states
 * - Deep red-to-black gradient background
 */

export interface AlertBannerProps {
  /** Alert level - affects color and animation intensity */
  level?: 'caution' | 'warning' | 'danger' | 'critical' | 'emergency';
  
  /** Primary label (English) */
  label?: string;
  
  /** Secondary label (Japanese) */
  labelJp?: string;
  
  /** Show chevron pattern background */
  chevronPattern?: boolean;
  
  /** Chevron animation speed (ms) */
  chevronSpeed?: number;
  
  /** Strobe text animation */
  strobe?: boolean;
  
  /** Additional className */
  className?: string;
}

const levelConfig = {
  caution: {
    color: '#CCCC00', // yellow
    bgGradient: 'linear-gradient(90deg, #1a1a00 0%, #0a0a00 50%, #1a1a00 100%)',
    borderColor: '#CCCC00',
    textGlow: '0 0 10px #CCCC00',
  },
  warning: {
    color: '#FFAA00', // amber
    bgGradient: 'linear-gradient(90deg, #2a1a00 0%, #0a0a00 50%, #2a1a00 100%)',
    borderColor: '#FFAA00',
    textGlow: '0 0 15px #FFAA00',
  },
  danger: {
    color: '#FF6600', // orange
    bgGradient: 'linear-gradient(90deg, #2a1000 0%, #0a0000 50%, #2a1000 100%)',
    borderColor: '#FF6600',
    textGlow: '0 0 20px #FF6600',
  },
  critical: {
    color: '#FF0000', // bright red
    bgGradient: 'linear-gradient(90deg, #2a0000 0%, #0a0000 50%, #2a0000 100%)',
    borderColor: '#FF0000',
    textGlow: '0 0 25px #FF0000',
  },
  emergency: {
    color: '#FF0000', // bright red
    bgGradient: 'linear-gradient(90deg, #3a0000 0%, #0a0000 50%, #3a0000 100%)',
    borderColor: '#FF0000',
    textGlow: '0 0 30px #FF0000, 0 0 60px #FF0000',
  },
};

export function AlertBanner({
  level = 'warning',
  label = 'ALERT',
  labelJp,
  chevronPattern = true,
  chevronSpeed = 1000,
  strobe = true,
  className,
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  const config = levelConfig[level];
  
  // Strobe animation
  useEffect(() => {
    if (!strobe) return;
    
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, level === 'emergency' ? 250 : level === 'critical' ? 400 : 500);
    
    return () => clearInterval(interval);
  }, [strobe, level]);
  
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    padding: '16px 24px',
    background: config.bgGradient,
    borderBottom: `2px solid ${config.borderColor}`,
    borderTop: `2px solid ${config.borderColor}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  };
  
  const chevronStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.3,
  };
  
  const labelStyle: React.CSSProperties = {
    font: 'bold 32px/1 "Archivo Narrow", "Roboto Condensed", sans-serif',
    color: config.color,
    textTransform: 'uppercase',
    letterSpacing: '8px',
    textShadow: config.textGlow,
    opacity: strobe ? (visible ? 1 : 0) : 1,
    transition: strobe ? 'opacity 0.1s' : 'none',
    zIndex: 1,
  };
  
  const labelJpStyle: React.CSSProperties = {
    font: '14px/1 "MS Gothic", "M+ 2m", monospace',
    color: config.color,
    opacity: strobe ? (visible ? 0.8 : 0) : 0.8,
    letterSpacing: '4px',
    zIndex: 1,
  };
  
  return (
    <div style={containerStyle} className={className} data-alert-level={level}>
      {/* Chevron pattern background */}
      {chevronPattern && (
        <svg style={chevronStyle} width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern 
              id={`chevron-${level}`} 
              x="0" 
              y="0" 
              width="40" 
              height="100%" 
              patternUnits="userSpaceOnUse"
            >
              {/* Animated chevron arrows */}
              <polygon 
                points="0,50 20,0 40,50 20,100" 
                fill="none" 
                stroke={config.color} 
                strokeWidth="1"
                opacity="0.4"
              />
            </pattern>
            
            {/* Animation for chevron scroll */}
            <animate 
              attributeName="x" 
              from="0" 
              to="40" 
              dur={`${chevronSpeed}ms`} 
              repeatCount="indefinite"
            />
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill={`url(#chevron-${level})`}
          />
        </svg>
      )}
      
      {/* Label stack */}
      {labelJp && <span style={labelJpStyle}>{labelJp}</span>}
      <span style={labelStyle}>{label}</span>
      {labelJp && <span style={labelJpStyle}>{labelJp}</span>}
    </div>
  );
}

/**
 * ChevronPattern - Standalone animated chevron background
 * Can be used as overlay for any component
 */
export interface ChevronPatternProps {
  color?: string;
  animated?: boolean;
  speed?: number;
  direction?: 'left' | 'right';
  opacity?: number;
}

export function ChevronPattern({
  color = '#FF6600',
  animated = true,
  speed = 2000,
  direction = 'right',
  opacity = 0.2,
}: ChevronPatternProps) {
  const [offset, setOffset] = React.useState(0);
  
  React.useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setOffset(o => (o + 1) % 40);
    }, speed / 40);
    
    return () => clearInterval(interval);
  }, [animated, speed]);
  
  return (
    <svg 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        pointerEvents: 'none',
        opacity,
      }}
      width="100%" 
      height="100%" 
      preserveAspectRatio="none"
    >
      <defs>
        <pattern 
          id="chevron-pattern" 
          x={direction === 'right' ? offset : -offset} 
          y="0" 
          width="40" 
          height="20" 
          patternUnits="userSpaceOnUse"
        >
          <path 
            d="M0,10 L10,0 L20,10 L10,20 Z M20,10 L30,0 L40,10 L30,20 Z" 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#chevron-pattern)" />
    </svg>
  );
}

export default AlertBanner;
