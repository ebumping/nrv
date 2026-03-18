import React from 'react';
import { colors, typography, spacing } from '../theme/tokens';

// Main HUD Container
interface HUDContainerProps {
  children: React.ReactNode;
  fullscreen?: boolean;
  showGrid?: boolean;
  showScanlines?: boolean;
  className?: string;
}

export function HUDContainer({
  children,
  fullscreen = false,
  showGrid = false,
  showScanlines = false,
  className,
}: HUDContainerProps) {
  const style: React.CSSProperties = {
    width: fullscreen ? '100vw' : '100%',
    height: fullscreen ? '100vh' : '100%',
    backgroundColor: colors.bg.primary,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: typography.fonts.mono,
    color: colors.hud.white,
  };
  
  return (
    <div style={style} className={className}>
      {showGrid && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(${colors.hud.green}10 1px, transparent 1px),
              linear-gradient(90deg, ${colors.hud.green}10 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}
      {showScanlines && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.1),
                rgba(0, 0, 0, 0.1) 1px,
                transparent 1px,
                transparent 2px
              )
            `,
          }}
        />
      )}
      {children}
    </div>
  );
}

// LCARS-style panel layout
interface LCARSLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LCARSLayout({
  header,
  sidebar,
  footer,
  children,
  className,
}: LCARSLayoutProps) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: header ? 'auto 1fr' : '1fr',
    gridTemplateColumns: sidebar ? 'auto 1fr' : '1fr',
    minHeight: '100%',
    backgroundColor: colors.bg.primary,
    fontFamily: typography.fonts.condensed,
    color: colors.bg.primary,
  };
  
  const mainStyle: React.CSSProperties = {
    gridRow: 2,
    gridColumn: 2,
    padding: spacing[4],
    overflow: 'auto',
  };
  
  return (
    <div style={containerStyle} className={className}>
      {header && <div style={{ gridColumn: '1 / -1' }}>{header}</div>}
      {sidebar && <div>{sidebar}</div>}
      <div style={mainStyle}>{children}</div>
      {footer && <div style={{ gridColumn: '1 / -1' }}>{footer}</div>}
    </div>
  );
}

// Flex layout helpers
interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number;
  wrap?: boolean;
  className?: string;
}

export function Flex({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  gap = 0,
  wrap = false,
  className,
}: FlexProps) {
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };
  
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justifyMap[justify],
    gap: gap ? `${gap}px` : undefined,
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };
  
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}

// Grid layout
interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  rows?: number | string;
  gap?: number;
  className?: string;
}

export function Grid({
  children,
  columns = 1,
  rows = 'auto',
  gap = 0,
  className,
}: GridProps) {
  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' 
      ? `repeat(${columns}, 1fr)` 
      : columns,
    gridTemplateRows: typeof rows === 'number' 
      ? `repeat(${rows}, 1fr)` 
      : rows,
    gap: gap ? `${gap}px` : undefined,
  };
  
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}

// Spacer component
interface SpacerProps {
  size?: number | string;
  direction?: 'horizontal' | 'vertical';
}

export function Spacer({ size = 16, direction = 'vertical' }: SpacerProps) {
  const style: React.CSSProperties = {
    width: direction === 'horizontal' 
      ? (typeof size === 'number' ? `${size}px` : size) 
      : 0,
    height: direction === 'vertical' 
      ? (typeof size === 'number' ? `${size}px` : size) 
      : 0,
    flexShrink: 0,
  };
  
  return <div style={style} />;
}

// Divider component
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  length?: string | number;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  color = colors.hud.green + '40',
  length = '100%',
  className,
}: DividerProps) {
  const style: React.CSSProperties = {
    backgroundColor: color,
    ...(orientation === 'horizontal' 
      ? { width: typeof length === 'number' ? `${length}px` : length, height: 1 }
      : { width: 1, height: typeof length === 'number' ? `${length}px` : length }
    ),
  };
  
  return <div style={style} className={className} />;
}

// Card component
interface CardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'lcars' | 'hud';
  padding?: number | string;
  className?: string;
}

export function Card({
  children,
  title,
  variant = 'hud',
  padding = 16,
  className,
}: CardProps) {
  const baseStyle: React.CSSProperties = {
    backgroundColor: colors.bg.secondary,
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    borderRadius: variant === 'lcars' ? '16px 0 0 0' : 4,
  };
  
  const hudStyle: React.CSSProperties = {
    ...baseStyle,
    border: `1px solid ${colors.hud.green}40`,
  };
  
  const lcarsStyle: React.CSSProperties = {
    ...baseStyle,
    borderLeft: `4px solid ${colors.lcars.orange}`,
  };
  
  const titleStyle: React.CSSProperties = {
    fontFamily: variant === 'lcars' ? typography.fonts.condensed : typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: variant === 'lcars' ? colors.lcars.orange : colors.hud.green,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: 12,
  };
  
  return (
    <div 
      style={variant === 'lcars' ? lcarsStyle : hudStyle} 
      className={className}
    >
      {title && <div style={titleStyle}>{title}</div>}
      {children}
    </div>
  );
}
