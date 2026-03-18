import React from 'react';
import { NERVColors, MAGIDecision } from './NERVPanel';
import {
  Psychograph,
  HexSkillCluster,
  TacticalMap,
  HexTarget,
  StatusGrid,
  SyncRatioLarge,
} from './NERVAdvanced';

// ═══════════════════════════════════════════════════════════════════════════════
// NERV DASHBOARD - Full authentic interface
// ═══════════════════════════════════════════════════════════════════════════════

interface NERVDashboardProps {
  width?: number;
  height?: number;
  pattern?: 'BLUE' | 'ORANGE' | 'RED';
  syncValue?: number;
  magiVotes?: { 
    caspar: { vote: 'pending' | 'accept' | 'reject' }; 
    melchior: { vote: 'pending' | 'accept' | 'reject' }; 
    balthasar: { vote: 'pending' | 'accept' | 'reject' }; 
  };
}

export function NERVDashboard({
  width = 1200,
  height = 800,
  pattern = 'BLUE',
  syncValue = 94.2,
  magiVotes = { 
    caspar: { vote: 'accept' }, 
    melchior: { vote: 'accept' }, 
    balthasar: { vote: 'accept' } 
  },
}: NERVDashboardProps) {
  const leftW = 280;
  const rightW = 280;
  const centerW = width - leftW - rightW - 20;

  const patternColors = {
    BLUE: NERVColors.phosphorCyan,
    ORANGE: '#FF6A00',
    RED: NERVColors.crimson,
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: NERVColors.terminalBlack,
    fontFamily: "'Courier New', 'MS Gothic', monospace",
    position: 'relative',
    overflow: 'hidden',
  };

  // CRT scanline overlay
  const scanlineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)',
    pointerEvents: 'none',
    zIndex: 100,
  };

  // Vignette overlay
  const vignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
    pointerEvents: 'none',
    zIndex: 101,
  };

  const headerStyle: React.CSSProperties = {
    height: 50,
    background: `linear-gradient(180deg, ${NERVColors.crimsonDark} 0%, ${NERVColors.terminalBlack} 100%)`,
    borderBottom: `3px solid ${NERVColors.crimson}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    justifyContent: 'space-between',
  };

  const logoStyle: React.CSSProperties = {
    color: NERVColors.textBright,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 8,
    textShadow: `0 0 10px ${NERVColors.crimson}`,
  };

  const patternBarStyle: React.CSSProperties = {
    height: 30,
    backgroundColor: NERVColors.terminalBlack,
    border: `2px solid ${patternColors[pattern]}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
  };

  const columnStyle = (flex: number): React.CSSProperties => ({
    flex,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    padding: 5,
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        {/* Corner decorations */}
        <svg width={30} height={50} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M 0,0 L 30,0 L 25,8 L 8,8 L 8,25 L 0,30 Z" fill={NERVColors.crimsonDark} />
        </svg>
        <svg width={30} height={50} style={{ position: 'absolute', right: 0, top: 0 }}>
          <path d={`M 30,0 L 0,0 L 5,8 L 22,8 L 22,25 L 30,30 Z`} fill={NERVColors.crimsonDark} />
        </svg>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <span style={logoStyle}>NERV</span>
          <span style={{ color: NERVColors.textDim, fontSize: 10, letterSpacing: 2 }}>
            COMMAND CENTER // 司令センター
          </span>
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ color: NERVColors.textDim, fontSize: 9 }}>SYS:</span>
          <span style={{ color: NERVColors.phosphorGreen, fontSize: 9, textShadow: `0 0 4px ${NERVColors.phosphorGreen}` }}>NOMINAL</span>
          <span style={{ color: NERVColors.textDim, fontSize: 9 }}>|</span>
          <span style={{ color: NERVColors.textDim, fontSize: 9 }}>PATTERN:</span>
          <span style={{ color: patternColors[pattern], fontSize: 9, textShadow: `0 0 4px ${patternColors[pattern]}` }}>{pattern}</span>
          <span style={{ color: NERVColors.textDim, fontSize: 9 }}>|</span>
          <span style={{ color: NERVColors.phosphorGreen, fontSize: 9 }}>14:32:07</span>
        </div>
      </div>

      {/* Pattern Indicator Bar */}
      <div style={patternBarStyle}>
        {/* Pulsing dot */}
        <svg width={20} height={20} style={{ marginRight: 10 }}>
          <circle cx={10} cy={10} r={8} fill={patternColors[pattern]}>
            <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx={10} cy={10} r={8} fill="none" stroke={patternColors[pattern]} strokeWidth={1}>
            <animate attributeName="r" values="8;15;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>

        <span style={{ color: patternColors[pattern], fontSize: 14, fontWeight: 'bold', letterSpacing: 3, textShadow: `0 0 6px ${patternColors[pattern]}` }}>
          PATTERN: {pattern}
        </span>
        <span style={{ color: patternColors[pattern], fontSize: 9, marginLeft: 10, opacity: 0.7 }}>
          パターン{pattern === 'BLUE' ? '青' : pattern === 'ORANGE' ? '橙' : '赤'}
        </span>

        <div style={{ flex: 1 }} />

        <span style={{ color: NERVColors.crimson, fontSize: 11, fontWeight: 'bold', textShadow: `0 0 8px ${NERVColors.crimson}`, animation: 'blink 0.5s infinite' }}>
          ▲ ANGEL DETECTED ▲
        </span>

        <style>{`
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}</style>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', height: height - 105 }}>
        {/* LEFT COLUMN */}
        <div style={columnStyle(0)}>
          <Psychograph width={leftW} height={200} />
          <SyncRatioLarge width={leftW} height={100} value={syncValue} />
          <StatusGrid
            width={leftW}
            height={150}
            title="PILOT STATUS"
            titleJa="パイロット"
            cells={[
              { label: 'NAME', labelJa: '氏名', value: 'IKARI', status: 'normal' },
              { label: 'UNIT', labelJa: '機体', value: '01', status: 'normal' },
              { label: 'PULSE', labelJa: '脈拍', value: '118bpm', status: 'warning' },
              { label: 'BP', labelJa: '血圧', value: '125/82', status: 'normal' },
              { label: 'POWER', labelJa: '電源', value: '3:47', status: 'warning' },
              { label: 'AT FLD', labelJa: 'A.T.場', value: 'OK', status: 'normal' },
            ]}
          />
        </div>

        {/* CENTER COLUMN */}
        <div style={columnStyle(1)}>
          <TacticalMap width={centerW} height={180} />
          <div style={{ display: 'flex', gap: 5 }}>
            <HexTarget width={centerW / 2 - 2} height={200} />
            <HexSkillCluster width={centerW / 2 - 2} height={200} />
          </div>
          <div style={{ marginTop: 5 }}>
            <MAGIDecision nodes={magiVotes} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={columnStyle(0)}>
          <StatusGrid
            width={rightW}
            height={120}
            title="UNIT STATUS"
            titleJa="機体状況"
            cells={[
              { label: 'UNIT', labelJa: '機体', value: 'EVA-01', status: 'normal' },
              { label: 'TYPE', labelJa: '型式', value: 'TEST', status: 'normal' },
              { label: 'CORE', labelJa: '中核', value: 'OK', status: 'normal' },
              { label: 'BATT', labelJa: '電池', value: '47%', status: 'warning' },
            ]}
          />
          <StatusGrid
            width={rightW}
            height={140}
            title="RESOURCES"
            titleJa="資源"
            cells={[
              { label: 'POWER', labelJa: '電源', value: '3:47', status: 'warning' },
              { label: 'LCL-T', labelJa: '温度', value: '28.4°C', status: 'normal' },
              { label: 'O2', labelJa: '酸素', value: '21.4%', status: 'normal' },
              { label: 'PRESS', labelJa: '気圧', value: '0.87ATM', status: 'warning' },
              { label: 'CO2', labelJa: '炭酸', value: '0.04%', status: 'normal' },
              { label: 'HUMID', labelJa: '湿度', value: '65%', status: 'normal' },
            ]}
          />
          <StatusGrid
            width={rightW}
            height={120}
            title="THREAT ANALYSIS"
            titleJa="脅威分析"
            cells={[
              { label: 'TYPE', labelJa: '種別', value: 'ANGEL', status: 'danger' },
              { label: 'CLASS', labelJa: '階級', value: '04', status: 'danger' },
              { label: 'DIST', labelJa: '距離', value: '2,847m', status: 'normal' },
              { label: 'BEARING', labelJa: '方位', value: '047°', status: 'normal' },
            ]}
          />
        </div>
      </div>

      {/* Footer data stream */}
      <div style={{
        height: 25,
        backgroundColor: NERVColors.terminalBlack,
        borderTop: `2px solid ${NERVColors.crimson}`,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'inline-block',
          color: NERVColors.phosphorGreen,
          fontSize: 9,
          whiteSpace: 'nowrap',
          padding: '4px 0',
          textShadow: `0 0 4px ${NERVColors.phosphorGreen}`,
          animation: 'scroll-left 25s linear infinite',
        }}>
          {`SYNC:${syncValue.toFixed(1)}% | PATTERN:${pattern} | TARGET:LOCK | D:2847m | B:047° | BATT:47% | O2:21.4% | AT:STABLE | PILOT:IKARI | UNIT:01 | ANGEL:04 | MAGI:OK | CONF:94% | `.repeat(2)}
        </div>
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* CRT overlays */}
      <div style={scanlineStyle} />
      <div style={vignetteStyle} />
    </div>
  );
}
