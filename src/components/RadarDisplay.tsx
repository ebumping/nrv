import React, { useState, useEffect, useRef } from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// RADAR DISPLAY - Classic rotating sweep radar with target tracking
// Eva used radar for Angel detection and positioning
// ═══════════════════════════════════════════════════════════════════════════════

export interface RadarTarget {
  id: string;
  angle: number;      // 0-360 degrees, 0 = north
  distance: number;   // 0-100 (percentage of range)
  type: 'friendly' | 'hostile' | 'unknown';
  label?: string;
  blip?: boolean;     // Whether to pulse/blip
}

interface RadarDisplayProps {
  size?: number;
  targets?: RadarTarget[];
  sweepSpeed?: number;     // Seconds per rotation
  rangeLabel?: string;
  showGrid?: boolean;
  showCardinals?: boolean;
  alertMode?: boolean;
  centerLabel?: string;
}

export function RadarDisplay({
  size = 200,
  targets = [],
  sweepSpeed = 4,
  rangeLabel = '5 KM',
  showGrid = true,
  showCardinals = true,
  alertMode = false,
  centerLabel: _centerLabel = 'EVA-01',
}: RadarDisplayProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [blipAges, setBlipAges] = useState<Map<string, number>>(new Map());
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Animate sweep rotation
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      
      // Calculate new angle
      const degreesPerMs = 360 / (sweepSpeed * 1000);
      setSweepAngle(prev => (prev + degreesPerMs * delta) % 360);
      
      // Age blips
      setBlipAges(prev => {
        const next = new Map(prev);
        for (const [id, age] of next) {
          if (age > 100) next.delete(id);
          else next.set(id, age + delta * 0.1);
        }
        return next;
      });
      
      lastTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [sweepSpeed]);
  
  // When sweep passes a target, refresh its blip
  useEffect(() => {
    for (const target of targets) {
      const angleDiff = Math.abs((sweepAngle - target.angle + 180) % 360 - 180);
      if (angleDiff < 5) {
        setBlipAges(prev => {
          if (prev.get(target.id) === undefined || prev.get(target.id)! > 50) {
            return new Map(prev).set(target.id, 0);
          }
          return prev;
        });
      }
    }
  }, [sweepAngle, targets]);
  
  const center = size / 2;
  const radius = (size / 2) - 10;
  
  // Convert polar to cartesian
  const polarToCartesian = (angle: number, dist: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    const r = (dist / 100) * radius;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };
  
  // Target colors
  const getTargetColor = (type: RadarTarget['type']) => {
    switch (type) {
      case 'friendly': return NERVColors.phosphorGreen;
      case 'hostile': return alertMode ? NERVColors.emergency : NERVColors.crimson;
      case 'unknown': return NERVColors.amber;
    }
  };
  
  // Sweep end position
  const sweepRad = ((sweepAngle - 90) * Math.PI) / 180;
  const sweepEnd = {
    x: center + radius * Math.cos(sweepRad),
    y: center + radius * Math.sin(sweepRad),
  };
  
  const containerStyle: React.CSSProperties = {
    fontFamily: "'Courier New', monospace",
    textAlign: 'center',
  };
  
  const svgContainerStyle: React.CSSProperties = {
    backgroundColor: alertMode ? 'rgba(139, 0, 0, 0.2)' : '#000000',
    border: `2px solid ${alertMode ? NERVColors.emergency : NERVColors.textBright}`,
    position: 'relative' as const,
  };
  
  const labelStyle: React.CSSProperties = {
    color: NERVColors.textDim,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 4,
  };
  
  const rangeStyle: React.CSSProperties = {
    color: NERVColors.textDim,
    fontSize: 8,
  };
  
  return (
    <div style={containerStyle}>
      <div style={svgContainerStyle}>
        <svg width={size} height={size} style={{ display: 'block' }}>
          <defs>
            {/* Sweep gradient */}
            <linearGradient id="radar-sweep-gradient" gradientUnits="userSpaceOnUse" x1={center} y1={center} x2={sweepEnd.x} y2={sweepEnd.y}>
              <stop offset="0%" stopColor={alertMode ? NERVColors.emergency : NERVColors.phosphorGreen} stopOpacity={0} />
              <stop offset="100%" stopColor={alertMode ? NERVColors.emergency : NERVColors.phosphorGreen} stopOpacity={0.4} />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="radar-blip-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Range rings */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius * r}
              fill="none"
              stroke={i === 3 ? (alertMode ? NERVColors.emergency : NERVColors.textBright) : NERVColors.borderMid}
              strokeWidth={i === 3 ? 1 : 0.5}
            />
          ))}
          
          {/* Cross lines */}
          {showGrid && [0, 45, 90, 135].map((angle, i) => {
            const end1 = polarToCartesian(angle, 105);
            const end2 = polarToCartesian(angle + 180, 105);
            return (
              <line
                key={i}
                x1={i % 2 === 0 ? end1.x : center}
                y1={i % 2 === 0 ? end1.y : center}
                x2={i % 2 === 0 ? end2.x : center}
                y2={i % 2 === 0 ? end2.y : center}
                stroke={NERVColors.borderMid}
                strokeWidth={angle === 0 || angle === 90 ? 0.8 : 0.3}
                strokeDasharray={angle === 45 || angle === 135 ? "4,4" : "none"}
              />
            );
          })}
          
          {/* Cardinal directions */}
          {showCardinals && ['N', 'E', 'S', 'W'].map((dir, i) => {
            const angle = i * 90;
            const pos = polarToCartesian(angle, 108);
            return (
              <text
                key={dir}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={i === 0 ? NERVColors.amber : NERVColors.textDim}
                fontSize={9}
                fontWeight="bold"
              >
                {dir}
              </text>
            );
          })}
          
          {/* Range labels */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => {
            const pos = polarToCartesian(135, r * 100);
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                fill={NERVColors.textDim}
                fontSize={7}
              >
                {(r * 5).toFixed(1)}
              </text>
            );
          })}
          
          {/* Sweep cone (trail) - simplified as just the line */}
          <line
            x1={center}
            y1={center}
            x2={sweepEnd.x}
            y2={sweepEnd.y}
            stroke={alertMode ? NERVColors.emergency : NERVColors.phosphorGreen}
            strokeWidth={2}
            filter="url(#radar-blip-glow)"
          />
          
          {/* Targets */}
          {targets.map(target => {
            const pos = polarToCartesian(target.angle, target.distance);
            const color = getTargetColor(target.type);
            const blipAge = blipAges.get(target.id) ?? 100;
            const blipOpacity = Math.max(0, 1 - blipAge / 100);
            const blipSize = 4 + (1 - blipAge / 100) * 4;
            
            // Only show if swept recently
            if (blipAge > 100 && !target.blip) return null;
            
            return (
              <g key={target.id}>
                {/* Blip */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={blipSize}
                  fill={color}
                  opacity={target.blip ? 1 : blipOpacity}
                  filter="url(#radar-blip-glow)"
                />
                
                {/* Target blip expansion ring for hostile/unknown */}
                {(target.type === 'hostile' || target.blip) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={blipSize + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={target.blip ? 0.8 : blipOpacity * 0.5}
                  />
                )}
                
                {/* Label */}
                {target.label && (
                  <text
                    x={pos.x + 10}
                    y={pos.y}
                    fill={color}
                    fontSize={8}
                    dominantBaseline="middle"
                    style={{ textShadow: `0 0 4px ${color}` }}
                  >
                    {target.label}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Center dot */}
          <circle cx={center} cy={center} r={4} fill={NERVColors.amber} />
          <circle cx={center} cy={center} r={6} fill="none" stroke={NERVColors.amber} strokeWidth={1} />
        </svg>
        
        {/* Range label overlay */}
        <div style={{ 
          position: 'absolute', 
          bottom: 4, 
          right: 4, 
          fontSize: 7, 
          color: NERVColors.textDim 
        }}>
          RANGE: {rangeLabel}
        </div>
      </div>
      
      <div style={labelStyle}>RADAR // レーダー</div>
      <div style={rangeStyle}>RANGE: {rangeLabel}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RADAR SCOPE - Full panel with radar and controls
// ═══════════════════════════════════════════════════════════════════════════════

interface RadarScopeProps {
  targets?: RadarTarget[];
  alertMode?: boolean;
  range?: number;
  onRangeChange?: (range: number) => void;
}

const RANGES = ['1 KM', '5 KM', '10 KM', '50 KM'];

export function RadarScope({ 
  targets = [], 
  alertMode = false,
  range = 1,
  onRangeChange
}: RadarScopeProps) {
  const [internalRangeIndex, setInternalRangeIndex] = useState(range);
  
  const handleRangeChange = (idx: number) => {
    setInternalRangeIndex(idx);
    onRangeChange?.(idx);
  };
  
  const currentRange = RANGES[internalRangeIndex];
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: NERVColors.panelDark,
    border: `1px solid ${alertMode ? NERVColors.emergency : NERVColors.borderMid}`,
    fontFamily: "'Courier New', monospace",
    padding: 8,
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 8px',
    borderBottom: `1px solid ${alertMode ? NERVColors.emergency : NERVColors.borderMid}`,
    marginBottom: 8,
  };
  
  const titleStyle: React.CSSProperties = {
    color: alertMode ? NERVColors.emergency : NERVColors.textBright,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: 'bold',
  };
  
  const statusStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    fontSize: 9,
  };
  
  const rangeSelectorStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTop: `1px solid ${NERVColors.borderMid}`,
  };
  
  const rangeButtonStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? NERVColors.phosphorGreen : 'transparent',
    border: `1px solid ${NERVColors.phosphorGreen}`,
    color: active ? '#000' : NERVColors.textDim,
    padding: '2px 6px',
    fontSize: 8,
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
  });
  
  // Target stats
  const hostileCount = targets.filter(t => t.type === 'hostile').length;
  const friendlyCount = targets.filter(t => t.type === 'friendly').length;
  const unknownCount = targets.filter(t => t.type === 'unknown').length;
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>RADAR // レーダー</span>
        <div style={statusStyle}>
          <span style={{ color: NERVColors.crimson }}>HOSTILE: {hostileCount}</span>
          <span style={{ color: NERVColors.phosphorGreen }}>FRIEND: {friendlyCount}</span>
          <span style={{ color: NERVColors.amber }}>UNKN: {unknownCount}</span>
        </div>
      </div>
      
      <RadarDisplay
        size={200}
        targets={targets}
        rangeLabel={currentRange}
        alertMode={alertMode}
        sweepSpeed={4 - internalRangeIndex * 0.5}
      />
      
      <div style={rangeSelectorStyle}>
        {RANGES.map((r, i) => (
          <button 
            key={r} 
            style={rangeButtonStyle(i === internalRangeIndex)}
            onClick={() => handleRangeChange(i)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SONAR DISPLAY - PING-style display for underwater/subterranean
// ═══════════════════════════════════════════════════════════════════════════════

interface SonarDisplayProps {
  size?: number;
  pings?: Array<{ angle: number; distance: number; intensity: number }>;
  pingInterval?: number;
}

export function SonarDisplay({ 
  size = 150,
  pings = [],
  pingInterval = 2000
}: SonarDisplayProps) {
  const [pingPhase, setPingPhase] = useState(0);
  const [expansionRing, setExpansionRing] = useState(0);
  
  // Animate ping expansion
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const cycle = elapsed % pingInterval;
      const phase = cycle / pingInterval;
      
      setPingPhase(phase);
      setExpansionRing(phase * size);
      
      requestAnimationFrame(animate);
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [size, pingInterval]);
  
  const center = size / 2;
  
  return (
    <svg width={size} height={size} style={{ backgroundColor: '#000' }}>
      {/* Expanding ping ring */}
      <circle
        cx={center}
        cy={center}
        r={expansionRing / 2}
        fill="none"
        stroke={NERVColors.phosphorGreen}
        strokeWidth={2}
        opacity={Math.max(0, 1 - pingPhase)}
      />
      
      {/* Secondary ring */}
      <circle
        cx={center}
        cy={center}
        r={(expansionRing / 2) * 0.7}
        fill="none"
        stroke={NERVColors.phosphorGreen}
        strokeWidth={1}
        opacity={Math.max(0, 0.5 - pingPhase * 0.5)}
      />
      
      {/* Static range rings */}
      {[0.33, 0.66, 1].map((r, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={(size / 2 - 5) * r}
          fill="none"
          stroke={NERVColors.borderMid}
          strokeWidth={0.5}
        />
      ))}
      
      {/* Ping echoes */}
      {pings.map((ping, i) => {
        const rad = ((ping.angle - 90) * Math.PI) / 180;
        const dist = (ping.distance / 100) * (size / 2 - 10);
        const x = center + dist * Math.cos(rad);
        const y = center + dist * Math.sin(rad);
        
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3 + ping.intensity * 3}
            fill={NERVColors.phosphorGreen}
            opacity={ping.intensity * (1 - pingPhase * 0.3)}
          />
        );
      })}
      
      {/* Center point */}
      <circle cx={center} cy={center} r={3} fill={NERVColors.amber} />
    </svg>
  );
}

export default RadarDisplay;
