import React from 'react';
import { colors, radii } from '../theme/tokens';

export type ElbowVariant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ElbowColor = 'orange' | 'purple' | 'salmon' | 'blue' | 'tan' | 'gold';

interface ElbowProps {
  children?: React.ReactNode;
  variant?: ElbowVariant;
  color?: ElbowColor;
  title?: string;
  width?: string | number;
  height?: string | number;
  thickness?: number;
  className?: string;
}

const colorMap: Record<ElbowColor, string> = {
  orange: colors.lcars.orange,
  purple: colors.lcars.purple,
  salmon: colors.lcars.salmon,
  blue: colors.lcars.blue,
  tan: colors.lcars.tan,
  gold: colors.lcars.gold,
};

const variantStyles: Record<ElbowVariant, React.CSSProperties> = {
  'top-left': {
    borderRadius: `${radii['2xl']} 0 0 0`,
  },
  'top-right': {
    borderRadius: `0 ${radii['2xl']} 0 0`,
  },
  'bottom-left': {
    borderRadius: `0 0 0 ${radii['2xl']}`,
  },
  'bottom-right': {
    borderRadius: `0 0 ${radii['2xl']} 0`,
  },
};

export function Elbow({
  children,
  variant = 'top-left',
  color = 'orange',
  title,
  width = '100%',
  height = 'auto',
  thickness = 40,
  className,
}: ElbowProps) {
  const bgColor = colorMap[color];
  
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    backgroundColor: bgColor,
    ...variantStyles[variant],
    padding: `${thickness / 4}px ${thickness / 2}px`,
    fontFamily: 'var(--nrv-typography-fonts-condensed)',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: colors.bg.primary,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  };
  
  return (
    <div style={containerStyle} className={className}>
      {title && <span style={{ marginRight: 'auto' }}>{title}</span>}
      {children}
    </div>
  );
}

// Horizontal bar component (LCARS-style)
interface BarProps {
  children?: React.ReactNode;
  color?: ElbowColor;
  length?: string | number;
  height?: number;
  rounded?: 'left' | 'right' | 'both' | 'none';
  className?: string;
}

export function Bar({
  children,
  color = 'orange',
  length = '100%',
  height = 40,
  rounded = 'none',
  className,
}: BarProps) {
  const bgColor = colorMap[color];
  
  const getBorderRadius = () => {
    switch (rounded) {
      case 'left': return `${radii.pill} 0 0 ${radii.pill}`;
      case 'right': return `0 ${radii.pill} ${radii.pill} 0`;
      case 'both': return radii.pill;
      default: return '0';
    }
  };
  
  const style: React.CSSProperties = {
    width: typeof length === 'number' ? `${length}px` : length,
    height,
    backgroundColor: bgColor,
    borderRadius: getBorderRadius(),
    padding: `0 ${height / 2}px`,
    fontFamily: 'var(--nrv-typography-fonts-condensed)',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: colors.bg.primary,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  };
  
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}

// Vertical stack of bars (common LCARS pattern)
interface BarStackProps {
  bars: Array<{
    color?: ElbowColor;
    length?: string | number;
    label?: string;
  }>;
  height?: number;
  gap?: number;
  className?: string;
}

export function BarStack({ bars, height = 30, gap = 4, className }: BarStackProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }} className={className}>
      {bars.map((bar, i) => (
        <Bar
          key={i}
          color={bar.color}
          length={bar.length}
          height={height}
          rounded="right"
        >
          {bar.label}
        </Bar>
      ))}
    </div>
  );
}
