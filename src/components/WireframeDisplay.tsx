import React from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// WIREFRAME TERRAIN DISPLAY - 3D wireframe map with grid overlay
// Key Eva visual: wireframe terrain with blips, zone boundaries
// ═══════════════════════════════════════════════════════════════════════════════

interface BlipData {
  id: string;
  x: number;
  y: number;
  type: 'friendly' | 'hostile' | 'unknown';
  label?: string;
}

interface WireframeTerrainProps {
  width?: number;
  height?: number;
  blips?: BlipData[];
  gridDensity?: number;
  showContours?: boolean;
}

export function WireframeTerrain({
  width = 400,
  height = 300,
  blips = [],
  gridDensity = 10,
  showContours = true,
}: WireframeTerrainProps) {
  // Generate terrain contour lines (simplified perspective)
  const generateContours = (): JSX.Element[] => {
    const contours: JSX.Element[] = [];
    const levels = 5;
    
    for (let level = 0; level < levels; level++) {
      const y = height * 0.3 + (level * height * 0.15);
      const perspective = 1 - (level * 0.15);
      const lineWidth = width * perspective;
      const xOffset = (width - lineWidth) / 2;
      
      // Create wavy contour line
      const points: string[] = [];
      const segments = 20;
      for (let i = 0; i <= segments; i++) {
        const x = xOffset + (lineWidth * i / segments);
        const waveY = y + Math.sin(i * 0.5 + level) * (3 + level * 2);
        points.push(`${x},${waveY}`);
      }
      
      contours.push(
        <polyline
          key={`contour-${level}`}
          points={points.join(' ')}
          fill="none"
          stroke={NERVColors.phosphorGreen}
          strokeWidth={0.5}
          opacity={0.4 - level * 0.05}
        />
      );
    }
    
    return contours;
  };
  
  // Generate perspective grid
  const generateGrid = (): JSX.Element[] => {
    const grid: JSX.Element[] = [];
    const horizonY = height * 0.15;
    const bottomY = height;
    
    // Horizontal lines (converging to horizon)
    for (let i = 0; i <= gridDensity; i++) {
      const progress = i / gridDensity;
      const y = horizonY + (bottomY - horizonY) * progress;
      const perspective = 0.1 + 0.9 * progress;
      const lineWidth = width * perspective;
      const xOffset = (width - lineWidth) / 2;
      
      grid.push(
        <line
          key={`h-${i}`}
          x1={xOffset}
          y1={y}
          x2={xOffset + lineWidth}
          y2={y}
          stroke={NERVColors.phosphorGreen}
          strokeWidth={0.3}
          opacity={0.3}
        />
      );
    }
    
    // Vertical lines (converging to vanishing point)
    const vanishX = width / 2;
    for (let i = 0; i <= gridDensity; i++) {
      const bottomX = (width / gridDensity) * i;
      
      grid.push(
        <line
          key={`v-${i}`}
          x1={vanishX}
          y1={horizonY}
          x2={bottomX}
          y2={bottomY}
          stroke={NERVColors.phosphorGreen}
          strokeWidth={0.3}
          opacity={0.3}
        />
      );
    }
    
    return grid;
  };
  
  // Render blips (targets/units)
  const renderBlips = (): JSX.Element[] => {
    const blipColors = {
      friendly: NERVColors.phosphorGreen,
      hostile: NERVColors.crimson,
      unknown: NERVColors.amber,
    };
    
    return blips.map((blip) => {
      const color = blipColors[blip.type];
      
      return (
        <g key={blip.id}>
          {/* Blip glow */}
          <circle
            cx={blip.x}
            cy={blip.y}
            r={8}
            fill={color}
            opacity={0.3}
            style={{
              animation: 'pulse 1.5s infinite',
            }}
          />
          
          {/* Blip center */}
          <circle
            cx={blip.x}
            cy={blip.y}
            r={3}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
          
          {/* Blip label */}
          {blip.label && (
            <text
              x={blip.x + 12}
              y={blip.y + 4}
              fill={color}
              fontSize={9}
              fontFamily="'Courier New', monospace"
            >
              {blip.label}
            </text>
          )}
          
          {/* Crosshair around hostile */}
          {blip.type === 'hostile' && (
            <>
              <line x1={blip.x - 12} y1={blip.y} x2={blip.x - 6} y2={blip.y} stroke={color} strokeWidth={1} />
              <line x1={blip.x + 6} y1={blip.y} x2={blip.x + 12} y2={blip.y} stroke={color} strokeWidth={1} />
              <line x1={blip.x} y1={blip.y - 12} x2={blip.x} y2={blip.y - 6} stroke={color} strokeWidth={1} />
              <line x1={blip.x} y1={blip.y + 6} x2={blip.x} y2={blip.y + 12} stroke={color} strokeWidth={1} />
            </>
          )}
        </g>
      );
    });
  };
  
  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <filter id="terrain-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Radial fade for depth */}
          <radialGradient id="terrain-fade" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor={NERVColors.terminalBlack} stopOpacity="0.5" />
          </radialGradient>
        </defs>
        
        {/* Background */}
        <rect width={width} height={height} fill={NERVColors.terminalBlack} />
        
        {/* Perspective grid */}
        <g filter="url(#terrain-glow)">
          {generateGrid()}
        </g>
        
        {/* Terrain contours */}
        {showContours && (
          <g filter="url(#terrain-glow)">
            {generateContours()}
          </g>
        )}
        
        {/* Blips */}
        {renderBlips()}
        
        {/* Depth fade overlay */}
        <rect width={width} height={height} fill="url(#terrain-fade)" />
        
        {/* Frame border */}
        <rect
          x={1}
          y={1}
          width={width - 2}
          height={height - 2}
          fill="none"
          stroke={NERVColors.amber}
          strokeWidth={1}
        />
        
        {/* Corner markers */}
        <path d="M 1 15 L 1 1 L 15 1" fill="none" stroke={NERVColors.amber} strokeWidth={1.5} />
        <path d={`M ${width - 15} 1 L ${width - 1} 1 L ${width - 1} 15`} fill="none" stroke={NERVColors.amber} strokeWidth={1.5} />
        <path d={`M 1 ${height - 15} L 1 ${height - 1} L 15 ${height - 1}`} fill="none" stroke={NERVColors.amber} strokeWidth={1.5} />
        <path d={`M ${width - 15} ${height - 1} L ${width - 1} ${height - 1} L ${width - 1} ${height - 15}`} fill="none" stroke={NERVColors.amber} strokeWidth={1.5} />
      </svg>
      
      {/* Map info footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 8px',
        backgroundColor: NERVColors.panelDark,
        border: `1px solid ${NERVColors.borderMid}`,
        borderTop: 'none',
        fontSize: 9,
      }}>
        <span style={{ color: NERVColors.textDim }}>AREA: TOKYO-3</span>
        <span style={{ color: NERVColors.phosphorGreen }}>GRID: 47-K</span>
        <span style={{ color: NERVColors.textDim }}>SCALE: 1:50000</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RADAR SWEEP DISPLAY - Canvas-based rotating radar with sweep animation
// Evangelion NERV tactical display style
// ═══════════════════════════════════════════════════════════════════════════════

interface RadarSweepProps {
  size?: number;
  contacts?: Array<{
    angle: number;
    distance: number;
    type: 'friendly' | 'hostile' | 'unknown';
  }>;
}

const radarContactColors: Record<string, string> = {
  friendly: NERVColors.phosphorGreen,
  hostile: NERVColors.crimson,
  unknown: NERVColors.amber,
};

export function RadarSweep({ size = 200, contacts = [] }: RadarSweepProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animRef = React.useRef<number>(0);
  const sweepAngleRef = React.useRef<number>(0);
  // Track when each contact was last hit by the sweep (stores timestamp)
  const contactGlowRef = React.useRef<number[]>([]);

  // Parse a hex color string into [r, g, b]
  const hexToRgb = React.useCallback((hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 255, 0];
  }, []);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    const now = performance.now();

    // Advance sweep: one full rotation every 4 seconds
    sweepAngleRef.current = ((now % 4000) / 4000) * Math.PI * 2;
    const sweep = sweepAngleRef.current;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // --- Background circle ---
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = NERVColors.terminalBlack;
    ctx.fill();
    ctx.closePath();

    // Clip to radar circle for sweep rendering
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // --- Sweep cone (trailing 30-degree gradient arc) ---
    const trailAngle = (30 * Math.PI) / 180; // 30 degrees in radians
    const sweepSteps = 20;
    for (let i = 0; i < sweepSteps; i++) {
      const t = i / sweepSteps;
      const startA = sweep - trailAngle * (1 - t);
      const endA = sweep - trailAngle * (1 - (t + 1) / sweepSteps);
      const alpha = t * 0.35; // fade from 0 at tail to 0.35 at leading edge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startA, endA);
      ctx.closePath();
      const [r, g, b] = hexToRgb(NERVColors.phosphorGreen);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }

    // --- Sweep line (the bright leading edge) ---
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * radius, cy + Math.sin(sweep) * radius);
    ctx.strokeStyle = NERVColors.phosphorGreen;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = NERVColors.phosphorGreen;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore(); // un-clip

    // --- Range rings ---
    const ringScales = [0.25, 0.5, 0.75, 1.0];
    for (const scale of ringScales) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
      ctx.strokeStyle = NERVColors.phosphorGreen;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // --- Crosshairs ---
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.strokeStyle = NERVColors.phosphorGreen;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // --- Cardinal labels (N, S, E, W) ---
    ctx.font = `bold ${Math.max(9, size / 22)}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = NERVColors.textDim;
    ctx.globalAlpha = 0.6;
    const labelOffset = radius + 7;
    ctx.fillText('N', cx, cy - labelOffset);
    ctx.fillText('S', cx, cy + labelOffset);
    ctx.fillText('E', cx + labelOffset, cy);
    ctx.fillText('W', cx - labelOffset, cy);
    ctx.globalAlpha = 1;

    // --- Outer ring (amber accent) ---
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = NERVColors.amber;
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- Contacts ---
    // Ensure glow array matches contacts length
    if (contactGlowRef.current.length !== contacts.length) {
      contactGlowRef.current = new Array(contacts.length).fill(0);
    }

    contacts.forEach((contact, i) => {
      // Angle: 0 = North (top), clockwise. Convert to canvas radians.
      // Canvas: 0 = East (right), clockwise. So subtract 90 degrees.
      const angleRad = ((contact.angle - 90) * Math.PI) / 180;
      const dist = (contact.distance / 100) * radius;
      const x = cx + Math.cos(angleRad) * dist;
      const y = cy + Math.sin(angleRad) * dist;
      const color = radarContactColors[contact.type] || NERVColors.amber;
      const [r, g, b] = hexToRgb(color);

      // Check if sweep is passing over this contact (within ~5 degrees)
      // Normalize both angles to [0, 2pi)
      let contactCanvasAngle = angleRad;
      while (contactCanvasAngle < 0) contactCanvasAngle += Math.PI * 2;
      contactCanvasAngle = contactCanvasAngle % (Math.PI * 2);
      let sweepNorm = sweep % (Math.PI * 2);
      while (sweepNorm < 0) sweepNorm += Math.PI * 2;

      let diff = sweepNorm - contactCanvasAngle;
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;

      // If sweep just passed over (within 5 degrees ahead), mark as glowing
      if (diff >= 0 && diff < (5 * Math.PI) / 180) {
        contactGlowRef.current[i] = now;
      }

      // Glow fades over 2 seconds after sweep passes
      const timeSinceHit = now - contactGlowRef.current[i];
      const glowFactor = contactGlowRef.current[i] > 0
        ? Math.max(0, 1 - timeSinceHit / 2000)
        : 0.15;

      // Outer glow halo
      const haloAlpha = 0.1 + glowFactor * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 4 + glowFactor * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${haloAlpha})`;
      ctx.fill();

      // Core dot
      const coreAlpha = 0.3 + glowFactor * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${coreAlpha})`;
      if (glowFactor > 0.5) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // --- Center dot ---
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = NERVColors.phosphorGreen;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, [size, contacts, hexToRgb]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [size, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        display: 'block',
        margin: '0 auto',
        width: size,
        height: size,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE BOUNDARY DISPLAY - Angular polygon zone markers
// ═══════════════════════════════════════════════════════════════════════════════

interface ZoneBoundaryProps {
  width?: number;
  height?: number;
  zones: Array<{
    name: string;
    points: Array<{ x: number; y: number }>;
    status: 'safe' | 'caution' | 'danger';
  }>;
}

export function ZoneBoundary({ width = 300, height = 200, zones }: ZoneBoundaryProps) {
  const statusColors = {
    safe: NERVColors.phosphorGreen,
    caution: NERVColors.amber,
    danger: NERVColors.crimson,
  };
  
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <rect width={width} height={height} fill={NERVColors.terminalBlack} />
      
      {zones.map((zone, i) => {
        const pointsStr = zone.points.map(p => `${p.x},${p.y}`).join(' ');
        const color = statusColors[zone.status];
        
        return (
          <g key={i}>
            {/* Zone fill */}
            <polygon
              points={pointsStr}
              fill={color}
              opacity={0.1}
            />
            
            {/* Zone boundary */}
            <polygon
              points={pointsStr}
              fill="none"
              stroke={color}
              strokeWidth={1}
              strokeDasharray="8,4"
            />
            
            {/* Zone label */}
            <text
              x={zone.points[0].x}
              y={zone.points[0].y - 8}
              fill={color}
              fontSize={9}
              fontFamily="'Courier New', monospace"
              fontWeight="bold"
            >
              {zone.name}
            </text>
          </g>
        );
      })}
      
      {/* Frame */}
      <rect width={width} height={height} fill="none" stroke={NERVColors.borderMid} strokeWidth={1} />
    </svg>
  );
}

export default WireframeTerrain;
