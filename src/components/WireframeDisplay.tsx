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
// RADAR SWEEP DISPLAY - Rotating radar with sweep animation
// ═══════════════════════════════════════════════════════════════════════════════

interface RadarSweepProps {
  size?: number;
  contacts?: Array<{
    angle: number;
    distance: number;
    type: 'friendly' | 'hostile' | 'unknown';
  }>;
}

export function RadarSweep({ size = 200, contacts = [] }: RadarSweepProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  
  const contactColors = {
    friendly: NERVColors.phosphorGreen,
    hostile: NERVColors.crimson,
    unknown: NERVColors.amber,
  };
  
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        {/* Sweep gradient */}
        <linearGradient id="sweep-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={size} y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="70%" stopColor={NERVColors.phosphorGreen} stopOpacity="0.3" />
          <stop offset="100%" stopColor={NERVColors.phosphorGreen} stopOpacity="0.6" />
        </linearGradient>
        
        {/* Sweep animation */}
        <style>{`
          @keyframes radar-sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .radar-sweep-group {
            transform-origin: ${centerX}px ${centerY}px;
            animation: radar-sweep 4s linear infinite;
          }
        `}</style>
      </defs>
      
      {/* Background */}
      <circle cx={centerX} cy={centerY} r={radius} fill={NERVColors.terminalBlack} />
      
      {/* Range rings */}
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius * scale}
          fill="none"
          stroke={NERVColors.phosphorGreen}
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
      
      {/* Crosshairs */}
      <line x1={centerX - radius} y1={centerY} x2={centerX + radius} y2={centerY} 
            stroke={NERVColors.phosphorGreen} strokeWidth={0.5} opacity={0.3} />
      <line x1={centerX} y1={centerY - radius} x2={centerX} y2={centerY + radius} 
            stroke={NERVColors.phosphorGreen} strokeWidth={0.5} opacity={0.3} />
      
      {/* Sweeping beam */}
      <g className="radar-sweep-group">
        <path
          d={`M ${centerX} ${centerY} L ${centerX + radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius * 0.5} ${centerY - radius * 0.866} Z`}
          fill="url(#sweep-gradient)"
        />
      </g>
      
      {/* Contacts */}
      {contacts.map((contact, i) => {
        const angleRad = (contact.angle - 90) * (Math.PI / 180);
        const distance = contact.distance * radius;
        const x = centerX + Math.cos(angleRad) * distance;
        const y = centerY + Math.sin(angleRad) * distance;
        const color = contactColors[contact.type];
        
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill={color} opacity={0.5} />
            <circle cx={x} cy={y} r={2} fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
          </g>
        );
      })}
      
      {/* Outer ring */}
      <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke={NERVColors.amber} strokeWidth={1} />
    </svg>
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
