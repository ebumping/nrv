import React, { useMemo } from 'react';

/**
 * HexagonalCluster - NERV-style hexagonal grid for taxonomy/cluster visualization
 * 
 * Hexagonal grid layout with clustering support.
 * Used for skill graphs, agent taxonomies, hierarchical groupings.
 * 
 * Features:
 * - Flat-top hexagon geometry (Eva-authentic)
 * - Cluster grouping with borders
 * - Hover/selection states
 * - Label support
 */

export interface HexagonalClusterProps {
  /** Width */
  width?: string | number;
  
  /** Height */
  height?: number;
  
  /** Hex size in pixels */
  hexSize?: number;
  
  /** Hex border color */
  borderColor?: 'orange' | 'cyan' | 'green' | 'magenta';
  
  /** Hex data */
  hexes?: HexData[];
  
  /** Clusters (groups of hex IDs) */
  clusters?: HexCluster[];
  
  /** Show hex labels */
  showLabels?: boolean;
  
  /** Label position */
  labelPosition?: 'center' | 'below';
  
  /** Interactive mode */
  interactive?: boolean;
  
  /** Click handler */
  onHexClick?: (hex: HexData) => void;
  
  /** Hover handler */
  onHexHover?: (hex: HexData | null) => void;
  
  /** Center point for radial layout (optional) */
  centerPoint?: { x: number; y: number };
  
  /** Layout mode */
  layout?: 'grid' | 'radial' | 'cluster';
  
  /** Additional className */
  className?: string;
}

export interface HexData {
  id: string;
  q: number;  // Axial coordinate
  r: number;  // Axial coordinate
  label?: string;
  color?: string;
  status?: 'active' | 'inactive' | 'warning' | 'critical';
  data?: Record<string, unknown>;
}

export interface HexCluster {
  id: string;
  hexIds: string[];
  label?: string;
  color?: string;
}

const colorMap = {
  orange: '#FF6600',
  cyan: '#00CCFF',
  green: '#00FF66',
  magenta: '#FF00CC',
};

const statusColors = {
  active: '#00FF66',
  inactive: '#666666',
  warning: '#FFAA00',
  critical: '#CC0000',
};

// Hex geometry utilities
function hexCorner(cx: number, cy: number, size: number, i: number): { x: number; y: number } {
  const angleDeg = 60 * i - 30; // Flat-top hexagon
  const angleRad = (Math.PI / 180) * angleDeg;
  return {
    x: cx + size * Math.cos(angleRad),
    y: cy + size * Math.sin(angleRad),
  };
}

function hexPoints(cx: number, cy: number, size: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const corner = hexCorner(cx, cy, size, i);
    points.push(`${corner.x},${corner.y}`);
  }
  return points.join(' ');
}

// Axial to pixel (flat-top)
function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
}

export function HexagonalCluster({
  width = '100%',
  height = 300,
  hexSize = 20,
  borderColor = 'cyan',
  hexes = [],
  clusters = [],
  showLabels = true,
  labelPosition = 'center',
  interactive = false,
  onHexClick,
  onHexHover,
  centerPoint,
  layout = 'grid',
  className,
}: HexagonalClusterProps) {
  const primaryColor = colorMap[borderColor];
  
  // Calculate viewBox based on hex positions
  const { viewBox, hexPositions } = useMemo(() => {
    const positions: Map<string, { x: number; y: number; hex: HexData }> = new Map();
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    hexes.forEach(hex => {
      let pos: { x: number; y: number };
      
      if (layout === 'radial' && centerPoint) {
        // Radial layout from center
        pos = {
          x: centerPoint.x + hex.q * hexSize * 1.5,
          y: centerPoint.y + hex.r * hexSize * Math.sqrt(3),
        };
      } else {
        // Grid layout (axial coordinates)
        pos = axialToPixel(hex.q, hex.r, hexSize);
      }
      
      // Offset for centering
      const offsetX = 50; // Margin
      const offsetY = 50;
      
      positions.set(hex.id, { 
        x: pos.x + offsetX, 
        y: pos.y + offsetY, 
        hex 
      });
      
      minX = Math.min(minX, pos.x + offsetX - hexSize);
      maxX = Math.max(maxX, pos.x + offsetX + hexSize);
      minY = Math.min(minY, pos.y + offsetY - hexSize);
      maxY = Math.max(maxY, pos.y + offsetY + hexSize);
    });
    
    const padding = 20;
    return {
      viewBox: {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      },
      hexPositions: positions,
    };
  }, [hexes, hexSize, layout, centerPoint]);
  
  // Find cluster for a hex
  const getClusterForHex = (hexId: string): HexCluster | undefined => {
    return clusters.find(c => c.hexIds.includes(hexId));
  };
  
  // Render cluster borders
  const renderClusterBorders = () => {
    if (clusters.length === 0) return null;
    
    return clusters.map(cluster => {
      const clusterHexes = cluster.hexIds
        .map(id => hexPositions.get(id))
        .filter(Boolean);
      
      if (clusterHexes.length === 0) return null;
      
      // Calculate bounding box for cluster
      const xs = clusterHexes.map(h => h!.x);
      const ys = clusterHexes.map(h => h!.y);
      const minX = Math.min(...xs) - hexSize - 5;
      const maxX = Math.max(...xs) + hexSize + 5;
      const minY = Math.min(...ys) - hexSize - 5;
      const maxY = Math.max(...ys) + hexSize + 5;
      
      // Create chamfered rectangle
      const chamfer = 8;
      const path = `
        M ${minX + chamfer} ${minY}
        L ${maxX - chamfer} ${minY}
        L ${maxX} ${minY + chamfer}
        L ${maxX} ${maxY - chamfer}
        L ${maxX - chamfer} ${maxY}
        L ${minX + chamfer} ${maxY}
        L ${minX} ${maxY - chamfer}
        L ${minX} ${minY + chamfer}
        Z
      `;
      
      return (
        <g key={cluster.id}>
          <path
            d={path}
            fill="none"
            stroke={cluster.color || primaryColor}
            strokeWidth={1.5}
            strokeDasharray="4,4"
            opacity={0.5}
          />
          {cluster.label && (
            <text
              x={(minX + maxX) / 2}
              y={minY - 8}
              textAnchor="middle"
              fill={cluster.color || primaryColor}
              fontSize="9"
              fontFamily="var(--nerv-font-mono, monospace)"
              fontWeight="bold"
            >
              {cluster.label}
            </text>
          )}
        </g>
      );
    });
  };
  
  // Render individual hexes
  const renderHexes = () => {
    return Array.from(hexPositions.entries()).map(([id, pos]) => {
      const { x, y, hex } = pos;
      const cluster = getClusterForHex(id);
      const fillColor = hex.color || statusColors[hex.status || 'active'] || primaryColor;
      
      return (
        <g
          key={id}
          onClick={interactive && onHexClick ? () => onHexClick(hex) : undefined}
          onMouseEnter={onHexHover ? () => onHexHover(hex) : undefined}
          onMouseLeave={onHexHover ? () => onHexHover(null) : undefined}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          {/* Hex glow for active/warning/critical */}
          {hex.status && hex.status !== 'inactive' && (
            <polygon
              points={hexPoints(x, y, hexSize + 2)}
              fill={fillColor}
              opacity={0.2}
            />
          )}
          
          {/* Hex body */}
          <polygon
            points={hexPoints(x, y, hexSize)}
            fill="transparent"
            stroke={cluster?.color || fillColor}
            strokeWidth={1}
            opacity={hex.status === 'inactive' ? 0.4 : 0.8}
            style={{
              transition: 'all 0.2s ease',
            }}
          />
          
          {/* Center dot for active nodes */}
          {hex.status === 'active' && (
            <circle
              cx={x}
              cy={y}
              r={2}
              fill={fillColor}
            />
          )}
          
          {/* Label */}
          {showLabels && hex.label && (
            <text
              x={x}
              y={labelPosition === 'below' ? y + hexSize + 10 : y + 3}
              textAnchor="middle"
              fill={colorMap.orange}
              fontSize="6"
              fontFamily="var(--nerv-font-mono, monospace)"
            >
              {hex.label.length > 8 ? hex.label.slice(0, 7) + '…' : hex.label}
            </text>
          )}
        </g>
      );
    });
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
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Cluster borders */}
        {renderClusterBorders()}
        
        {/* Hexes */}
        {renderHexes()}
      </svg>
    </div>
  );
}

// Utility to generate grid of hexes
export function generateHexGrid(cols: number, rows: number): HexData[] {
  const hexes: HexData[] = [];
  let id = 0;
  
  for (let r = 0; r < rows; r++) {
    const rOffset = Math.floor(r / 2);
    for (let q = -rOffset; q < cols - rOffset; q++) {
      hexes.push({
        id: `hex-${id}`,
        q,
        r,
      });
      id++;
    }
  }
  
  return hexes;
}

// Utility to create radial hex layout
export function generateHexRadial(radius: number): HexData[] {
  const hexes: HexData[] = [{ id: 'hex-center', q: 0, r: 0 }];
  let id = 1;
  
  for (let ring = 1; ring <= radius; ring++) {
    let q = ring;
    let r = 0;
    
    for (let side = 0; side < 6; side++) {
      for (let i = 0; i < ring; i++) {
        hexes.push({ id: `hex-${id}`, q, r });
        id++;
        
        // Move to next position along ring
        q += [
          [0, -1],
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 0],
          [1, -1],
        ][side][0];
        r += [
          [0, -1],
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 0],
          [1, -1],
        ][side][1];
      }
    }
  }
  
  return hexes;
}

export default HexagonalCluster;
