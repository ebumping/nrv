import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ContourMap - NERV-style flow field / topographic visualization
 * 
 * Dense network of curved contour lines forming flow patterns.
 * Used for agent swarms, field dynamics, system topology.
 * 
 * Features:
 * - SVG path-based contour rendering
 * - Dual-color line system (data lines + reference grid)
 * - Corner data readouts
 * - Optional "breathing" animation on nodes
 * - Interactive hover states
 */

export interface ContourMapProps {
  /** Width */
  width?: string | number;
  
  /** Height */
  height?: number;
  
  /** Contour line color */
  contourColor?: 'cyan' | 'green' | 'orange' | 'magenta';
  
  /** Reference grid color */
  referenceColor?: 'red' | 'orange' | 'cyan';
  
  /** Number of contour lines */
  contourDensity?: 'sparse' | 'normal' | 'dense';
  
  /** Show reference grid (horizontal lines) */
  showReferenceGrid?: boolean;
  
  /** Reference grid line count */
  referenceLineCount?: number;
  
  /** Show axis scale on left */
  showAxisScale?: boolean;
  
  /** Y-axis range */
  yAxisRange?: [number, number];
  
  /** Corner readouts data */
  cornerReadouts?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
  
  /** Custom nodes to render (for agent swarms, etc.) */
  nodes?: ContourNode[];
  
  /** Node animation - breathing effect */
  nodeAnimation?: 'none' | 'pulse' | 'breathe';
  
  /** Show crosshair markers */
  showCrosshairs?: boolean;
  
  /** Crosshair type */
  crosshairType?: 'plus' | 'cross';
  
  /** Interactive mode - emit clicks */
  interactive?: boolean;
  
  /** Click handler for interactive mode */
  onNodeClick?: (node: ContourNode) => void;
  
  /** Background pattern */
  backgroundPattern?: 'none' | 'hex' | 'grid';
  
  /** Additional className */
  className?: string;
}

export interface ContourNode {
  id: string;
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
  size?: number;
  color?: string;
  label?: string;
  data?: Record<string, unknown>;
  pulse?: boolean;
}

interface ContourLine {
  points: string;
  opacity: number;
}

const colorMap = {
  cyan: '#00CCFF',
  green: '#00FF66',
  orange: '#FF6600',
  magenta: '#FF00CC',
  red: '#CC0000',
};

const densityConfig = {
  sparse: { lines: 12, opacity: 0.6 },
  normal: { lines: 20, opacity: 0.5 },
  dense: { lines: 35, opacity: 0.4 },
};

export function ContourMap({
  width = '100%',
  height = 300,
  contourColor = 'cyan',
  referenceColor = 'red',
  contourDensity = 'normal',
  showReferenceGrid = true,
  referenceLineCount = 5,
  showAxisScale = true,
  yAxisRange = [-100, 100],
  cornerReadouts,
  nodes = [],
  nodeAnimation = 'breathe',
  showCrosshairs = false,
  crosshairType = 'cross',
  interactive = false,
  onNodeClick,
  backgroundPattern = 'none',
  className,
}: ContourMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [contourLines, setContourLines] = useState<ContourLine[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  
  const primaryColor = colorMap[contourColor];
  const refColor = colorMap[referenceColor];
  const density = densityConfig[contourDensity];
  
  // Generate contour lines based on noise/flow field simulation
  const generateContours = useCallback(() => {
    const lines: ContourLine[] = [];
    
    // Simple Perlin-like noise approximation for flow field
    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.5 + t) * Math.cos(y * 0.3 + t * 0.7) +
             Math.sin(x * 0.2 - y * 0.4 + t * 0.3) * 0.5 +
             Math.cos(x * 0.7 + y * 0.2 - t * 0.5) * 0.3;
    };
    
    // Generate contour lines
    for (let i = 0; i < density.lines; i++) {
      const points: string[] = [];
      const yBase = (i / density.lines) * 100;
      const amplitude = 8 + Math.sin(i * 0.3) * 4;
      const frequency = 0.08 + Math.random() * 0.04;
      const phase = animationFrame * 0.01 + i * 0.5;
      
      // Create flowing path
      for (let x = 0; x <= 100; x += 2) {
        const y = yBase + noise(x * frequency, i, phase) * amplitude;
        points.push(`${x},${Math.max(0, Math.min(100, y))}`);
      }
      
      lines.push({
        points: points.join(' '),
        opacity: density.opacity + (i % 3 === 0 ? 0.2 : 0),
      });
    }
    
    // Add some crossing lines for field complexity
    for (let i = 0; i < density.lines / 2; i++) {
      const points: string[] = [];
      const xBase = (i / (density.lines / 2)) * 100;
      
      for (let y = 0; y <= 100; y += 3) {
        const x = xBase + Math.sin(y * 0.1 + animationFrame * 0.02) * 5;
        points.push(`${Math.max(0, Math.min(100, x))},${y}`);
      }
      
      lines.push({
        points: points.join(' '),
        opacity: density.opacity * 0.6,
      });
    }
    
    setContourLines(lines);
  }, [animationFrame, density]);
  
  // Animate contours
  useEffect(() => {
    generateContours();
    
    const interval = setInterval(() => {
      setAnimationFrame(f => f + 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, [generateContours]);
  
  // Render crosshair marker
  const renderCrosshair = (x: number, y: number, size: number = 10) => {
    const color = primaryColor;
    return (
      <g key={`crosshair-${x}-${y}`}>
        {crosshairType === 'cross' ? (
          <>
            <line x1={x - size} y1={y - size} x2={x + size} y2={y + size} stroke={color} strokeWidth={1} opacity={0.6} />
            <line x1={x + size} y1={y - size} x2={x - size} y2={y + size} stroke={color} strokeWidth={1} opacity={0.6} />
          </>
        ) : (
          <>
            <line x1={x - size} y1={y} x2={x + size} y2={y} stroke={color} strokeWidth={1} opacity={0.6} />
            <line x1={x} y1={y - size} x2={x} y2={y + size} stroke={color} strokeWidth={1} opacity={0.6} />
          </>
        )}
      </g>
    );
  };
  
  // Render reference grid
  const renderReferenceGrid = () => {
    if (!showReferenceGrid) return null;
    
    const lines = [];
    const spacing = 100 / (referenceLineCount + 1);
    
    for (let i = 1; i <= referenceLineCount; i++) {
      const y = i * spacing;
      lines.push(
        <line
          key={`ref-${i}`}
          x1="40"
          y1={`${y}%`}
          x2="100%"
          y2={`${y}%`}
          stroke={refColor}
          strokeWidth={1}
          opacity={0.4}
        />
      );
    }
    
    return <g>{lines}</g>;
  };
  
  // Render axis scale
  const renderAxisScale = () => {
    if (!showAxisScale) return null;
    
    const labels = [];
    const steps = 5;
    
    for (let i = 0; i <= steps; i++) {
      const y = 20 + (i / steps) * 80; // Leave margin for corner readouts
      const value = yAxisRange[1] - (i / steps) * (yAxisRange[1] - yAxisRange[0]);
      
      labels.push(
        <g key={`axis-${i}`}>
          <text
            x="8"
            y={y}
            fill={colorMap.orange}
            fontSize="9"
            fontFamily="var(--nerv-font-mono, monospace)"
          >
            {value.toFixed(0)}
          </text>
          <line
            x1="30"
            y1={y - 3}
            x2="38"
            y2={y - 3}
            stroke={colorMap.orange}
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.5}
          />
        </g>
      );
    }
    
    return <g>{labels}</g>;
  };
  
  // Render corner readouts
  const renderCornerReadouts = () => {
    if (!cornerReadouts) return null;
    
    const positions = {
      topLeft: { x: 50, y: 16, anchor: 'start' as const },
      topRight: { x: '95%' as const, y: 16, anchor: 'end' as const },
      bottomLeft: { x: 50, y: '97%' as const, anchor: 'start' as const },
      bottomRight: { x: '95%' as const, y: '97%' as const, anchor: 'end' as const },
    };
    
    return (
      <g>
        {Object.entries(cornerReadouts).map(([pos, value]) => {
          if (!value) return null;
          const p = positions[pos as keyof typeof positions];
          return (
            <text
              key={pos}
              x={p.x}
              y={p.y}
              textAnchor={p.anchor}
              fill={colorMap.green}
              fontSize="10"
              fontFamily="var(--nerv-font-mono, monospace)"
              fontWeight="bold"
            >
              {value}
            </text>
          );
        })}
      </g>
    );
  };
  
  // Render nodes
  const renderNodes = () => {
    if (nodes.length === 0) return null;
    
    return (
      <g className="contour-nodes">
        {nodes.map((node) => {
          const x = 40 + node.x * (100 - 40); // Account for axis margin
          const y = 10 + node.y * 80; // Account for corner readouts
          const size = node.size || 4;
          
          const animationStyle = nodeAnimation !== 'none' || node.pulse ? {
            animation: node.pulse 
              ? 'nerv-pulse 0.8s infinite' 
              : nodeAnimation === 'breathe' 
                ? 'nerv-pulse 2s infinite ease-in-out'
                : undefined,
          } : {};
          
          return (
            <g
              key={node.id}
              onClick={interactive && onNodeClick ? () => onNodeClick(node) : undefined}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
            >
              {/* Node glow */}
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r={size + 4}
                fill={node.color || primaryColor}
                opacity={0.2}
                style={animationStyle}
              />
              {/* Node core */}
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r={size}
                fill={node.color || primaryColor}
                style={animationStyle}
              />
              {/* Node label */}
              {node.label && (
                <text
                  x={`${x}%`}
                  y={`${y - size - 6}%`}
                  textAnchor="middle"
                  fill={colorMap.orange}
                  fontSize="8"
                  fontFamily="var(--nerv-font-mono, monospace)"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };
  
  // Render background pattern
  const renderBackgroundPattern = () => {
    if (backgroundPattern === 'none') return null;
    
    if (backgroundPattern === 'hex') {
      return (
        <defs>
          <pattern id="hex-pattern" width="20" height="17.32" patternUnits="userSpaceOnUse">
            <polygon
              points="10,0 20,5.77 20,11.55 10,17.32 0,11.55 0,5.77"
              fill="none"
              stroke={primaryColor}
              strokeWidth={0.5}
              opacity={0.1}
            />
          </pattern>
        </defs>
      );
    }
    
    if (backgroundPattern === 'grid') {
      return (
        <defs>
          <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={primaryColor}
              strokeWidth={0.3}
              opacity={0.15}
            />
          </pattern>
        </defs>
      );
    }
    
    return null;
  };
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    backgroundColor: 'var(--nerv-bg, #000)',
    overflow: 'hidden',
  };
  
  return (
    <div style={containerStyle} className={className}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* Background pattern */}
        {renderBackgroundPattern()}
        {backgroundPattern !== 'none' && (
          <rect width="100" height="100" fill={`url(#${backgroundPattern}-pattern)`} />
        )}
        
        {/* Reference grid */}
        {renderReferenceGrid()}
        
        {/* Contour lines */}
        {contourLines.map((line, i) => (
          <polyline
            key={i}
            points={line.points}
            fill="none"
            stroke={primaryColor}
            strokeWidth={0.5}
            opacity={line.opacity}
          />
        ))}
        
        {/* Axis scale */}
        {renderAxisScale()}
        
        {/* Crosshair markers */}
        {showCrosshairs && (
          <>
            {renderCrosshair(25, 25)}
            {renderCrosshair(75, 25)}
            {renderCrosshair(25, 75)}
            {renderCrosshair(75, 75)}
          </>
        )}
        
        {/* Nodes */}
        {renderNodes()}
        
        {/* Corner readouts */}
        {renderCornerReadouts()}
      </svg>
    </div>
  );
}

export default ContourMap;
