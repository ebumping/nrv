import React from 'react';
import { colors, typography } from '../theme/tokens';

// Data Readout Component - displays rapidly changing numerical data
interface DataReadoutProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DataReadout({
  label,
  value,
  unit,
  status = 'normal',
  size = 'md',
  className,
}: DataReadoutProps) {
  const statusColors = {
    normal: colors.hud.green,
    warning: colors.hud.amber,
    critical: colors.hud.red,
  };
  
  const sizes = {
    sm: { label: '10px', value: '14px' },
    md: { label: '12px', value: '18px' },
    lg: { label: '14px', value: '24px' },
  };
  
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: typography.fonts.mono,
    gap: '2px',
  };
  
  const labelStyle: React.CSSProperties = {
    fontSize: sizes[size].label,
    color: colors.hud.whiteDim,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };
  
  const valueStyle: React.CSSProperties = {
    fontSize: sizes[size].value,
    color: statusColors[status],
    fontWeight: typography.weights.bold,
    textShadow: `0 0 10px ${statusColors[status]}40`,
  };
  
  return (
    <div style={style} className={className}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>
        {value}
        {unit && <span style={{ fontSize: '0.6em', marginLeft: '4px' }}>{unit}</span>}
      </span>
    </div>
  );
}

// Crosshair/Reticle component
interface CrosshairProps {
  size?: number;
  color?: string;
  variant?: 'plus' | 'cross' | 'target';
  animated?: boolean;
  className?: string;
}

export function Crosshair({
  size = 20,
  color = colors.hud.white,
  variant = 'plus',
  animated = false,
  className,
}: CrosshairProps) {
  const strokeWidth = 1;
  const gap = size * 0.3;
  
  const animationStyle = animated ? {
    animation: 'pulse 2s infinite',
  } : {};
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={animationStyle}
      className={className}
    >
      {variant === 'plus' && (
        <>
          <line x1={0} y1={size/2} x2={gap} y2={size/2} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size-gap} y1={size/2} x2={size} y2={size/2} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size/2} y1={0} x2={size/2} y2={gap} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size/2} y1={size-gap} x2={size/2} y2={size} stroke={color} strokeWidth={strokeWidth} />
        </>
      )}
      {variant === 'cross' && (
        <>
          <line x1={0} y1={0} x2={size} y2={size} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size} y1={0} x2={0} y2={size} stroke={color} strokeWidth={strokeWidth} />
        </>
      )}
      {variant === 'target' && (
        <>
          <circle cx={size/2} cy={size/2} r={size/3} fill="none" stroke={color} strokeWidth={strokeWidth} />
          <line x1={0} y1={size/2} x2={gap} y2={size/2} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size-gap} y1={size/2} x2={size} y2={size/2} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size/2} y1={0} x2={size/2} y2={gap} stroke={color} strokeWidth={strokeWidth} />
          <line x1={size/2} y1={size-gap} x2={size/2} y2={size} stroke={color} strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={2} fill={color} />
        </>
      )}
    </svg>
  );
}

// Status indicator with label
interface StatusIndicatorProps {
  label: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  label,
  status,
  pulse = true,
  className,
}: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: colors.hud.green, text: 'ONLINE' },
    offline: { color: colors.hud.whiteDim, text: 'OFFLINE' },
    warning: { color: colors.hud.amber, text: 'WARNING' },
    error: { color: colors.hud.red, text: 'ERROR' },
  };
  
  const config = statusConfig[status];
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
  };
  
  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: config.color,
    boxShadow: `0 0 8px ${config.color}`,
    animation: pulse ? 'pulse 2s infinite' : 'none',
  };
  
  const labelStyle: React.CSSProperties = {
    color: colors.hud.whiteDim,
    letterSpacing: typography.letterSpacing.wide,
  };
  
  const statusStyle: React.CSSProperties = {
    color: config.color,
    fontWeight: typography.weights.bold,
  };
  
  return (
    <div style={containerStyle} className={className}>
      <div style={dotStyle} />
      <span style={labelStyle}>{label}</span>
      <span style={statusStyle}>{config.text}</span>
    </div>
  );
}

// Waveform/Oscilloscope display
interface WaveformProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number | string;
  animated?: boolean;
  className?: string;
}

export function Waveform({
  data,
  color = colors.hud.green,
  height = 60,
  width = '100%',
  animated: _animated = false,
  className,
}: WaveformProps) {
  const svgWidth = typeof width === 'number' ? width : 200;
  const padding = 4;
  const graphHeight = height - padding * 2;
  const graphWidth = svgWidth - padding * 2;
  
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * graphWidth;
    const y = padding + (1 - value) * graphHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  };
  
  return (
    <div style={containerStyle} className={className}>
      <svg width="100%" height={height} preserveAspectRatio="none">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={colors.bg.elevated} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Center line */}
        <line
          x1={0}
          y1={height / 2}
          x2={svgWidth}
          y2={height / 2}
          stroke={colors.bg.elevated}
          strokeWidth="1"
          strokeDasharray="4,4"
        />
        
        {/* Waveform */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      </svg>
    </div>
  );
}

// Progress bar with HUD styling
interface HUDProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showValue?: boolean;
  className?: string;
}

export function HUDProgress({
  value,
  max = 100,
  label,
  color = colors.hud.green,
  showValue = true,
  className,
}: HUDProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
  };
  
  const barContainerStyle: React.CSSProperties = {
    height: 8,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  };
  
  const fillStyle: React.CSSProperties = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: color,
    boxShadow: `0 0 10px ${color}`,
    transition: 'width 0.3s ease',
  };
  
  return (
    <div style={containerStyle} className={className}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.hud.whiteDim }}>
          <span>{label}</span>
          {showValue && <span style={{ color }}>{value}/{max}</span>}
        </div>
      )}
      <div style={barContainerStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}
