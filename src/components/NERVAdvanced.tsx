import React, { useEffect, useState } from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// PSYCHOGRAPH - 6-channel animated wave display
// ═══════════════════════════════════════════════════════════════════════════════

interface PsychographProps {
  width?: number;
  height?: number;
}

interface WaveChannel {
  id: string;
  label: string;
  labelJa: string;
  color: string;
  type: 'sine' | 'spike' | 'anomalous';
  freq?: number;
  spikes?: number;
}

const WAVE_CHANNELS: WaveChannel[] = [
  { id: 'a10', label: 'A-10', labelJa: '神経', color: NERVColors.textBright, type: 'sine', freq: 1 },
  { id: 'pfc', label: 'PFC', labelJa: '前頭葉', color: NERVColors.textBright, type: 'spike', spikes: 4 },
  { id: 'sync', label: 'SYNC', labelJa: '同期', color: '#FF6A00', type: 'anomalous' },
  { id: 'emot', label: 'EMOT', labelJa: '感情', color: NERVColors.textBright, type: 'sine', freq: 0.5 },
  { id: 'thal', label: 'THAL', labelJa: '視床', color: NERVColors.phosphorGreen, type: 'spike', spikes: 3 },
  { id: 'hipp', label: 'HIPP', labelJa: '海馬', color: NERVColors.phosphorGreen, type: 'sine', freq: 2 },
];

function generateSineWave(width: number, height: number, freq: number, phase: number, amplitude: number): string {
  const cy = height / 2;
  const amp = amplitude || height * 0.35;
  let path = `M 0,${cy.toFixed(1)}`;
  
  for (let x = 0; x <= width; x += 4) {
    const y = cy + amp * Math.sin((x * freq * 3.6 + phase) * Math.PI / 180);
    path += ` L ${x},${y.toFixed(1)}`;
  }
  
  return path;
}

function generateSpikeWave(width: number, height: number, spikes: number): string {
  const cy = height / 2;
  const amp = height * 0.4;
  const spikeWidth = width / (spikes * 2);
  
  let path = `M 0,${cy.toFixed(1)}`;
  let x = 0;
  
  for (let i = 0; i < spikes; i++) {
    path += ` L ${(x + spikeWidth * 0.7).toFixed(1)},${cy.toFixed(1)}`;
    path += ` L ${(x + spikeWidth * 0.85).toFixed(1)},${(cy - amp).toFixed(1)}`;
    path += ` L ${(x + spikeWidth).toFixed(1)},${(cy + amp * 0.3).toFixed(1)}`;
    path += ` L ${(x + spikeWidth * 1.15).toFixed(1)},${cy.toFixed(1)}`;
    x += spikeWidth * 2;
  }
  
  path += ` L ${width},${cy.toFixed(1)}`;
  return path;
}

function generateAnomalousWave(width: number, height: number, seed: number): string {
  const cy = height / 2;
  let path = `M 0,${cy.toFixed(1)}`;
  
  // Seeded random for consistency
  const random = (max: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * max;
  };
  
  let x = 0;
  while (x < width) {
    const nextX = Math.min(x + 15 + random(25), width);
    const amp = random(height * 0.8) - height * 0.4;
    
    if (random(1) > 0.7) {
      const midX = (x + nextX) / 2;
      path += ` L ${midX.toFixed(1)},${(cy + amp).toFixed(1)}`;
    }
    
    path += ` L ${nextX.toFixed(1)},${cy.toFixed(1)}`;
    x = nextX;
  }
  
  return path;
}

export function Psychograph({ width = 280, height = 200 }: PsychographProps) {
  const [phase, setPhase] = useState(0);
  const [seed, setSeed] = useState(42);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 5) % 360);
      setSeed(s => s + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  const waveHeight = (height - 24) / 6;
  const labelWidth = 45;
  const waveWidth = width - labelWidth;
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: NERVColors.terminalBlack,
    border: `1px solid ${NERVColors.textDim}`,
    fontFamily: "'Courier New', monospace",
    overflow: 'hidden',
  };
  
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(100,0,0,0.3)',
    borderBottom: `1px solid ${NERVColors.crimson}`,
    padding: '4px 8px',
    display: 'flex',
    justifyContent: 'space-between',
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ color: NERVColors.textBright, fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>PSYCHOGRAPH</span>
        <span style={{ color: NERVColors.textDim, fontSize: 8 }}>心理図</span>
        <span style={{ color: NERVColors.phosphorGreen, fontSize: 8 }}>ACTIVE</span>
      </div>
      
      <svg width={width} height={height - 20}>
        {WAVE_CHANNELS.map((channel, i) => {
          const y = 20 + i * waveHeight;
          let wavePath: string;
          
          switch (channel.type) {
            case 'sine':
              wavePath = generateSineWave(waveWidth, waveHeight, channel.freq || 1, phase, waveHeight * 0.35);
              break;
            case 'spike':
              wavePath = generateSpikeWave(waveWidth, waveHeight, channel.spikes || 4);
              break;
            case 'anomalous':
              wavePath = generateAnomalousWave(waveWidth, waveHeight, seed + i);
              break;
          }
          
          return (
            <g key={channel.id} transform={`translate(0, ${y})`}>
              {/* Label column */}
              <rect width={labelWidth} height={waveHeight} fill="rgba(0,0,0,0.5)" />
              <line x1={labelWidth} y1={0} x2={labelWidth} y2={waveHeight} stroke={NERVColors.borderMid} strokeWidth={1} />
              <text x={4} y={waveHeight * 0.4} fill={NERVColors.textBright} fontSize={7} fontWeight="bold">{channel.label}</text>
              <text x={4} y={waveHeight * 0.65} fill={NERVColors.phosphorGreen} fontSize={6}>{channel.labelJa}</text>
              
              {/* Wave */}
              <g transform={`translate(${labelWidth}, 0)`}>
                <rect width={waveWidth} height={waveHeight} fill={NERVColors.terminalBlack} />
                <path
                  d={wavePath}
                  fill="none"
                  stroke={channel.color}
                  strokeWidth={1}
                  transform={`translate(0, ${waveHeight / 2})`}
                  style={{ filter: `drop-shadow(0 0 3px ${channel.color})` }}
                />
                <line x1={0} y1={waveHeight} x2={waveWidth} y2={waveHeight} stroke={NERVColors.borderDim} strokeWidth={0.5} />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEX SKILL CLUSTER - Hexagonal skill graph visualization
// ═══════════════════════════════════════════════════════════════════════════════

interface HexSkillClusterProps {
  width?: number;
  height?: number;
  skills?: Array<{ name: string; value: string; status: 'ok' | 'warn' | 'error' }>;
}

function hexPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 30) * Math.PI / 180;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

export function HexSkillCluster({ width = 280, height = 200, skills }: HexSkillClusterProps) {
  const defaultSkills = [
    { name: 'WEB', value: 'OK', status: 'ok' as const },
    { name: 'EMB', value: 'OK', status: 'ok' as const },
    { name: 'LLM', value: 'OK', status: 'ok' as const },
    { name: 'RSRC', value: '8', status: 'ok' as const },
    { name: 'ANLYZ', value: 'OK', status: 'ok' as const },
    { name: 'FILE', value: 'OK', status: 'ok' as const },
    { name: 'TERM', value: 'OK', status: 'ok' as const },
    { name: 'CODE', value: 'OK', status: 'ok' as const },
    { name: 'TEST', value: '78%', status: 'warn' as const },
    { name: 'CHAIN', value: 'OK', status: 'ok' as const },
    { name: 'WRITE', value: 'OK', status: 'ok' as const },
    { name: 'CLAIM', value: '!', status: 'error' as const },
    { name: 'HOOK', value: '3', status: 'ok' as const },
  ];
  
  const skillData = skills || defaultSkills;
  const hexSize = 14;
  const offsetX = 25;
  const offsetY = 30;
  const horiz = hexSize * 1.8;
  const vert = hexSize * 1.5;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return NERVColors.phosphorGreen;
      case 'warn': return '#FF6A00';
      case 'error': return NERVColors.crimson;
      default: return NERVColors.textBright;
    }
  };
  
  // Position calculation for hex grid
  const getHexPosition = (index: number): { x: number; y: number; col: number; row: number } => {
    // Custom layout matching Python
    const positions = [
      [0, 0], [1, 0], [2, 0], // Row 0
      [0, 1], [1, 1], [2, 1], // Row 1
      [0.5, 2], [1.5, 2], // Row 2 (offset)
      [0, 3], [1, 3], [2, 3], // Row 3
      [0.5, 4], [1.5, 4], // Row 4 (offset)
    ];
    
    const [col, row] = positions[index] || [0, 0];
    const x = offsetX + col * horiz;
    const y = offsetY + row * vert;
    
    return { x, y, col, row };
  };
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: NERVColors.terminalBlack,
    border: `1px solid ${NERVColors.textDim}`,
    fontFamily: "'Courier New', monospace",
  };
  
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(100,0,0,0.3)',
    borderBottom: `1px solid ${NERVColors.crimson}`,
    padding: '4px 8px',
    display: 'flex',
    justifyContent: 'space-between',
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ color: NERVColors.textBright, fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>SKILL GRAPH</span>
        <span style={{ color: NERVColors.textDim, fontSize: 8 }}>スキルグラフ</span>
        <span style={{ color: NERVColors.textDim, fontSize: 7 }}>
          N:<span style={{ color: NERVColors.phosphorGreen }}>12</span> L:<span style={{ color: NERVColors.phosphorGreen }}>18</span>
        </span>
      </div>
      
      <svg width={width} height={height - 20}>
        {skillData.map((skill, i) => {
          const { x, y } = getHexPosition(i);
          const color = getStatusColor(skill.status);
          
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <polygon
                points={hexPoints(0, 0, hexSize)}
                fill="rgba(0,0,0,0.5)"
                stroke={color}
                strokeWidth={1}
              />
              <text x={0} y={-3} fill={NERVColors.textDim} fontSize={5} textAnchor="middle">{skill.name}</text>
              <text x={0} y={4} fill={color} fontSize={6} fontWeight="bold" textAnchor="middle">{skill.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TACTICAL MAP - Wireframe perspective grid
// ═══════════════════════════════════════════════════════════════════════════════

interface TacticalMapProps {
  width?: number;
  height?: number;
}

export function TacticalMap({ width = 580, height = 180 }: TacticalMapProps) {
  const centerX = width / 2;
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: NERVColors.terminalBlack,
    border: `1px solid ${NERVColors.textDim}`,
    fontFamily: "'Courier New', monospace",
  };
  
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(100,0,0,0.3)',
    borderBottom: `1px solid ${NERVColors.crimson}`,
    padding: '4px 8px',
    display: 'flex',
    justifyContent: 'space-between',
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ color: NERVColors.textBright, fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>TACTICAL MAP</span>
        <span style={{ color: NERVColors.textDim, fontSize: 8 }}>戦術地図</span>
      </div>
      
      <svg width={width} height={height - 20}>
        {/* Perspective grid */}
        <g stroke={NERVColors.borderMid} strokeWidth={0.3} fill="none">
          {/* Vertical lines converging to horizon */}
          <line x1={centerX} y1={5} x2={10} y2={height - 20} />
          <line x1={centerX} y1={5} x2={width * 0.3} y2={height - 20} />
          <line x1={centerX} y1={5} x2={centerX} y2={height - 20} />
          <line x1={centerX} y1={5} x2={width * 0.7} y2={height - 20} />
          <line x1={centerX} y1={5} x2={width - 10} y2={height - 20} />
          
          {/* Horizontal lines */}
          <line x1={5} y1={20} x2={width - 5} y2={20} />
          <line x1={2} y1={50} x2={width - 2} y2={50} />
          <line x1={0} y1={90} x2={width} y2={90} />
          <line x1={0} y1={130} x2={width} y2={130} />
        </g>
        
        {/* Terrain contours */}
        <g fill="none" stroke={NERVColors.phosphorGreen} strokeWidth={0.5} opacity={0.3}>
          <path d="M 10,40 Q 40,35 70,45 T 130,40 T 190,45" />
          <path d="M 5,80 Q 35,70 65,85 T 125,75 T 195,85" />
          <path d="M 400,40 Q 430,35 460,45 T 520,40 T 570,45" />
          <path d="M 405,80 Q 435,70 465,85 T 525,75 T 575,85" />
        </g>
        
        {/* EVA-01 position */}
        <circle cx={width * 0.7} cy={60} r={4} fill={NERVColors.phosphorGreen} style={{ filter: `drop-shadow(0 0 6px ${NERVColors.phosphorGreen})` }} />
        <text x={width * 0.7 + 8} y={63} fill={NERVColors.phosphorGreen} fontSize={7}>01</text>
        
        {/* Target position with pulse */}
        <circle cx={width * 0.3} cy={30} r={5} fill={NERVColors.crimson}>
          <animate attributeName="r" values="5;8;5" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={width * 0.3} cy={30} r={10} fill="none" stroke={NERVColors.crimson} strokeWidth={1}>
          <animate attributeName="r" values="10;18;10" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <text x={width * 0.3 + 10} y={33} fill={NERVColors.crimson} fontSize={7}>TGT</text>
        
        {/* Footer info */}
        <g transform={`translate(0, ${height - 38})`}>
          <rect width={width} height={18} fill={NERVColors.panelDark} />
          <text x={8} y={12} fill={NERVColors.textDim} fontSize={7}>TOKYO-3</text>
          <text x={width / 2} y={12} fill={NERVColors.phosphorGreen} fontSize={7} textAnchor="middle">47-K</text>
          <text x={width - 30} y={12} fill={NERVColors.textDim} fontSize={7}>1:50K</text>
        </g>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEX TARGET - Rotating hexagonal targeting display
// ═══════════════════════════════════════════════════════════════════════════════

interface TargetProfile {
  id: string;
  name: string;
  nameJa?: string;
  distance: string;
  bearing: string;
  type: 'hostile' | 'friendly' | 'unknown';
  pattern?: string;
}

interface HexTargetProps {
  width?: number;
  height?: number;
  targetName?: string;
  distance?: string;
  bearing?: string;
  targets?: TargetProfile[];
  onTargetSelect?: (target: TargetProfile) => void;
}

export function HexTarget({
  width = 290,
  height = 200,
  targetName = 'ANGEL-04',
  distance = '2,847m',
  bearing = '047°',
  targets,
  onTargetSelect,
}: HexTargetProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setFlash(f => !f), 600);
    return () => clearInterval(interval);
  }, []);

  const activeTargets = targets || [{ id: '0', name: targetName, distance, bearing, type: 'hostile' as const }];
  const current = activeTargets[selectedIdx] || activeTargets[0];
  const typeColor = current.type === 'hostile' ? NERVColors.crimson
    : current.type === 'friendly' ? NERVColors.phosphorGreen : NERVColors.amber;

  const svgH = height - 20;
  const cx = width / 2;
  const cy = svgH * 0.42;
  const hexSize = Math.min(width, svgH) * 0.32;

  const handleTargetClick = (idx: number) => {
    setSelectedIdx(idx);
    if (onTargetSelect && activeTargets[idx]) onTargetSelect(activeTargets[idx]);
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: NERVColors.terminalBlack,
      border: `1px solid ${NERVColors.textDim}`,
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Header with target tabs */}
      <div style={{
        backgroundColor: 'rgba(100,0,0,0.3)',
        borderBottom: `1px solid ${NERVColors.crimson}`,
        padding: '4px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: NERVColors.textBright, fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>TARGET LOCK</span>
        <span style={{ color: NERVColors.textDim, fontSize: 8 }}>目標補足</span>
        <span style={{ color: typeColor, fontSize: 8 }}>
          {activeTargets.length > 1 ? `${selectedIdx + 1}/${activeTargets.length}` : 'LOCKED'}
        </span>
      </div>

      {/* Multi-target selector */}
      {activeTargets.length > 1 && (
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${NERVColors.borderDim}`,
        }}>
          {activeTargets.map((t, i) => {
            const tColor = t.type === 'hostile' ? NERVColors.crimson
              : t.type === 'friendly' ? NERVColors.phosphorGreen : NERVColors.amber;
            const isActive = i === selectedIdx;
            return (
              <div
                key={t.id}
                onClick={() => handleTargetClick(i)}
                style={{
                  flex: 1,
                  padding: '3px 4px',
                  fontSize: 7,
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: isActive ? tColor : NERVColors.textDim,
                  borderBottom: isActive ? `2px solid ${tColor}` : '2px solid transparent',
                  backgroundColor: isActive ? `${tColor}11` : 'transparent',
                  letterSpacing: 1,
                }}
              >
                {t.name}
              </div>
            );
          })}
        </div>
      )}

      <svg width="100%" viewBox={`0 0 ${width} ${svgH}`} style={{ display: 'block' }}>
        {/* Outer hexagon */}
        <polygon
          points={hexPoints(cx, cy, hexSize)}
          fill="none"
          stroke={typeColor}
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Rotating inner reticle */}
        <polygon
          points={hexPoints(cx, cy, hexSize * 0.7)}
          fill="none"
          stroke={typeColor}
          strokeWidth={1}
          strokeDasharray="4,2"
          opacity={0.6}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0;360"
            dur="8s"
            repeatCount="indefinite"
          />
        </polygon>

        {/* Innermost hex fill */}
        <polygon
          points={hexPoints(cx, cy, hexSize * 0.4)}
          fill={typeColor}
          stroke={typeColor}
          strokeWidth={0.5}
          opacity={0.3}
        />

        {/* Crosshair */}
        <line x1={cx - hexSize * 0.5} y1={cy} x2={cx - 8} y2={cy} stroke={typeColor} strokeWidth={1} opacity={0.6} />
        <line x1={cx + 8} y1={cy} x2={cx + hexSize * 0.5} y2={cy} stroke={typeColor} strokeWidth={1} opacity={0.6} />
        <line x1={cx} y1={cy - hexSize * 0.5} x2={cx} y2={cy - 8} stroke={typeColor} strokeWidth={1} opacity={0.6} />
        <line x1={cx} y1={cy + 8} x2={cx} y2={cy + hexSize * 0.5} stroke={typeColor} strokeWidth={1} opacity={0.6} />
        <circle cx={cx} cy={cy} r={3} fill={typeColor} opacity={0.8} />

        {/* Corner brackets */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
          <g key={i}>
            <line
              x1={cx + dx * (hexSize + 4)} y1={cy + dy * (hexSize - 10)}
              x2={cx + dx * (hexSize + 4)} y2={cy + dy * (hexSize + 4)}
              stroke={NERVColors.textBright} strokeWidth={1.5} opacity={0.6}
            />
            <line
              x1={cx + dx * (hexSize - 10)} y1={cy + dy * (hexSize + 4)}
              x2={cx + dx * (hexSize + 4)} y2={cy + dy * (hexSize + 4)}
              stroke={NERVColors.textBright} strokeWidth={1.5} opacity={0.6}
            />
          </g>
        ))}

        {/* Target info */}
        <text x={cx} y={svgH - 42} fill={NERVColors.textBright} fontSize={12} fontWeight="bold" textAnchor="middle" letterSpacing={2}>
          {current.name}
        </text>
        <text x={cx} y={svgH - 30} fill={NERVColors.textDim} fontSize={8} textAnchor="middle">
          DIST: {current.distance} | BRG: {current.bearing}
          {current.pattern && ` | ${current.pattern}`}
        </text>
        <text
          x={cx}
          y={svgH - 16}
          fill={typeColor}
          fontSize={9}
          fontWeight="bold"
          textAnchor="middle"
          style={{ cursor: onTargetSelect ? 'pointer' : 'default' }}
          onClick={() => onTargetSelect?.(current)}
          opacity={flash ? 1 : 0.3}
        >
          TRACKING // 追跡中
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN INDICATOR - Full-width status bar
// ═══════════════════════════════════════════════════════════════════════════════

interface PatternIndicatorProps {
  width?: number;
  pattern?: 'BLUE' | 'ORANGE' | 'RED';
  alert?: string;
}

export function PatternIndicator({ width = 800, pattern = 'BLUE', alert = 'ANGEL DETECTED' }: PatternIndicatorProps) {
  const patternColors = {
    BLUE: NERVColors.phosphorCyan,
    ORANGE: '#FF6A00',
    RED: NERVColors.crimson,
  };
  
  const color = patternColors[pattern];
  
  const containerStyle: React.CSSProperties = {
    width,
    height: 30,
    backgroundColor: NERVColors.terminalBlack,
    border: `2px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontFamily: "'Courier New', monospace",
  };
  
  return (
    <div style={containerStyle}>
      {/* Pulsing dot */}
      <svg width={20} height={20} style={{ marginRight: 10 }}>
        <circle cx={10} cy={10} r={8} fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx={10} cy={10} r={8} fill="none" stroke={color} strokeWidth={1}>
          <animate attributeName="r" values="8;15;8" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
      
      {/* Pattern text */}
      <div style={{ flex: 1 }}>
        <span style={{ color, fontSize: 14, fontWeight: 'bold', letterSpacing: 3, textShadow: `0 0 6px ${color}` }}>
          PATTERN: {pattern}
        </span>
        <span style={{ color, fontSize: 9, marginLeft: 10, opacity: 0.7 }}>
          パターン{pattern === 'BLUE' ? '青' : pattern === 'ORANGE' ? '橙' : '赤'}
        </span>
      </div>
      
      {/* Alert */}
      <span style={{ color: NERVColors.crimson, fontSize: 11, fontWeight: 'bold', textShadow: `0 0 8px ${NERVColors.crimson}` }}>
        ▲ {alert} ▲
        <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS GRID - Dense data grid with color-coded borders
// ═══════════════════════════════════════════════════════════════════════════════

interface StatusGridProps {
  width?: number;
  height?: number;
  title: string;
  titleJa?: string;
  cells: Array<{
    label: string;
    labelJa?: string;
    value: string;
    status?: 'normal' | 'warning' | 'danger';
  }>;
}

export function StatusGrid({ title, titleJa, cells }: StatusGridProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'warning': return '#FF6A00';
      case 'danger': return NERVColors.crimson;
      default: return NERVColors.phosphorGreen;
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: NERVColors.terminalBlack,
      border: `1px solid ${NERVColors.textDim}`,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        backgroundColor: 'rgba(100,0,0,0.3)',
        borderBottom: `1px solid ${NERVColors.crimson}`,
        padding: '4px 8px',
        display: 'flex',
        gap: 8,
        alignItems: 'baseline',
      }}>
        <span style={{ color: NERVColors.textBright, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>{title}</span>
        {titleJa && <span style={{ color: NERVColors.textDim, fontSize: 9 }}>{titleJa}</span>}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
      }}>
        {cells.map((cell, i) => {
          const borderColor = getStatusColor(cell.status);
          return (
            <div key={i} style={{
              borderLeft: `3px solid ${borderColor}`,
              borderBottom: `1px solid ${NERVColors.borderDim}`,
              borderRight: i % 2 === 0 ? `1px solid ${NERVColors.borderDim}` : 'none',
              padding: '6px 8px',
            }}>
              <div style={{
                color: NERVColors.textDim,
                fontSize: 8,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
                {cell.label}
              </div>
              <div style={{
                color: borderColor,
                fontSize: 14,
                fontWeight: 'bold',
                textShadow: `0 0 6px ${borderColor}`,
                letterSpacing: 1,
              }}>
                {cell.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC RATIO LARGE - Big display with segmented bar
// ═══════════════════════════════════════════════════════════════════════════════

interface SyncRatioLargeProps {
  width?: number;
  height?: number;
  value?: number;
}

export function SyncRatioLarge({ value = 94.2 }: SyncRatioLargeProps) {
  const getColor = (v: number) => {
    if (v < 70) return NERVColors.crimson;
    if (v < 100) return '#FF6A00';
    return NERVColors.phosphorGreen;
  };

  const color = getColor(value);
  const segments = 10;
  const active = Math.min(Math.floor(value / 10), segments);

  return (
    <div style={{
      width: '100%',
      fontFamily: "'Courier New', monospace",
      backgroundColor: NERVColors.terminalBlack,
      border: `1px solid ${NERVColors.textDim}`,
    }}>
      <div style={{ padding: '12px 16px 8px', textAlign: 'center' }}>
        <div style={{
          color,
          fontSize: 48,
          fontWeight: 'bold',
          textShadow: `0 0 12px ${color}, 0 0 24px ${color}44`,
          lineHeight: 1,
          letterSpacing: 2,
        }}>
          {value.toFixed(1)}%
        </div>
        <div style={{
          color: NERVColors.textDim,
          fontSize: 9,
          letterSpacing: 2,
          marginTop: 4,
        }}>
          SYNC RATIO // 同期率
        </div>
      </div>

      {/* Segmented bar */}
      <div style={{ display: 'flex', gap: 1, padding: '0 12px 8px' }}>
        {Array.from({ length: segments }).map((_, i) => {
          let segColor: string;
          if (i < active - 2) {
            segColor = NERVColors.phosphorGreen;
          } else if (i < active) {
            segColor = '#FF6A00';
          } else {
            segColor = NERVColors.borderDim;
          }

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                backgroundColor: segColor,
                boxShadow: segColor === NERVColors.phosphorGreen ? `0 0 6px ${segColor}` : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
