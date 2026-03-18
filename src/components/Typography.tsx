import React from 'react';
import { colors, typography } from '../theme/tokens';

// Text component with variants
interface TextProps {
  children: React.ReactNode;
  variant?: 'mono' | 'condensed' | 'display' | 'body';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  spacing?: 'tight' | 'normal' | 'wide' | 'wider';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function Text({
  children,
  variant = 'mono',
  size = 'md',
  weight = 'normal',
  color = colors.hud.white,
  align = 'left',
  transform = 'none',
  spacing = 'normal',
  as: Component = 'span',
  className,
}: TextProps) {
  const fontMap = {
    mono: typography.fonts.mono,
    condensed: typography.fonts.condensed,
    display: typography.fonts.display,
    body: typography.fonts.body,
  };
  
  const style: React.CSSProperties = {
    fontFamily: fontMap[variant],
    fontSize: typography.sizes[size],
    fontWeight: typography.weights[weight],
    color,
    textAlign: align,
    textTransform: transform,
    letterSpacing: typography.letterSpacing[spacing],
  };
  
  return (
    <Component style={style} className={className}>
      {children}
    </Component>
  );
}

// Label component
interface LabelProps {
  children: React.ReactNode;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function Label({
  children,
  color = colors.hud.whiteDim,
  size = 'xs',
  className,
}: LabelProps) {
  const style: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes[size],
    color,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };
  
  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
}

// Title/Heading components
interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  variant?: 'lcars' | 'hud';
  className?: string;
}

export function Heading({
  children,
  level = 1,
  variant = 'hud',
  className,
}: HeadingProps) {
  const sizes = {
    1: typography.sizes['4xl'],
    2: typography.sizes['3xl'],
    3: typography.sizes['2xl'],
    4: typography.sizes.xl,
  };
  
  const variantStyles = {
    lcars: {
      fontFamily: typography.fonts.condensed,
      color: colors.lcars.orange,
    },
    hud: {
      fontFamily: typography.fonts.mono,
      color: colors.hud.green,
    },
  };
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const style: React.CSSProperties = {
    fontSize: sizes[level],
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    margin: 0,
    ...variantStyles[variant],
  };
  
  return (
    <Tag style={style} className={className}>
      {children}
    </Tag>
  );
}

// Data display with label
interface DataDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function DataDisplay({
  label,
  value,
  unit,
  status = 'normal',
  size = 'md',
  direction = 'vertical',
  className,
}: DataDisplayProps) {
  const statusColors = {
    normal: colors.hud.white,
    success: colors.hud.green,
    warning: colors.hud.amber,
    error: colors.hud.red,
  };
  
  const sizes = {
    sm: { label: typography.sizes.xs, value: typography.sizes.md },
    md: { label: typography.sizes.xs, value: typography.sizes.xl },
    lg: { label: typography.sizes.sm, value: typography.sizes['2xl'] },
  };
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: direction === 'vertical' ? 'flex-start' : 'baseline',
    gap: direction === 'vertical' ? 4 : 8,
  };
  
  const labelStyle: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: sizes[size].label,
    color: colors.hud.whiteDim,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };
  
  const valueStyle: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: sizes[size].value,
    fontWeight: typography.weights.bold,
    color: statusColors[status],
    textShadow: `0 0 10px ${statusColors[status]}40`,
  };
  
  const unitStyle: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: sizes[size].label,
    color: colors.hud.whiteDim,
    marginLeft: 4,
  };
  
  return (
    <div style={containerStyle} className={className}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>
        {value}
        {unit && <span style={unitStyle}>{unit}</span>}
      </span>
    </div>
  );
}

// Blinking text effect
interface BlinkProps {
  children: React.ReactNode;
  interval?: number;
  className?: string;
}

export function Blink({ children, interval = 500, className }: BlinkProps) {
  const style: React.CSSProperties = {
    animation: `blink ${interval}ms infinite`,
  };
  
  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
}

// Code/Monospace text
interface CodeProps {
  children: React.ReactNode;
  color?: string;
  background?: string;
  className?: string;
}

export function Code({
  children,
  color = colors.hud.cyan,
  background = colors.bg.tertiary,
  className,
}: CodeProps) {
  const style: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color,
    backgroundColor: background,
    padding: '2px 6px',
    borderRadius: 2,
  };
  
  return (
    <code style={style} className={className}>
      {children}
    </code>
  );
}
