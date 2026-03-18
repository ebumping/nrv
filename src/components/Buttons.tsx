import React from 'react';
import { colors, typography, radii } from '../theme/tokens';

// LCARS Pill Button
interface PillButtonProps {
  children: React.ReactNode;
  color?: 'orange' | 'purple' | 'salmon' | 'blue' | 'tan' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

const pillColors = {
  orange: { bg: colors.lcars.orange, text: colors.bg.primary },
  purple: { bg: colors.lcars.purple, text: colors.bg.primary },
  salmon: { bg: colors.lcars.salmon, text: colors.bg.primary },
  blue: { bg: colors.lcars.blue, text: colors.bg.primary },
  tan: { bg: colors.lcars.tan, text: colors.bg.primary },
  gold: { bg: colors.lcars.gold, text: colors.bg.primary },
};

const pillSizes = {
  sm: { height: 24, padding: '0 16px', fontSize: '10px' },
  md: { height: 32, padding: '0 24px', fontSize: '12px' },
  lg: { height: 40, padding: '0 32px', fontSize: '14px' },
};

export function PillButton({
  children,
  color = 'orange',
  size = 'md',
  onClick,
  disabled = false,
  active = false,
  className,
}: PillButtonProps) {
  const { bg, text } = pillColors[color];
  const sizeConfig = pillSizes[size];
  
  const style: React.CSSProperties = {
    height: sizeConfig.height,
    padding: sizeConfig.padding,
    borderRadius: radii.pill,
    backgroundColor: disabled ? colors.bg.elevated : bg,
    color: disabled ? colors.hud.whiteDim : text,
    fontFamily: typography.fonts.condensed,
    fontSize: sizeConfig.fontSize,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : active ? 0.8 : 1,
    transition: 'all 0.15s ease',
    outline: 'none',
  };
  
  return (
    <button
      style={style}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

// HUD-style button
interface HUDButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const hudVariants = {
  primary: {
    bg: 'transparent',
    border: colors.hud.green,
    text: colors.hud.green,
    hoverBg: `${colors.hud.green}20`,
  },
  secondary: {
    bg: 'transparent',
    border: colors.hud.cyan,
    text: colors.hud.cyan,
    hoverBg: `${colors.hud.cyan}20`,
  },
  danger: {
    bg: 'transparent',
    border: colors.hud.red,
    text: colors.hud.red,
    hoverBg: `${colors.hud.red}20`,
  },
};

const hudSizes = {
  sm: { height: 28, padding: '0 12px', fontSize: '11px' },
  md: { height: 36, padding: '0 16px', fontSize: '13px' },
  lg: { height: 44, padding: '0 20px', fontSize: '15px' },
};

export function HUDButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
}: HUDButtonProps) {
  const config = hudVariants[variant];
  const sizeConfig = hudSizes[size];
  
  const style: React.CSSProperties = {
    height: sizeConfig.height,
    padding: sizeConfig.padding,
    backgroundColor: config.bg,
    border: `1px solid ${config.border}`,
    color: config.text,
    fontFamily: typography.fonts.mono,
    fontSize: sizeConfig.fontSize,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
    textTransform: 'uppercase',
    borderRadius: radii.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s ease',
    outline: 'none',
    boxShadow: `0 0 10px ${config.border}40`,
  };
  
  return (
    <button
      style={style}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

// Icon button (HUD style)
interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const iconSizes = {
  sm: 28,
  md: 36,
  lg: 44,
};

export function IconButton({
  icon,
  label,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
}: IconButtonProps) {
  const config = hudVariants[variant];
  const buttonSize = iconSizes[size];
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
  
  const buttonStyle: React.CSSProperties = {
    width: buttonSize,
    height: buttonSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.bg,
    border: `1px solid ${config.border}`,
    color: config.text,
    borderRadius: radii.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s ease',
    outline: 'none',
    boxShadow: `0 0 10px ${config.border}40`,
  };
  
  const labelStyle: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: config.text,
    letterSpacing: typography.letterSpacing.normal,
  };
  
  return (
    <div style={containerStyle} className={className}>
      <button
        style={buttonStyle}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </button>
      {label && <span style={labelStyle}>{label}</span>}
    </div>
  );
}

// Button group
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  gap?: number;
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  gap = 4,
  className,
}: ButtonGroupProps) {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: `${gap}px`,
  };
  
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
