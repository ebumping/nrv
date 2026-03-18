/**
 * NERV Authentic Components Demo
 * 
 * Visual demonstration of all NERV UI components.
 */

import React from 'react';
import { 
  HUDFrame, 
  WaveformMonitor, 
  ContourMap,
  HexagonalCluster,
  generateHexRadial,
  type HexData,
  type ContourNode,
} from '../src/components';
import '../src/styles.css';

// Sample nodes for contour map (agent swarm simulation)
const swarmNodes: ContourNode[] = [
  { id: 'agent-1', x: 0.3, y: 0.4, label: 'A1', pulse: true },
  { id: 'agent-2', x: 0.5, y: 0.3, label: 'A2' },
  { id: 'agent-3', x: 0.7, y: 0.5, label: 'A3', pulse: true },
  { id: 'agent-4', x: 0.4, y: 0.7, label: 'A4' },
  { id: 'agent-5', x: 0.6, y: 0.6, label: 'A5' },
];

// Sample hexes for skill taxonomy
const skillHexes: HexData[] = generateHexRadial(2).map((h, i) => ({
  ...h,
  label: [
    'CORE', 'EXEC', 'MEM', 'NET', 'FILE', 'TERM', 'CODE', 'DATA',
    'WEB', 'API', 'AUTH', 'CRYPT', 'PARSE', 'RENDER', 'SYNC', 'LOG',
    'TEST', 'BUILD', 'DEPLOY', 'MON',
  ][i] || `S${i}`,
  status: i === 0 ? 'active' : i % 4 === 0 ? 'warning' : 'active',
}));

const skillClusters = [
  { id: 'infra', hexIds: ['hex-1', 'hex-2', 'hex-3', 'hex-4'], label: 'INFRASTRUCTURE', color: '#00CCFF' },
  { id: 'dev', hexIds: ['hex-7', 'hex-8', 'hex-9', 'hex-10'], label: 'DEVELOPMENT', color: '#00FF66' },
];

export function NERVAuthenticDemo() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--nerv-bg)',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Page header */}
      <HUDFrame 
        label="NERV UI COMPONENT LIBRARY" 
        labelJp="NERV UI コンポーネントライブラリ"
        color="orange"
        crosshairs
        dashedBorder
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h1 style={{ 
            font: 'var(--nerv-mono-primary)', 
            color: 'var(--nerv-orange)',
            marginBottom: '8px'
          }}>
            AUTHENTIC EVA DESIGN SYSTEM
          </h1>
          <p style={{ color: 'var(--nerv-text-dim)', font: 'var(--nerv-mono-label)' }}>
            Black/White/Red • Orange/Cyan/Green accents • Hexagonal geometry
          </p>
        </div>
      </HUDFrame>
      
      {/* Waveform monitors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <HUDFrame label="SINUSOIDAL MONITOR A" labelJp="正弦波モニター" color="magenta" cornerBrackets>
          <WaveformMonitor 
            waveCount={8}
            color="magenta"
            frequency={2.5}
            amplitude={0.85}
            showGrid
            gridMarker="plus"
            showAxis
            readout="+0:02:1847"
            readoutLabel="± TIME"
            height={140}
          />
        </HUDFrame>
        
        <HUDFrame label="SINUSOIDAL MONITOR B" color="cyan" cornerBrackets>
          <WaveformMonitor 
            waveCount={6}
            color="cyan"
            frequency={1.8}
            amplitude={0.75}
            showGrid
            gridMarker="cross"
            showAxis
            readout="+0:00:9281"
            readoutLabel="± TIME"
            height={140}
          />
        </HUDFrame>
      </div>
      
      {/* Contour Map - Agent Swarm Visualization */}
      <HUDFrame 
        label="AGENT SWARM TOPOLOGY" 
        labelJp="エージェント群トポロジー"
        color="cyan"
        cornerBrackets
      >
        <ContourMap
          height={200}
          contourColor="cyan"
          contourDensity="dense"
          showReferenceGrid
          referenceLineCount={5}
          showAxisScale
          yAxisRange={[-100, 100]}
          cornerReadouts={{
            topLeft: '+ 00312794',
            topRight: '00819652',
            bottomLeft: '- 00327405',
            bottomRight: '+ 00210745',
          }}
          nodes={swarmNodes}
          nodeAnimation="breathe"
          showCrosshairs
          crosshairType="cross"
          interactive
          onNodeClick={(node) => console.log('Clicked:', node)}
        />
      </HUDFrame>
      
      {/* Hexagonal Cluster - Skill Taxonomy */}
      <HUDFrame 
        label="SKILL TAXONOMY MATRIX" 
        labelJp="スキル分類マトリックス"
        color="green"
        cornerBrackets
      >
        <HexagonalCluster
          height={250}
          hexSize={24}
          borderColor="green"
          hexes={skillHexes}
          clusters={skillClusters}
          showLabels
          interactive
          onHexClick={(hex) => console.log('Skill:', hex)}
        />
      </HUDFrame>
      
      {/* Status frames */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <HUDFrame label="SYSTEM STATUS" color="green" cornerBrackets crosshairs crosshairVariant="plus">
          <div style={{ padding: '12px' }}>
            <div style={{ color: 'var(--nerv-green)', marginBottom: '8px', font: 'var(--nerv-mono-data)' }}>
              CORE: ONLINE
            </div>
            <div style={{ color: 'var(--nerv-green)', marginBottom: '8px' }}>
              SYNC RATIO: 98.2%
            </div>
            <div style={{ color: 'var(--nerv-text-dim)' }}>
              UPTIME: 04:32:17
            </div>
          </div>
        </HUDFrame>
        
        <HUDFrame label="WARNING" labelJp="警告" color="amber" cornerBrackets alert alertLevel="warning">
          <div style={{ padding: '12px' }}>
            <div style={{ color: 'var(--nerv-amber)', animation: 'nerv-pulse 1s infinite' }}>
              ELEVATED ACTIVITY DETECTED
            </div>
            <div style={{ color: 'var(--nerv-text-dim)', marginTop: '8px', font: 'var(--nerv-mono-label)' }}>
              SECTOR: G-7
            </div>
          </div>
        </HUDFrame>
        
        <HUDFrame label="CRITICAL" labelJp="緊急" color="red" cornerBrackets alert alertLevel="critical">
          <div style={{ padding: '12px' }}>
            <div style={{ 
              color: 'var(--nerv-red)', 
              animation: 'nerv-strobe 500ms infinite',
              fontWeight: 'bold'
            }}>
              CONTAINMENT BREACH
            </div>
            <div style={{ color: 'var(--nerv-text-dim)', marginTop: '8px' }}>
              LEVEL: 4
            </div>
          </div>
        </HUDFrame>
      </div>
      
      {/* Emergency banner */}
      <HUDFrame 
        label="EMERGENCY ALERT"
        labelJp="非常事態"
        color="red"
        alert
        alertLevel="emergency"
        cornerBrackets
        scanlines
      >
        <div style={{ 
          padding: '24px', 
          textAlign: 'center',
          background: 'linear-gradient(90deg, transparent, rgba(204, 0, 0, 0.1), transparent)',
        }}>
          <div style={{ 
            font: 'var(--nerv-mono-primary)', 
            color: 'var(--nerv-red)',
            fontSize: 'var(--nerv-text-3xl)',
            animation: 'nerv-strobe 500ms infinite',
            marginBottom: '8px'
          }}>
            EMERGENCY
          </div>
          <div style={{ color: 'var(--nerv-text-dim)' }}>
            全都市、第1種戦闘配備
          </div>
        </div>
      </HUDFrame>
      
      {/* Neural pattern at bottom */}
      <HUDFrame label="NEURAL PATTERN ANALYSIS" color="green" cornerBrackets>
        <WaveformMonitor 
          waveCount={10}
          color="green"
          frequency={3}
          amplitude={0.9}
          showGrid
          gridMarker="plus"
          showAxis
          xAxisRange={[-10, 10]}
          readout="SYNC: 98.2%"
          readoutLabel="RATIO"
          height={100}
        />
      </HUDFrame>
    </div>
  );
}

export default NERVAuthenticDemo;
