import React, { useEffect, useRef } from 'react';
import { colors, typography } from '../theme/tokens';

// Tactical Panel - container with military/tech aesthetic
interface TacticalPanelProps {
  children?: React.ReactNode;
  title?: string;
  width?: string | number;
  height?: string | number;
  borderColor?: string;
  showCorners?: boolean;
  className?: string;
}

export function TacticalPanel({
  children,
  title,
  width = '100%',
  height = 'auto',
  borderColor = colors.hud.green,
  showCorners = true,
  className,
}: TacticalPanelProps) {
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    border: `1px solid ${borderColor}40`,
    backgroundColor: `${colors.bg.primary}CC`,
    padding: '16px',
    boxSizing: 'border-box',
  };
  
  const cornerStyle = (position: string): React.CSSProperties => ({
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: borderColor,
    borderStyle: 'solid',
    ...{
      'top-left': { top: -1, left: -1, borderWidth: '2px 0 0 2px' },
      'top-right': { top: -1, right: -1, borderWidth: '2px 2px 0 0' },
      'bottom-left': { bottom: -1, left: -1, borderWidth: '0 0 2px 2px' },
      'bottom-right': { bottom: -1, right: -1, borderWidth: '0 2px 2px 0' },
    }[position],
  });
  
  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: colors.bg.primary,
    padding: '0 8px',
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: borderColor,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  };
  
  return (
    <div style={containerStyle} className={className}>
      {showCorners && (
        <>
          <div style={cornerStyle('top-left')} />
          <div style={cornerStyle('top-right')} />
          <div style={cornerStyle('bottom-left')} />
          <div style={cornerStyle('bottom-right')} />
        </>
      )}
      {title && <div style={titleStyle}>{title}</div>}
      {children}
    </div>
  );
}

// Scanline overlay effect
interface ScanlinesProps {
  opacity?: number;
  animated?: boolean;
  className?: string;
}

export function Scanlines({ opacity = 0.1, animated: _animated = false, className }: ScanlinesProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `
      repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, ${opacity}),
        rgba(0, 0, 0, ${opacity}) 1px,
        transparent 1px,
        transparent 2px
      )
    `,
    zIndex: 1000,
  };
  
  return <div style={style} className={className} />;
}

// Grid background component
interface GridBackgroundProps {
  spacing?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export function GridBackground({
  spacing = 40,
  color = colors.hud.green,
  opacity = 0.1,
  className,
}: GridBackgroundProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px),
      linear-gradient(90deg, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)
    `,
    backgroundSize: `${spacing}px ${spacing}px`,
  };
  
  return <div style={style} className={className} />;
}

// Terrain/Wireframe visualization (simplified canvas-based)
interface TerrainProps {
  width?: number;
  height?: number;
  lineColor?: string;
  pathColor?: string;
  className?: string;
}

export function Terrain({
  width = 400,
  height = 300,
  lineColor = colors.hud.green,
  pathColor = colors.hud.red,
  className,
}: TerrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = colors.bg.primary;
    ctx.fillRect(0, 0, width, height);
    
    // Draw terrain lines (simplified noise-based)
    const lines = 20;
    const points = 40;
    
    for (let y = 0; y < lines; y++) {
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      
      for (let x = 0; x < points; x++) {
        const px = (x / (points - 1)) * width;
        const baseY = (y / (lines - 1)) * height;
        
        // Simple noise-like offset
        const noise = Math.sin(x * 0.3 + y * 0.2) * 20 + 
                      Math.sin(x * 0.1 + y * 0.5) * 10;
        
        const py = baseY + noise + (Math.sin(x * 0.05) * (height / 4) * (1 - y / lines));
        
        if (x === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      
      ctx.stroke();
    }
    
    // Draw path
    ctx.beginPath();
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = 3;
    
    const pathPoints = [
      [0.1, 0.5],
      [0.2, 0.4],
      [0.35, 0.55],
      [0.5, 0.45],
      [0.65, 0.5],
      [0.8, 0.4],
      [0.9, 0.45],
    ];
    
    pathPoints.forEach(([px, py], i) => {
      const x = px * width;
      const y = py * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw markers along path
    ctx.fillStyle = pathColor;
    pathPoints.forEach(([px, py]) => {
      const x = px * width;
      const y = py * height;
      
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 4, y);
      ctx.lineTo(x, y + 6);
      ctx.lineTo(x - 4, y);
      ctx.closePath();
      ctx.fill();
    });
    
    // Draw crosshairs grid
    ctx.strokeStyle = colors.hud.white + '40';
    ctx.lineWidth = 1;
    
    const gridSize = 60;
    for (let x = gridSize; x < width; x += gridSize) {
      for (let y = gridSize; y < height; y += gridSize) {
        const size = 8;
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
      }
    }
    
  }, [width, height, lineColor, pathColor]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
    />
  );
}

// Marker/Node component for maps
interface MarkerProps {
  type?: 'diamond' | 'circle' | 'square' | 'triangle';
  size?: number;
  color?: string;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function Marker({
  type = 'diamond',
  size = 12,
  color = colors.hud.red,
  label,
  pulse = false,
  className,
}: MarkerProps) {
  const shapeStyle: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
    boxShadow: `0 0 10px ${color}`,
    animation: pulse ? 'pulse 1.5s infinite' : 'none',
    ...{
      diamond: { transform: 'rotate(45deg)' },
      circle: { borderRadius: '50%' },
      square: {},
      triangle: {
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    }[type],
  };
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  };
  
  const labelStyle: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: 10,
    color: colors.hud.white,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };
  
  return (
    <div style={containerStyle} className={className}>
      <div style={shapeStyle} />
      {label && <span style={labelStyle}>{label}</span>}
    </div>
  );
}

// Coordinate display
interface CoordinatesProps {
  lat: number;
  lng: number;
  format?: 'decimal' | 'dms';
  label?: string;
  className?: string;
}

export function Coordinates({
  lat,
  lng,
  format = 'decimal',
  label,
  className,
}: CoordinatesProps) {
  const formatDMS = (decimal: number, isLat: boolean) => {
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    const d = Math.abs(decimal);
    const degrees = Math.floor(d);
    const minutes = Math.floor((d - degrees) * 60);
    const seconds = ((d - degrees - minutes / 60) * 3600).toFixed(1);
    return `${degrees}°${minutes}'${seconds}"${dir}`;
  };
  
  const latStr = format === 'dms' ? formatDMS(lat, true) : lat.toFixed(6);
  const lngStr = format === 'dms' ? formatDMS(lng, false) : lng.toFixed(6);
  
  const containerStyle: React.CSSProperties = {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: colors.hud.cyan,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
  
  const labelStyle: React.CSSProperties = {
    fontSize: typography.sizes.xs,
    color: colors.hud.whiteDim,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };
  
  return (
    <div style={containerStyle} className={className}>
      {label && <span style={labelStyle}>{label}</span>}
      <span>LAT: {latStr}</span>
      <span>LNG: {lngStr}</span>
    </div>
  );
}
