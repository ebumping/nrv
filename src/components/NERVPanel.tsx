import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// NERV AUTHENTIC COLOR PALETTE - From the series, not vibes
// ═══════════════════════════════════════════════════════════════════════════════

export const NERVColors = {
  // Primary accent
  amber: '#FF8C00',
  amberBright: '#FFAA33',
  amberDim: '#CC6600',
  
  // Phosphor CRT
  phosphorGreen: '#39FF14',
  phosphorCyan: '#00CED1',
  
  // Alert levels
  crimson: '#DC143C',
  crimsonDark: '#8B0000',
  emergency: '#FF0000',
  
  // Backgrounds (CRT screen depth)
  terminalBlack: '#050505',
  screenDark: '#0A0A0A',
  panelDark: '#0F0F0F',
  borderDim: '#1A1A1A',
  borderMid: '#2A2A2A',
  
  // Text
  textBright: '#E0FFE0',
  textNormal: '#CCCCCC',
  textDim: '#666666',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHAMFERED PANEL - 45° corner cuts, no rounded corners EVER
// ═══════════════════════════════════════════════════════════════════════════════

interface NERVPanelProps {
  title?: string;
  titleJa?: string;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  alert?: 'normal' | 'warning' | 'danger' | 'critical';
  className?: string;
}

export function NERVPanel({
  title,
  titleJa,
  children,
  width = '100%',
  height = 'auto',
  alert = 'normal',
  className,
}: NERVPanelProps) {
  // Chamfer size for corners
  const chamfer = 8;
  
  // Title bar color based on alert level
  const titleBarColor = {
    normal: NERVColors.crimsonDark,
    warning: NERVColors.amberDim,
    danger: NERVColors.crimson,
    critical: NERVColors.emergency,
  }[alert];
  
  // Create chamfered path for SVG clip
  const chamferPath = `polygon(
    ${chamfer}px 0%,
    calc(100% - ${chamfer}px) 0%,
    100% ${chamfer}px,
    100% calc(100% - ${chamfer}px),
    calc(100% - ${chamfer}px) 100%,
    ${chamfer}px 100%,
    0% calc(100% - ${chamfer}px),
    0% ${chamfer}px
  )`;
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: NERVColors.panelDark,
    border: `1px solid ${NERVColors.borderMid}`,
    clipPath: chamferPath,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Courier New', 'MS Gothic', monospace",
    overflow: 'hidden',
  };
  
  const titleBarStyle: React.CSSProperties = {
    backgroundColor: titleBarColor,
    padding: '6px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${NERVColors.amber}`,
  };
  
  const titleStyle: React.CSSProperties = {
    color: NERVColors.amber,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadow: `0 0 4px ${NERVColors.amber}`,
  };
  
  const titleJaStyle: React.CSSProperties = {
    color: NERVColors.phosphorGreen,
    fontSize: 10,
    letterSpacing: 2,
  };
  
  const contentStyle: React.CSSProperties = {
    padding: 12,
    flex: 1,
  };
  
  return (
    <div style={containerStyle} className={className}>
      {title && (
        <div style={titleBarStyle}>
          <span style={titleStyle}>{title}</span>
          {titleJa && <span style={titleJaStyle}>{titleJa}</span>}
        </div>
      )}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS READOUT - Dense data grid, not sparse cards
// ═══════════════════════════════════════════════════════════════════════════════

interface StatusReadoutProps {
  data: Array<{
    label: string;
    labelJa?: string;
    value: string | number;
    unit?: string;
    status?: 'normal' | 'warning' | 'danger';
  }>;
  columns?: 2 | 3 | 4;
}

export function StatusReadout({ data, columns = 2 }: StatusReadoutProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '8px 16px',
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
  };
  
  const cellStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
  
  const labelStyle: React.CSSProperties = {
    color: NERVColors.textDim,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    display: 'flex',
    gap: 6,
  };
  
  const valueStyle = (status: 'normal' | 'warning' | 'danger'): React.CSSProperties => {
    const color = {
      normal: NERVColors.phosphorGreen,
      warning: NERVColors.amber,
      danger: NERVColors.crimson,
    }[status];
    
    return {
      color,
      fontSize: 14,
      fontWeight: 'bold',
      textShadow: `0 0 6px ${color}`,
    };
  };
  
  const unitStyle: React.CSSProperties = {
    fontSize: 10,
    color: NERVColors.textDim,
    marginLeft: 4,
  };
  
  return (
    <div style={gridStyle}>
      {data.map((item, i) => (
        <div key={i} style={cellStyle}>
          <span style={labelStyle}>
            {item.label}
            {item.labelJa && <span style={{ color: NERVColors.phosphorGreen }}>{item.labelJa}</span>}
          </span>
          <span style={valueStyle(item.status || 'normal')}>
            {item.value}
            {item.unit && <span style={unitStyle}>{item.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC RATIO DISPLAY - Circular gauge with threshold markers
// ═══════════════════════════════════════════════════════════════════════════════

interface SyncRatioProps {
  value: number;
  showWarning?: boolean;
}

export function SyncRatio({ value, showWarning = true }: SyncRatioProps) {
  const size = 120;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / 400, 1); // Max 400%
  const dashOffset = circumference * (1 - progress);
  
  // Color based on threshold
  const getThresholdColor = (v: number): string => {
    if (v < 70) return NERVColors.crimson;
    if (v < 100) return NERVColors.amber;
    if (v < 200) return NERVColors.phosphorGreen;
    return NERVColors.crimson; // Over 200% is danger
  };
  
  const color = getThresholdColor(value);
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  };
  
  const gaugeContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
  };
  
  const valueStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color,
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: "'Courier New', monospace",
    textShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
  };
  
  const labelStyle: React.CSSProperties = {
    color: NERVColors.textDim,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  };
  
  const labelJaStyle: React.CSSProperties = {
    color: NERVColors.phosphorGreen,
    fontSize: 9,
  };
  
  const warningStyle: React.CSSProperties = {
    color: NERVColors.crimson,
    fontSize: 10,
    animation: value > 200 ? 'pulse 0.5s infinite' : 'none',
  };
  
  return (
    <div style={containerStyle}>
      <div style={gaugeContainerStyle}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={NERVColors.borderMid}
            strokeWidth={strokeWidth}
          />
          
          {/* Threshold markers at 70%, 100%, 200% */}
          <circle cx={size/2} cy={size/2} r={3} fill={NERVColors.amber} 
            style={{ transform: `rotate(${0.175 * 360 - 90}deg)`, transformOrigin: 'center' }} />
          <circle cx={size/2} cy={size/2} r={3} fill={NERVColors.phosphorGreen}
            style={{ transform: `rotate(${0.25 * 360 - 90}deg)`, transformOrigin: 'center' }} />
          <circle cx={size/2} cy={size/2} r={3} fill={NERVColors.crimson}
            style={{ transform: `rotate(${0.5 * 360 - 90}deg)`, transformOrigin: 'center' }} />
          
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
        </svg>
        <span style={valueStyle}>{value.toFixed(1)}%</span>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={labelStyle}>SYNC RATIO</div>
        <div style={labelJaStyle}>同期率</div>
      </div>
      
      {showWarning && value > 200 && (
        <div style={warningStyle}>
          ▲ DANGER: THRESHOLD EXCEEDED ▲
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAGI DECISION SYSTEM - Three-node consensus display
// ═══════════════════════════════════════════════════════════════════════════════

interface MAGINodeData {
  vote: 'pending' | 'accept' | 'reject';
}

interface MAGIDecisionProps {
  nodes: {
    caspar: MAGINodeData;
    melchior: MAGINodeData;
    balthasar: MAGINodeData;
  };
}

export function MAGIDecision({ nodes }: MAGIDecisionProps) {
  const nodeRadius = 25;
  const spacing = 120;
  
  const nodeColors = {
    caspar: NERVColors.amber,
    melchior: NERVColors.phosphorGreen,
    balthasar: NERVColors.phosphorCyan,
  };
  
  const nodeLabels = {
    caspar: { en: 'CASPAR', ja: '論理', meaning: 'Logic' },
    melchior: { en: 'MELCHIOR', ja: '科学', meaning: 'Science' },
    balthasar: { en: 'BALTHASAR', ja: '感情', meaning: 'Emotion' },
  };
  
  const voteLabels = {
    pending: { en: 'PENDING', ja: '保留' },
    accept: { en: 'ACCEPT', ja: '賛成' },
    reject: { en: 'REJECT', ja: '反対' },
  };
  
  const renderNode = (key: keyof typeof nodes, x: number) => {
    const node = nodes[key];
    const color = nodeColors[key];
    const label = nodeLabels[key];
    const voteLabel = voteLabels[node.vote];
    
    const opacity = node.vote === 'pending' ? 0.4 : 1;
    const glowFilter = node.vote === 'accept' 
      ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})`
      : `drop-shadow(0 0 4px ${color})`;
    
    return (
      <g key={key}>
        {/* Outer decorative rings */}
        <circle cx={x} cy={40} r={nodeRadius + 15} fill="none" stroke={color} strokeWidth={0.5} opacity={0.2} />
        <circle cx={x} cy={40} r={nodeRadius + 8} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3} />
        
        {/* Main node circle */}
        <circle cx={x} cy={40} r={nodeRadius} fill="none" stroke={color} strokeWidth={2} opacity={opacity} />
        
        {/* Inner filled circle */}
        <circle 
          cx={x} 
          cy={40} 
          r={nodeRadius - 10} 
          fill={color} 
          opacity={opacity * 0.8}
          style={{ filter: glowFilter }}
        />
        
        {/* Node label */}
        <text x={x} y={75} textAnchor="middle" fill={NERVColors.textDim} fontSize={10} fontFamily="'Courier New', monospace">
          {label.en}
        </text>
        <text x={x} y={87} textAnchor="middle" fill={color} fontSize={8} fontFamily="'MS Gothic', monospace">
          {label.ja}
        </text>
        
        {/* Vote status */}
        <text x={x} y={102} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold" fontFamily="'Courier New', monospace">
          {voteLabel.en}
        </text>
        <text x={x} y={112} textAnchor="middle" fill={NERVColors.textDim} fontSize={8} fontFamily="'MS Gothic', monospace">
          {voteLabel.ja}
        </text>
      </g>
    );
  };
  
  // Calculate consensus
  const votes = Object.values(nodes).map(n => n.vote);
  const allAccept = votes.every(v => v === 'accept');
  const anyReject = votes.some(v => v === 'reject');
  
  const resultColor = anyReject ? NERVColors.crimson 
    : allAccept ? NERVColors.phosphorGreen 
    : NERVColors.amber;
  const resultText = anyReject ? 'REJECTED / 反対' 
    : allAccept ? 'APPROVED / 承認' 
    : 'PENDING / 保留';
  
  const width = spacing * 4;
  
  return (
    <div style={{ fontFamily: "'Courier New', monospace", textAlign: 'center' }}>
      <div style={{ color: NERVColors.amber, fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>
        MAGI DECISION SYSTEM
      </div>
      <div style={{ color: NERVColors.textDim, fontSize: 10, marginBottom: 16 }}>
        三種の決定
      </div>
      
      <svg width={width} height={130} style={{ display: 'block', margin: '0 auto' }}>
        {/* Connection lines with diamond markers */}
        <line x1={spacing} y1={40} x2={spacing * 2} y2={40} stroke={NERVColors.borderMid} strokeWidth={1} strokeDasharray="4,4" />
        <line x1={spacing * 2} y1={40} x2={spacing * 3} y2={40} stroke={NERVColors.borderMid} strokeWidth={1} strokeDasharray="4,4" />
        
        {/* Diamond midpoint markers */}
        <rect x={spacing * 1.5 - 4} y={36} width={8} height={8} fill={NERVColors.amber} transform={`rotate(45, ${spacing * 1.5}, 40)`} />
        <rect x={spacing * 2.5 - 4} y={36} width={8} height={8} fill={NERVColors.amber} transform={`rotate(45, ${spacing * 2.5}, 40)`} />
        
        {renderNode('caspar', spacing)}
        {renderNode('melchior', spacing * 2)}
        {renderNode('balthasar', spacing * 3)}
      </svg>
      
      <div style={{ 
        color: resultColor, 
        fontSize: 14, 
        fontWeight: 'bold',
        marginTop: 8,
        textShadow: `0 0 8px ${resultColor}`,
      }}>
        {resultText}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT BANNER - Flashing warning strip
// ═══════════════════════════════════════════════════════════════════════════════

interface AlertBannerProps {
  message: string;
  messageJa?: string;
  level: 'warning' | 'danger' | 'critical' | 'emergency';
}

export function AlertBanner({ message, messageJa, level }: AlertBannerProps) {
  const colors = {
    warning: NERVColors.amber,
    danger: NERVColors.crimson,
    critical: NERVColors.crimson,
    emergency: NERVColors.emergency,
  };
  
  const color = colors[level];
  const flashDuration = level === 'emergency' ? '0.3s' : level === 'critical' ? '0.5s' : '1s';
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: color,
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    fontFamily: "'Courier New', monospace",
    animation: `nerv-flash ${flashDuration} infinite`,
  };
  
  const textStyle: React.CSSProperties = {
    color: NERVColors.textBright,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadow: `0 0 8px ${NERVColors.textBright}`,
  };
  
  return (
    <>
      <style>{`
        @keyframes nerv-flash {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }
      `}</style>
      <div style={containerStyle}>
        <span style={{ color: NERVColors.textBright, fontSize: 16 }}>▲</span>
        <span style={textStyle}>{message}</span>
        {messageJa && <span style={{ ...textStyle, fontFamily: "'MS Gothic', monospace" }}>{messageJa}</span>}
        <span style={{ color: NERVColors.textBright, fontSize: 16 }}>▲</span>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA STREAM TICKER - Scrolling information strip
// ═══════════════════════════════════════════════════════════════════════════════

interface DataStreamProps {
  data?: string[];
  speed?: 'slow' | 'normal' | 'fast';
}

export function DataStream({ data, speed = 'normal' }: DataStreamProps) {
  const defaultData = [
    'SYS.NOMINAL',
    'PWR.98.2%',
    'SYNC.94.1%',
    'TEMP.28.4C',
    'DEPTH.847M',
    'AT.FIELD.STABLE',
    'PATTERN.BLUE',
    'TARGET.ACQUIRED',
  ];
  
  const streamData = data || defaultData;
  const content = streamData.join(' │ ') + ' │ ' + streamData.join(' │ ');
  
  const duration = {
    slow: '30s',
    normal: '20s',
    fast: '10s',
  }[speed];
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: NERVColors.terminalBlack,
    borderTop: `1px solid ${NERVColors.borderMid}`,
    borderBottom: `1px solid ${NERVColors.borderMid}`,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontFamily: "'Courier New', monospace",
    fontSize: 9,
    padding: '4px 0',
  };
  
  const scrollStyle: React.CSSProperties = {
    display: 'inline-block',
    color: NERVColors.phosphorGreen,
    animation: `scroll-left ${duration} linear infinite`,
    textShadow: `0 0 4px ${NERVColors.phosphorGreen}`,
  };
  
  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div style={containerStyle}>
        <span style={scrollStyle}>{content}</span>
      </div>
    </>
  );
}
