import React from 'react';

/**
 * HUDFrame - Universal NERV-style container
 * 
 * Makes anything look Eva-authentic with:
 * - Thin colored border
 * - Corner bracket extensions (perpendicular lines extending inward)
 * - Optional top label bar with mono-primary text
 * - Crosshair markers at corners
 * - Dashed inner zone border option
 */

export interface HUDFrameProps {
  children: React.ReactNode;
  
  /** Frame label (displayed in top label bar) */
  label?: string;
  
  /** Japanese secondary label */
  labelJp?: string;
  
  /** Border/accent color */
  color?: 'orange' | 'cyan' | 'green' | 'red' | 'magenta' | 'amber';
  
  /** Show corner bracket extensions */
  cornerBrackets?: boolean;
  
  /** Corner bracket size in pixels */
  cornerBracketSize?: number;
  
  /** Show crosshair markers at corners */
  crosshairs?: boolean;
  
  /** Crosshair variant */
  crosshairVariant?: 'plus' | 'cross';
  
  /** Show dashed inner border */
  dashedBorder?: boolean;
  
  /** Show top label bar */
  labelBar?: boolean;
  
  /** Scanline effect overlay */
  scanlines?: boolean;
  
  /** Alert/emergency mode - adds strobe animation */
  alert?: boolean;
  
  /** Alert level (affects color and animation) */
  alertLevel?: 'caution' | 'warning' | 'danger' | 'critical' | 'emergency';
  
  /** Custom width */
  width?: string | number;
  
  /** Custom height */
  height?: string | number;
  
  /** Additional className */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
}

const colorMap = {
  orange: 'var(--nerv-orange)',
  cyan: 'var(--nerv-cyan)',
  green: 'var(--nerv-green)',
  red: 'var(--nerv-red)',
  magenta: 'var(--nerv-magenta)',
  amber: 'var(--nerv-amber)',
};

const alertColors = {
  caution: 'var(--nerv-yellow)',
  warning: 'var(--nerv-amber)',
  danger: 'var(--nerv-orange)',
  critical: 'var(--nerv-red)',
  emergency: 'var(--nerv-red)',
};

export function HUDFrame({
  children,
  label,
  labelJp,
  color = 'orange',
  cornerBrackets = true,
  cornerBracketSize = 16,
  crosshairs = false,
  crosshairVariant = 'plus',
  dashedBorder = false,
  labelBar = true,
  scanlines = false,
  alert = false,
  alertLevel = 'warning',
  width,
  height,
  className,
  style,
}: HUDFrameProps) {
  const accentColor = alert ? alertColors[alertLevel] : colorMap[color];
  
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width || '100%',
    height: height || 'auto',
    backgroundColor: 'var(--nerv-bg)',
    border: `${alert && alertLevel === 'emergency' ? 2 : 1}px solid ${accentColor}`,
    fontFamily: 'var(--nerv-font-mono)',
    color: accentColor,
    ...style,
  };
  
  // Corner bracket styles
  const bracketStyle: React.CSSProperties = {
    position: 'absolute',
    width: cornerBracketSize,
    height: cornerBracketSize,
    pointerEvents: 'none',
  };
  
  const renderCornerBracket = (position: 'tl' | 'tr' | 'bl' | 'br') => {
    const isTop = position.startsWith('t');
    const isLeft = position.endsWith('l');
    
    const specificStyle: React.CSSProperties = {
      ...bracketStyle,
      top: isTop ? -1 : 'auto',
      bottom: isTop ? 'auto' : -1,
      left: isLeft ? -1 : 'auto',
      right: isLeft ? 'auto' : -1,
    };
    
    const paths = {
      tl: `M0,${cornerBracketSize} L0,0 L${cornerBracketSize},0`,
      tr: `M0,0 L${cornerBracketSize},0 L${cornerBracketSize},${cornerBracketSize}`,
      bl: `M0,0 L0,${cornerBracketSize} L${cornerBracketSize},${cornerBracketSize}`,
      br: `M${cornerBracketSize},0 L${cornerBracketSize},${cornerBracketSize} L0,${cornerBracketSize}`,
    };
    
    return (
      <svg
        key={position}
        style={specificStyle}
        width={cornerBracketSize}
        height={cornerBracketSize}
        viewBox={`0 0 ${cornerBracketSize} ${cornerBracketSize}`}
      >
        <path
          d={paths[position]}
          fill="none"
          stroke={accentColor}
          strokeWidth={alert ? 2 : 1}
        />
      </svg>
    );
  };
  
  const renderCrosshair = (position: 'tl' | 'tr' | 'bl' | 'br', size: number = 12) => {
    const isTop = position.startsWith('t');
    const isLeft = position.endsWith('l');
    const offset = 8;
    
    const specificStyle: React.CSSProperties = {
      position: 'absolute',
      top: isTop ? offset : 'auto',
      bottom: isTop ? 'auto' : offset,
      left: isLeft ? offset : 'auto',
      right: isLeft ? 'auto' : offset,
    };
    
    return (
      <svg
        key={`crosshair-${position}`}
        style={specificStyle}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {crosshairVariant === 'plus' ? (
          <>
            <line x1={0} y1={size/2} x2={size} y2={size/2} stroke={accentColor} strokeWidth={1} />
            <line x1={size/2} y1={0} x2={size/2} y2={size} stroke={accentColor} strokeWidth={1} />
          </>
        ) : (
          <>
            <line x1={0} y1={0} x2={size} y2={size} stroke={accentColor} strokeWidth={1} />
            <line x1={size} y1={0} x2={0} y2={size} stroke={accentColor} strokeWidth={1} />
          </>
        )}
      </svg>
    );
  };
  
  const renderLabelBar = () => {
    if (!label && !labelJp) return null;
    
    const barStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 12px',
      borderBottom: `1px solid ${accentColor}`,
      backgroundColor: 'var(--nerv-bg-elevated)',
    };
    
    const labelStyle: React.CSSProperties = {
      font: 'var(--nerv-mono-primary)',
      fontSize: 'var(--nerv-text-sm)',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      animation: alert ? 'nerv-strobe 500ms infinite' : 'none',
    };
    
    const labelJpStyle: React.CSSProperties = {
      font: 'var(--nerv-kanji-label)',
      fontSize: 'var(--nerv-text-xs)',
      opacity: 0.7,
    };
    
    return (
      <div style={barStyle}>
        {label && <span style={labelStyle}>{label}</span>}
        {labelJp && <span style={labelJpStyle}>{labelJp}</span>}
      </div>
    );
  };
  
  const renderScanlines = () => {
    if (!scanlines) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )`,
        }}
      />
    );
  };
  
  const contentStyle: React.CSSProperties = {
    position: 'relative',
    padding: dashedBorder ? 'var(--nerv-space-md)' : 'var(--nerv-space-sm)',
    height: label ? 'calc(100% - 32px)' : '100%',
    overflow: 'auto',
  };
  
  const dashedBorderStyle: React.CSSProperties = dashedBorder ? {
    position: 'absolute',
    inset: 8,
    border: `1px dashed ${accentColor}`,
    opacity: 0.4,
    pointerEvents: 'none',
  } : {};
  
  return (
    <div 
      style={containerStyle} 
      className={className}
      data-nerv-frame={label || 'anonymous'}
      data-alert={alert ? alertLevel : undefined}
    >
      {/* Corner brackets */}
      {cornerBrackets && (
        <>
          {renderCornerBracket('tl')}
          {renderCornerBracket('tr')}
          {renderCornerBracket('bl')}
          {renderCornerBracket('br')}
        </>
      )}
      
      {/* Crosshairs */}
      {crosshairs && (
        <>
          {renderCrosshair('tl')}
          {renderCrosshair('tr')}
          {renderCrosshair('bl')}
          {renderCrosshair('br')}
        </>
      )}
      
      {/* Label bar */}
      {labelBar && renderLabelBar()}
      
      {/* Dashed inner border */}
      {dashedBorder && <div style={dashedBorderStyle} />}
      
      {/* Content */}
      <div style={contentStyle}>
        {children}
      </div>
      
      {/* Scanline overlay */}
      {renderScanlines()}
    </div>
  );
}

export default HUDFrame;
