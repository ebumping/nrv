import React from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// HEXAGONAL TARGETING DISPLAY - THE signature Eva visual
// Flat-top hexagons with reticle, distance markers, angular geometry
// ═══════════════════════════════════════════════════════════════════════════════

interface HexagonalTargetProps {
  targetId?: string;
  distance?: number;
  bearing?: number;
  status?: 'tracking' | 'locked' | 'lost' | 'standby';
  size?: number;
}

export function HexagonalTarget({
  targetId = 'ANGEL-04',
  distance = 2847,
  bearing = 47,
  status = 'tracking',
  size = 200,
}: HexagonalTargetProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Flat-top hexagon points (pointy sides, flat top/bottom)
  const hexRadius = size * 0.4;
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * (Math.PI / 180); // Start at -30° for flat-top
    return `${centerX + hexRadius * Math.cos(angle)},${centerY + hexRadius * Math.sin(angle)}`;
  }).join(' ');
  
  // Inner hexagon (rotating reticle)
  const innerHexRadius = hexRadius * 0.7;
  const innerHexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30 + 15) * (Math.PI / 180); // Rotated 15°
    return `${centerX + innerHexRadius * Math.cos(angle)},${centerY + innerHexRadius * Math.sin(angle)}`;
  }).join(' ');
  
  // Targeting brackets positions
  const bracketSize = 15;
  const bracketOffset = hexRadius * 0.85;
  
  // Status colors
  const statusColors = {
    tracking: NERVColors.phosphorGreen,
    locked: NERVColors.amber,
    lost: NERVColors.crimson,
    standby: NERVColors.borderMid,
  };
  
  const statusText = {
    tracking: { en: 'TRACKING', ja: '追跡中' },
    locked: { en: 'LOCKED', ja: '捕捉' },
    lost: { en: 'LOST', ja: '喪失' },
    standby: { en: 'STANDBY', ja: '待機' },
  };
  
  const color = statusColors[status];
  const texts = statusText[status];
  
  // Rotating animation for tracking state
  const rotationStyle = status === 'tracking' ? {
    animation: 'rotate-slow 8s linear infinite',
  } : {};
  
  return (
    <div style={{ fontFamily: "'Courier New', monospace", textAlign: 'center' }}>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        <defs>
          <filter id={`glow-${targetId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Rotating reticle animation */}
          <style>{`
            @keyframes rotate-slow {
              from { transform: rotate(0deg); transform-origin: ${centerX}px ${centerY}px; }
              to { transform: rotate(360deg); transform-origin: ${centerX}px ${centerY}px; }
            }
          `}</style>
        </defs>
        
        {/* Outer decorative ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={hexRadius * 1.15}
          fill="none"
          stroke={NERVColors.borderMid}
          strokeWidth={0.5}
        />
        
        {/* Main hexagon outline */}
        <polygon
          points={hexPoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          filter={`url(#glow-${targetId})`}
        />
        
        {/* Inner rotating reticle */}
        <g style={rotationStyle}>
          <polygon
            points={innerHexPoints}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="8,4"
            opacity={0.7}
          />
        </g>
        
        {/* Center crosshair */}
        <line x1={centerX - 10} y1={centerY} x2={centerX + 10} y2={centerY} stroke={color} strokeWidth={1} />
        <line x1={centerX} y1={centerY - 10} x2={centerX} y2={centerY + 10} stroke={color} strokeWidth={1} />
        <circle cx={centerX} cy={centerY} r={3} fill={color} opacity={0.5} />
        
        {/* Targeting brackets (corner L-shapes) */}
        {/* Top-left */}
        <path d={`M ${centerX - bracketOffset} ${centerY - bracketOffset + bracketSize} L ${centerX - bracketOffset} ${centerY - bracketOffset} L ${centerX - bracketOffset + bracketSize} ${centerY - bracketOffset}`} 
              fill="none" stroke={color} strokeWidth={1.5} />
        {/* Top-right */}
        <path d={`M ${centerX + bracketOffset - bracketSize} ${centerY - bracketOffset} L ${centerX + bracketOffset} ${centerY - bracketOffset} L ${centerX + bracketOffset} ${centerY - bracketOffset + bracketSize}`} 
              fill="none" stroke={color} strokeWidth={1.5} />
        {/* Bottom-left */}
        <path d={`M ${centerX - bracketOffset} ${centerY + bracketOffset - bracketSize} L ${centerX - bracketOffset} ${centerY + bracketOffset} L ${centerX - bracketOffset + bracketSize} ${centerY + bracketOffset}`} 
              fill="none" stroke={color} strokeWidth={1.5} />
        {/* Bottom-right */}
        <path d={`M ${centerX + bracketOffset - bracketSize} ${centerY + bracketOffset} L ${centerX + bracketOffset} ${centerY + bracketOffset} L ${centerX + bracketOffset} ${centerY + bracketOffset - bracketSize}`} 
              fill="none" stroke={color} strokeWidth={1.5} />
        
        {/* Distance markers on hexagon vertices */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 60 - 30) * (Math.PI / 180);
          const x = centerX + (hexRadius * 1.25) * Math.cos(angle);
          const y = centerY + (hexRadius * 1.25) * Math.sin(angle);
          const tickValue = Math.round((i + 1) * (distance / 6));
          return (
            <g key={i}>
              <line
                x1={centerX + hexRadius * Math.cos(angle)}
                y1={centerY + hexRadius * Math.sin(angle)}
                x2={centerX + (hexRadius * 1.08) * Math.cos(angle)}
                y2={centerY + (hexRadius * 1.08) * Math.sin(angle)}
                stroke={color}
                strokeWidth={1}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Target info below display */}
      <div style={{ marginTop: 8 }}>
        <div style={{ color: NERVColors.amber, fontSize: 14, fontWeight: 'bold', letterSpacing: 2 }}>
          {targetId}
        </div>
        <div style={{ color: NERVColors.textDim, fontSize: 10, marginTop: 4 }}>
          DIST: <span style={{ color: NERVColors.phosphorGreen, textShadow: `0 0 4px ${NERVColors.phosphorGreen}` }}>{distance.toLocaleString()}m</span>
          {'  '}
          BRG: <span style={{ color: NERVColors.phosphorCyan, textShadow: `0 0 4px ${NERVColors.phosphorCyan}` }}>{bearing}°</span>
        </div>
        <div style={{ 
          color, 
          fontSize: 11, 
          fontWeight: 'bold', 
          marginTop: 4,
          textShadow: `0 0 4px ${color}`,
        }}>
          {texts.en} / {texts.ja}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEXAGONAL CLUSTER - Multiple hexagons in honeycomb arrangement
// Used for skill matrices, status grids, target arrays
// ═══════════════════════════════════════════════════════════════════════════════

interface HexCell {
  id: string;
  label: string;
  labelJa?: string;
  value?: string | number;
  status: 'active' | 'inactive' | 'warning' | 'danger';
}

interface HexagonalClusterProps {
  cells: HexCell[];
  cellSize?: number;
  columns?: number;
}

export function HexagonalCluster({ cells, cellSize = 60, columns = 4 }: HexagonalClusterProps) {
  // Flat-top hexagon dimensions
  const hexWidth = cellSize * 2;
  const hexHeight = cellSize * Math.sqrt(3);
  const horizontalSpacing = cellSize * 1.5;
  const verticalSpacing = hexHeight;
  
  const statusColors = {
    active: NERVColors.phosphorGreen,
    inactive: NERVColors.borderMid,
    warning: NERVColors.amber,
    danger: NERVColors.crimson,
  };
  
  const generateFlatTopHexPath = (cx: number, cy: number, r: number): string => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 30) * (Math.PI / 180);
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  };
  
  const svgWidth = (columns + 0.5) * horizontalSpacing + 20;
  const rows = Math.ceil(cells.length / columns);
  const svgHeight = rows * verticalSpacing + 40;
  
  return (
    <svg width={svgWidth} height={svgHeight} style={{ fontFamily: "'Courier New', monospace" }}>
      <defs>
        <filter id="hex-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {cells.map((cell, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        // Offset every other row
        const offsetX = row % 2 === 1 ? horizontalSpacing / 2 : 0;
        const cx = col * horizontalSpacing + horizontalSpacing + offsetX;
        const cy = row * verticalSpacing + verticalSpacing / 2 + 10;
        
        const color = statusColors[cell.status];
        
        return (
          <g key={cell.id}>
            {/* Hexagon outline */}
            <polygon
              points={generateFlatTopHexPath(cx, cy, cellSize * 0.9)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              filter={cell.status === 'active' ? 'url(#hex-glow)' : undefined}
            />
            
            {/* Inner fill for active */}
            {cell.status === 'active' && (
              <polygon
                points={generateFlatTopHexPath(cx, cy, cellSize * 0.7)}
                fill={color}
                opacity={0.1}
              />
            )}
            
            {/* Label */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fill={NERVColors.amber}
              fontSize={8}
              fontWeight="bold"
            >
              {cell.label}
            </text>
            
            {/* Japanese label */}
            {cell.labelJa && (
              <text
                x={cx}
                y={cy + 2}
                textAnchor="middle"
                fill={NERVColors.textDim}
                fontSize={7}
              >
                {cell.labelJa}
              </text>
            )}
            
            {/* Value */}
            {cell.value !== undefined && (
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fill={color}
                fontSize={10}
                fontWeight="bold"
                style={{ textShadow: `0 0 4px ${color}` }}
              >
                {cell.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN BLUE INDICATOR - Angel detection display
// ═══════════════════════════════════════════════════════════════════════════════

interface PatternIndicatorProps {
  pattern: 'BLUE' | 'ORANGE' | 'NONE';
  detected?: boolean;
}

export function PatternIndicator({ pattern, detected = true }: PatternIndicatorProps) {
  const patternData = {
    BLUE: { color: NERVColors.phosphorCyan, en: 'PATTERN: BLUE', ja: 'パターン青' },
    ORANGE: { color: NERVColors.amber, en: 'PATTERN: ORANGE', ja: 'パターン橙' },
    NONE: { color: NERVColors.textDim, en: 'PATTERN: NONE', ja: 'パターン無' },
  };
  
  const data = patternData[pattern];
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      backgroundColor: NERVColors.terminalBlack,
      border: `1px solid ${data.color}`,
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Pulsing indicator */}
      <div style={{
        width: 12,
        height: 12,
        backgroundColor: detected ? data.color : 'transparent',
        border: `2px solid ${data.color}`,
        animation: detected ? 'pulse 1s infinite' : 'none',
        boxShadow: detected ? `0 0 8px ${data.color}` : 'none',
      }} />
      
      <div>
        <div style={{
          color: data.color,
          fontSize: 12,
          fontWeight: 'bold',
          letterSpacing: 2,
          textShadow: `0 0 4px ${data.color}`,
        }}>
          {data.en}
        </div>
        <div style={{
          color: data.color,
          fontSize: 10,
          opacity: 0.7,
        }}>
          {data.ja}
        </div>
      </div>
      
      {detected && (
        <div style={{
          color: NERVColors.crimson,
          fontSize: 10,
          fontWeight: 'bold',
          animation: 'blink 0.5s infinite',
        }}>
          ▲ ANGEL DETECTED ▲
        </div>
      )}
    </div>
  );
}

export default HexagonalTarget;
