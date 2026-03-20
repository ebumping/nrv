import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// HEXAGONAL SKILL MATRIX - Honeycomb visualization for 280-skill taxonomy
// Flat-top hexagons in authentic NERV style with breathing animations
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillNode {
  id: string;
  name: string;
  nameJa?: string;
  layer: number;          // 0-5, from Infra to Strategy
  category: string;
  status: 'active' | 'inactive' | 'warning' | 'danger' | 'loading';
  confidence?: number;    // 0-100
  dependencies?: string[];
  description?: string;
  filePath?: string;
  details?: {
    overview: string;           // 2-3 sentence extended overview
    capabilities: string[];     // what this skill enables
    usage: string;              // when/how to invoke
    integration?: string;       // how it connects to other skills
    notes?: string;             // warnings, caveats, edge cases
  };
  reference?: {
    synopsis: string;           // one-line technical summary
    parameters?: string[];      // inputs, config options, flags
    outputs?: string[];         // what this skill produces/emits
    examples?: string[];        // example invocations or scenarios
    relatedSkills?: string[];   // IDs of related skills for cross-ref
  };
}

export interface HexagonalSkillMatrixProps {
  /** Skills to display */
  skills: SkillNode[];
  
  /** Size of each hexagon cell */
  cellSize?: number;
  
  /** Number of columns in the grid */
  columns?: number;
  
  /** Enable breathing animation */
  breathing?: boolean;
  
  /** Show layer labels */
  showLayerLabels?: boolean;
  
  /** Selected skill ID */
  selectedId?: string;
  
  /** On skill click */
  onSkillClick?: (skill: SkillNode) => void;

  /** On view skill file (eye icon click) */
  onViewSkill?: (skill: SkillNode) => void;

  /** Compact mode - smaller text */
  compact?: boolean;
  
  /** Additional className */
  className?: string;
}

// Layer colors matching Eva unit colors
const layerColors: Record<number, string> = {
  0: '#FFFFFF',  // Infrastructure - white
  1: NERVColors.phosphorCyan,  // Foundation - cyan
  2: NERVColors.phosphorGreen, // Core - green
  3: NERVColors.amber,         // Advanced - amber
  4: NERVColors.crimson,       // Expert - red
  5: NERVColors.evaPurple,     // Strategy - EVA-01 purple
};

const layerNames: Record<number, { en: string; ja: string }> = {
  0: { en: 'INFRA', ja: '基盤' },
  1: { en: 'FOUNDATION', ja: '基礎' },
  2: { en: 'CORE', ja: '核心' },
  3: { en: 'ADVANCED', ja: '上級' },
  4: { en: 'EXPERT', ja: '専門' },
  5: { en: 'STRATEGY', ja: '戦略' },
};

const statusColors = {
  active: NERVColors.phosphorGreen,
  inactive: NERVColors.borderMid,
  warning: NERVColors.amber,
  danger: NERVColors.crimson,
  loading: NERVColors.phosphorCyan,
};

// Generate flat-top hexagon path
function generateHexPath(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * (Math.PI / 180);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

// Calculate hexagon grid position
function getHexPosition(index: number, columns: number, cellSize: number): { x: number; y: number } {
  const col = index % columns;
  const row = Math.floor(index / columns);
  
  // Flat-top hexagon spacing
  const horizontalSpacing = cellSize * 1.5;
  const verticalSpacing = cellSize * Math.sqrt(3);
  
  // Offset every other row
  const offsetX = row % 2 === 1 ? horizontalSpacing / 2 : 0;
  
  return {
    x: col * horizontalSpacing + cellSize + offsetX,
    y: row * verticalSpacing + cellSize,
  };
}

export function HexagonalSkillMatrix({
  skills,
  cellSize = 40,
  columns = 8,
  breathing = true,
  showLayerLabels = true,
  selectedId,
  onSkillClick,
  onViewSkill,
  compact = false,
  className,
}: HexagonalSkillMatrixProps) {
  const [breathPhase, setBreathPhase] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dynamicLayout, setDynamicLayout] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive columns
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Auto-calculate columns from container width, or use fixed prop
  const effectiveColumns = dynamicLayout && containerWidth > 0
    ? Math.max(4, Math.floor((containerWidth - cellSize) / (cellSize * 1.5)))
    : columns;

  // Breathing animation
  useEffect(() => {
    if (!breathing) return;

    const interval = setInterval(() => {
      setBreathPhase(p => (p + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [breathing]);

  // Calculate SVG dimensions
  const rows = Math.ceil(skills.length / effectiveColumns);
  const svgWidth = (effectiveColumns + 0.5) * cellSize * 1.5 + cellSize;
  const svgHeight = rows * cellSize * Math.sqrt(3) + cellSize * 2;
  
  // Group skills by layer for stats
  const layerStats = useMemo(() => {
    const stats: Record<number, { total: number; active: number }> = {};
    skills.forEach(skill => {
      if (!stats[skill.layer]) stats[skill.layer] = { total: 0, active: 0 };
      stats[skill.layer].total++;
      if (skill.status === 'active') stats[skill.layer].active++;
    });
    return stats;
  }, [skills]);
  
  // Overall stats
  const overallStats = useMemo(() => {
    const active = skills.filter(s => s.status === 'active').length;
    const warning = skills.filter(s => s.status === 'warning').length;
    const danger = skills.filter(s => s.status === 'danger').length;
    const avgConfidence = skills
      .filter(s => s.confidence !== undefined)
      .reduce((sum, s) => sum + (s.confidence || 0), 0) / skills.length || 0;
    
    return { active, warning, danger, total: skills.length, avgConfidence };
  }, [skills]);
  
  const hoveredSkill = useMemo(() =>
    hoveredId ? skills.find(s => s.id === hoveredId) : null,
    [skills, hoveredId]
  );

  const fontSize = compact ? 6 : 8;
  const labelFontSize = compact ? 5 : 6;
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ fontFamily: "'Courier New', monospace", position: 'relative' }}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Stats Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 8px',
        borderBottom: `1px solid ${NERVColors.borderMid}`,
        marginBottom: 4,
        fontSize: 9,
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ color: NERVColors.textDim }}>
            NODES: <span style={{ color: NERVColors.phosphorGreen }}>{overallStats.total}</span>
          </span>
          <span style={{ color: NERVColors.textDim }}>
            ACTIVE: <span style={{ color: NERVColors.phosphorGreen }}>{overallStats.active}</span>
          </span>
          {overallStats.warning > 0 && (
            <span style={{ color: NERVColors.amber }}>
              WARN: {overallStats.warning}
            </span>
          )}
          {overallStats.danger > 0 && (
            <span style={{ color: NERVColors.crimson }}>
              DANGER: {overallStats.danger}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            onClick={() => setDynamicLayout(d => !d)}
            style={{
              color: dynamicLayout ? NERVColors.phosphorCyan : NERVColors.textDim,
              cursor: 'pointer',
              fontSize: 11,
              lineHeight: 1,
              textShadow: dynamicLayout ? `0 0 6px ${NERVColors.phosphorCyan}` : 'none',
            }}
            title={dynamicLayout ? 'Switch to fixed layout' : 'Switch to dynamic layout'}
          >
            動
          </span>
          <span style={{ color: NERVColors.textDim }}>
            CONF: <span style={{ color: NERVColors.phosphorCyan }}>{overallStats.avgConfidence.toFixed(1)}%</span>
          </span>
        </div>
      </div>
      
      {/* Main SVG Grid */}
      <svg 
        width="100%" 
        height={svgHeight} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block' }}
      >
        <defs>
          {/* Glow filter for active nodes */}
          <filter id="hex-skill-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Stronger glow for selected */}
          <filter id="hex-skill-selected" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Scanline pattern */}
          <pattern id="hex-scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* Layer group separators */}
        {showLayerLabels && Object.entries(layerStats).map(([layer, stats]) => {
          const layerNum = parseInt(layer);
          const layerStartIndex = skills.findIndex(s => s.layer === layerNum);
          if (layerStartIndex === -1) return null;
          
          const pos = getHexPosition(layerStartIndex, effectiveColumns, cellSize);
          
          return (
            <g key={`layer-${layer}`}>
              {/* Layer label on left */}
              <text
                x={8}
                y={pos.y + cellSize / 2}
                fill={layerColors[layerNum]}
                fontSize={7}
                fontWeight="bold"
                opacity={0.7}
              >
                L{layerNum}
              </text>
            </g>
          );
        })}
        
        {/* Skill hexagons */}
        {skills.map((skill, index) => {
          const pos = getHexPosition(index, effectiveColumns, cellSize);
          const isSelected = skill.id === selectedId;
          const isHovered = skill.id === hoveredId;
          const layerColor = layerColors[skill.layer] || NERVColors.textDim;
          const statusColor = statusColors[skill.status];
          
          // Breathing scale for active nodes
          const breathScale = breathing && skill.status === 'active'
            ? 0.95 + Math.sin(breathPhase * Math.PI / 180) * 0.05
            : 1;
          
          const hexRadius = cellSize * 0.85 * breathScale;
          
          return (
            <g 
              key={skill.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onSkillClick?.(skill)}
              onMouseEnter={() => setHoveredId(skill.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: onSkillClick ? 'pointer' : 'default' }}
            >
              {/* Outer hexagon - layer color */}
              <polygon
                points={generateHexPath(0, 0, hexRadius)}
                fill={isHovered ? layerColor : 'none'}
                fillOpacity={isHovered ? 0.15 : 0}
                stroke={isSelected ? '#FFFFFF' : isHovered ? '#FFFFFF' : layerColor}
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                filter={isSelected ? 'url(#hex-skill-selected)' : (skill.status === 'active' || isHovered) ? 'url(#hex-skill-glow)' : undefined}
                opacity={isSelected ? 1 : isHovered ? 1 : 0.7}
              />
              
              {/* Inner hexagon - layer color fill */}
              {(skill.status === 'active' || skill.status === 'warning' || skill.status === 'danger') && (
                <polygon
                  points={generateHexPath(0, 0, hexRadius * 0.7)}
                  fill={layerColor}
                  opacity={skill.status === 'active' ? 0.15 : skill.status === 'warning' ? 0.2 : 0.3}
                />
              )}
              
              {/* Center dot for loading */}
              {skill.status === 'loading' && (
                <circle
                  cx={0}
                  cy={0}
                  r={3}
                  fill={statusColor}
                  opacity={0.5 + Math.sin(breathPhase * Math.PI / 90) * 0.5}
                />
              )}
              
              {/* Confidence arc */}
              {skill.confidence !== undefined && skill.status === 'active' && (
                <circle
                  cx={0}
                  cy={0}
                  r={hexRadius * 0.9}
                  fill="none"
                  stroke={statusColor}
                  strokeWidth={2}
                  strokeDasharray={`${skill.confidence * 0.0565} 1000`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                  opacity={0.5}
                />
              )}
              
              {/* Skill name */}
              <text
                x={0}
                y={-2}
                textAnchor="middle"
                fill={isSelected ? NERVColors.white : statusColor}
                fontSize={fontSize}
                fontWeight="bold"
                style={{ textShadow: `0 0 4px ${statusColor}` }}
              >
                {skill.name.length > 6 ? skill.name.slice(0, 5) + '…' : skill.name}
              </text>
              
              {/* Japanese name (if space) */}
              {skill.nameJa && !compact && (
                <text
                  x={0}
                  y={6}
                  textAnchor="middle"
                  fill={NERVColors.textDim}
                  fontSize={labelFontSize}
                >
                  {skill.nameJa}
                </text>
              )}
              
              {/* Confidence value */}
              {skill.confidence !== undefined && !compact && (
                <text
                  x={0}
                  y={compact ? 6 : 14}
                  textAnchor="middle"
                  fill={statusColor}
                  fontSize={labelFontSize}
                  opacity={0.7}
                >
                  {skill.confidence}%
                </text>
              )}
              
              {/* Tooltip rendered as HTML overlay */}
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform={`translate(${svgWidth - 100}, ${svgHeight - 30})`}>
          <text fill={NERVColors.textDim} fontSize={7} textAnchor="end">
            LAYER: 0-5 | STATUS: {overallStats.active}/{overallStats.total}
          </text>
        </g>
      </svg>

      {/* Hover modal overlay */}
      {hoveredSkill && mousePos && (() => {
        const _statusColor = statusColors[hoveredSkill.status];
        const _layerColor = layerColors[hoveredSkill.layer] || NERVColors.textDim;
        const modalWidth = 280;
        const containerWidth = containerRef.current?.offsetWidth || 800;
        const modalLeft = mousePos.x + modalWidth + 20 > containerWidth
          ? mousePos.x - modalWidth - 10
          : mousePos.x + 16;
        const modalTop = Math.max(8, mousePos.y - 40);

        return (
          <div style={{
            position: 'absolute',
            left: modalLeft,
            top: modalTop,
            width: modalWidth,
            background: 'rgba(5, 5, 5, 0.96)',
            border: `1px solid ${_layerColor}`,
            borderLeft: `3px solid ${_layerColor}`,
            padding: '10px 12px',
            fontFamily: "'Courier New', monospace",
            zIndex: 100,
            pointerEvents: onViewSkill ? 'auto' : 'none',
            boxShadow: `0 0 15px ${_layerColor}44, inset 0 0 30px rgba(0,0,0,0.6)`,
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <span style={{ color: '#E0FFE0', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }}>
                  {hoveredSkill.name}
                </span>
                {hoveredSkill.nameJa && (
                  <span style={{ color: NERVColors.textDim, fontSize: 9, marginLeft: 6 }}>
                    {hoveredSkill.nameJa}
                  </span>
                )}
              </div>
              {onViewSkill && (
                <span
                  style={{
                    color: _layerColor,
                    fontSize: 18,
                    cursor: 'pointer',
                    textShadow: `0 0 8px ${_layerColor}`,
                    lineHeight: 1,
                  }}
                  onClick={(e) => { e.stopPropagation(); onViewSkill(hoveredSkill); }}
                  title="View full skill file"
                >
                  目
                </span>
              )}
            </div>

            {/* Layer / Category / Status */}
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 6,
              fontSize: 8,
              color: NERVColors.textDim,
              borderBottom: `1px solid ${NERVColors.borderMid}`,
              paddingBottom: 4,
            }}>
              <span style={{ color: _layerColor }}>
                L{hoveredSkill.layer} {layerNames[hoveredSkill.layer]?.en}
              </span>
              <span>|</span>
              <span>{hoveredSkill.category}</span>
              <span>|</span>
              <span style={{ color: _statusColor }}>
                {hoveredSkill.status.toUpperCase()}
              </span>
              {hoveredSkill.confidence !== undefined && (
                <>
                  <span>|</span>
                  <span style={{ color: NERVColors.phosphorCyan }}>
                    {hoveredSkill.confidence}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {hoveredSkill.description && (
              <div style={{
                color: '#AAAAAA',
                fontSize: 9,
                lineHeight: '14px',
                maxHeight: 56,
                overflow: 'hidden',
              }}>
                {hoveredSkill.description}
              </div>
            )}

            {/* File path */}
            {hoveredSkill.filePath && (
              <div style={{
                color: _layerColor,
                fontSize: 7,
                marginTop: 5,
                opacity: 0.6,
                letterSpacing: 0.5,
              }}>
                {'\u2192'} {hoveredSkill.filePath}
              </div>
            )}
          </div>
        );
      })()}

      {/* Layer summary bar */}
      {showLayerLabels && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 8px',
          borderTop: `1px solid ${NERVColors.borderMid}`,
          marginTop: 4,
          fontSize: 8,
        }}>
          {Object.entries(layerStats).map(([layer, stats]) => {
            const layerNum = parseInt(layer);
            const pct = stats.total > 0 ? (stats.active / stats.total * 100).toFixed(0) : 0;
            
            return (
              <div key={layer} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ 
                  color: layerColors[layerNum],
                  textShadow: `0 0 4px ${layerColors[layerNum]}`
                }}>
                  ■
                </span>
                <span style={{ color: NERVColors.textDim }}>
                  L{layerNum}: {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI HEXAGON GRID - Compact version for sidebar panels
// ═══════════════════════════════════════════════════════════════════════════════

export interface MiniHexGridProps {
  /** Number of cells */
  count: number;
  
  /** Active cells */
  activeIndices?: number[];
  
  /** Warning cells */
  warningIndices?: number[];
  
  /** Danger cells */
  dangerIndices?: number[];
  
  /** Cell size */
  cellSize?: number;
  
  /** Columns */
  columns?: number;
}

export function MiniHexGrid({
  count,
  activeIndices = [],
  warningIndices = [],
  dangerIndices = [],
  cellSize = 16,
  columns = 6,
}: MiniHexGridProps) {
  const rows = Math.ceil(count / columns);
  const width = columns * cellSize * 1.5 + cellSize;
  const height = rows * cellSize * Math.sqrt(3) + cellSize;
  
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {Array.from({ length: count }, (_, index) => {
        const pos = getHexPosition(index, columns, cellSize);
        const isActive = activeIndices.includes(index);
        const isWarning = warningIndices.includes(index);
        const isDanger = dangerIndices.includes(index);
        
        let color = NERVColors.borderMid;
        let opacity = 0.4;
        
        if (isDanger) {
          color = NERVColors.crimson;
          opacity = 1;
        } else if (isWarning) {
          color = NERVColors.amber;
          opacity = 1;
        } else if (isActive) {
          color = NERVColors.phosphorGreen;
          opacity = 1;
        }
        
        return (
          <polygon
            key={index}
            points={generateHexPath(pos.x, pos.y, cellSize * 0.8)}
            fill={isActive || isWarning || isDanger ? color : 'none'}
            fillOpacity={isActive || isWarning || isDanger ? 0.2 : 0}
            stroke={color}
            strokeWidth={1}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEXAGON PROGRESS RING - Circular hexagon progress indicator
// ═══════════════════════════════════════════════════════════════════════════════

export interface HexProgressRingProps {
  /** Progress 0-100 */
  progress: number;
  
  /** Size */
  size?: number;
  
  /** Label */
  label?: string;
  
  /** Japanese label */
  labelJa?: string;
  
  /** Status */
  status?: 'normal' | 'warning' | 'danger';
}

export function HexProgressRing({
  progress,
  size = 80,
  label,
  labelJa,
  status = 'normal',
}: HexProgressRingProps) {
  const center = size / 2;
  const hexRadius = size * 0.4;
  
  const statusColor = status === 'danger' 
    ? NERVColors.crimson 
    : status === 'warning' 
      ? NERVColors.amber 
      : NERVColors.phosphorGreen;
  
  // Calculate hexagon arc length
  const circumference = 6 * hexRadius; // Approximate
  
  return (
    <div style={{ textAlign: 'center', fontFamily: "'Courier New', monospace" }}>
      <svg width={size} height={size}>
        <defs>
          <filter id={`hex-ring-glow-${progress}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background hexagon */}
        <polygon
          points={generateHexPath(center, center, hexRadius)}
          fill="none"
          stroke={NERVColors.borderMid}
          strokeWidth={2}
        />
        
        {/* Inner hexagon */}
        <polygon
          points={generateHexPath(center, center, hexRadius * 0.7)}
          fill={statusColor}
          fillOpacity={0.1}
          stroke={statusColor}
          strokeWidth={1}
          strokeDasharray="4,2"
        />
        
        {/* Progress hexagon (dashed) */}
        <polygon
          points={generateHexPath(center, center, hexRadius)}
          fill="none"
          stroke={statusColor}
          strokeWidth={2}
          strokeDasharray={`${progress / 100 * 6} ${6 - progress / 100 * 6}`}
          strokeLinecap="round"
          filter={`url(#hex-ring-glow-${progress})`}
        />
        
        {/* Center value */}
        <text
          x={center}
          y={center + 6}
          textAnchor="middle"
          fill={statusColor}
          fontSize={16}
          fontWeight="bold"
          style={{ textShadow: `0 0 8px ${statusColor}` }}
        >
          {progress.toFixed(0)}
        </text>
      </svg>
      
      {label && (
        <div style={{ marginTop: 4 }}>
          <div style={{ color: NERVColors.amber, fontSize: 9, letterSpacing: 1 }}>
            {label}
          </div>
          {labelJa && (
            <div style={{ color: NERVColors.textDim, fontSize: 8 }}>
              {labelJa}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HexagonalSkillMatrix;
