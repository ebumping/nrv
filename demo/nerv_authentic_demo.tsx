/**
 * ═══════════════════════════════════════════════════════════════════════
 * NERV CENTRAL DOGMA — COMMAND CENTER DISPLAY
 * 第壱種戦闘配備 ・ FIRST STAGE BATTLE STATIONS
 * ═══════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  // Core frames & layout
  HUDFrame,
  CRTOverlay,

  // Waveforms & monitors
  WaveformMonitor,
  ContourMap,
  type ContourNode,

  // Hex systems
  HexagonalCluster,
  generateHexRadial,
  type HexData,
  HexagonalTarget,

  // NERV panels
  NERVPanel,
  StatusReadout,
  SyncRatio,
  MAGIDecision,
  DataStream,
  NERVColors,

  // Advanced displays
  Psychograph,
  TacticalMap,
  StatusGrid,
  SyncRatioLarge,
  PatternIndicator,
  HexTarget,

  // Radar
  RadarDisplay,
  SonarDisplay,

  // Wireframe
  WireframeTerrain,
  RadarSweep,

  // Effects
  DataStream as DataStreamTicker,

  // Alerts
  AlertProvider,
  ContaminationGauge,

  // Typography & HUD primitives
  DataReadout,
  Crosshair,
  StatusIndicator,
  HUDProgress,
  Blink,
} from '../src';

// Also import the standalone AlertBanner with chevrons
import { AlertBanner as ChevronAlertBanner } from '../src/components/AlertBanner';
// Standalone Psychograph with multiple types
import { Psychograph as PsychographWave } from '../src/components/Psychograph';

import '../src/styles.css';

// ─── DATA ────────────────────────────────────────────────────────────────────

const swarmNodes: ContourNode[] = [
  { id: 'agent-1', x: 0.2, y: 0.3, label: 'A1', pulse: true },
  { id: 'agent-2', x: 0.4, y: 0.2, label: 'A2' },
  { id: 'agent-3', x: 0.6, y: 0.4, label: 'A3', pulse: true },
  { id: 'agent-4', x: 0.3, y: 0.6, label: 'A4' },
  { id: 'agent-5', x: 0.7, y: 0.55, label: 'A5' },
  { id: 'agent-6', x: 0.8, y: 0.2, label: 'A6', pulse: true },
  { id: 'agent-7', x: 0.15, y: 0.75, label: 'A7' },
];

const skillHexes: HexData[] = generateHexRadial(2).map((h, i) => ({
  ...h,
  label: [
    'CORE', 'EXEC', 'MEM', 'NET', 'FILE', 'TERM', 'CODE', 'DATA',
    'WEB', 'API', 'AUTH', 'CRYPT', 'PARSE', 'RENDER', 'SYNC', 'LOG',
    'TEST', 'BUILD', 'DEPLOY', 'MON',
  ][i] || `S${i}`,
  status: i === 0 ? 'active' : i % 5 === 0 ? 'warning' : i % 7 === 0 ? 'critical' : 'active',
}));

const skillClusters = [
  { id: 'infra', hexIds: ['hex-1', 'hex-2', 'hex-3', 'hex-4'], label: 'INFRASTRUCTURE', color: '#00CCFF' },
  { id: 'dev', hexIds: ['hex-7', 'hex-8', 'hex-9', 'hex-10'], label: 'DEVELOPMENT', color: '#00FF66' },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#000',
  fontFamily: "'Share Tech Mono', 'Courier New', monospace",
  overflowX: 'hidden',
};

const GRID_3COL: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '2px',
};

const GRID_2COL: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2px',
};

const GRID_ASYM_LEFT: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '2px',
};

const GRID_ASYM_RIGHT: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 2fr',
  gap: '2px',
};

const CELL: React.CSSProperties = {
  padding: '0',
  overflow: 'hidden',
  position: 'relative',
  minWidth: 0,
};

const SPACER_2: React.CSSProperties = { height: '2px' };

// ─── LIVE CLOCK ──────────────────────────────────────────────────────────────

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatTime(d: Date) {
  return d.toTimeString().split(' ')[0];
}

// ─── SCROLLING DATA FEED ─────────────────────────────────────────────────────

function DataFeed({ entries, color = '#39FF14' }: { entries: string[]; color?: string }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset(o => (o + 1) % entries.length);
    }, 2000);
    return () => clearInterval(id);
  }, [entries.length]);

  const visible = entries.slice(offset, offset + 6).concat(
    entries.slice(0, Math.max(0, offset + 6 - entries.length))
  );

  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, lineHeight: '16px', overflow: 'hidden' }}>
      {visible.map((entry, i) => (
        <div key={`${offset}-${i}`} style={{
          color: i === 0 ? color : `${color}88`,
          textShadow: i === 0 ? `0 0 4px ${color}` : 'none',
          opacity: 1 - (i * 0.12),
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {entry}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN DEMO ───────────────────────────────────────────────────────────────

export function NERVAuthenticDemo() {
  const clock = useClock();
  const [syncValue, setSyncValue] = useState(94.2);
  const [contamination, setContamination] = useState(12);

  // Slowly drift values for realism
  useEffect(() => {
    const id = setInterval(() => {
      setSyncValue(v => {
        const next = v + (Math.random() - 0.48) * 0.3;
        return Math.max(85, Math.min(99.9, next));
      });
      setContamination(c => {
        const next = c + (Math.random() - 0.5) * 0.8;
        return Math.max(0, Math.min(100, next));
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const logEntries = [
    `${formatTime(clock)} SYS.CORE: NOMINAL`,
    `${formatTime(clock)} A.T.FIELD: PHASE SPACE STABLE`,
    `${formatTime(clock)} MAGI.01: POLLING COMPLETE`,
    `${formatTime(clock)} SYNC.RATE: ${syncValue.toFixed(1)}%`,
    `${formatTime(clock)} PATTERN: BLUE — MONITORING`,
    `${formatTime(clock)} LCL.DEPTH: 847M — NOMINAL`,
    `${formatTime(clock)} CAGE.07: UMBILICAL CONNECTED`,
    `${formatTime(clock)} PRIBNOW.BOX: CLEAR`,
    `${formatTime(clock)} PWR.GRID: 98.2% CAPACITY`,
    `${formatTime(clock)} ENTRY.PLUG: PHASE 2 COMPLETE`,
    `${formatTime(clock)} THAL.NERVE: RESPONSE NORMAL`,
    `${formatTime(clock)} EVA-01: READY STATE`,
  ];

  return (
    <AlertProvider>
      <CRTOverlay scanlines vignette scanLine>
        <div style={PAGE}>

          {/* ═══ TOP ALERT STRIP ═══ */}
          <ChevronAlertBanner
            level="danger"
            label="EMERGENCY"
            labelJp="非常事態"
            chevronPattern
            chevronSpeed={800}
            strobe
          />

          {/* ═══ STATUS TICKER ═══ */}
          <DataStream speed="fast" />

          {/* ═══ TOP HEADER BAR ═══ */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 12px',
            borderBottom: '1px solid #1A1A1A',
            background: '#050505',
          }}>
            <span style={{ color: '#FF6600', fontSize: 11, letterSpacing: 3, fontWeight: 'bold' }}>
              NERV — CENTRAL DOGMA
            </span>
            <span style={{ color: '#666', fontSize: 9, letterSpacing: 1 }}>
              第3新東京市 地下特務機関
            </span>
            <span style={{ color: '#39FF14', fontSize: 11, fontFamily: "'Courier New', monospace", textShadow: '0 0 4px #39FF14' }}>
              {formatTime(clock)}
            </span>
          </div>

          {/* ═══ PATTERN INDICATOR ═══ */}
          <div style={{ overflow: 'hidden' }}>
            <PatternIndicator pattern="BLUE" alert="ANGEL DETECTED — SECTOR G-7" width={9999} />
          </div>

          {/* ═══ ROW 1: WAVEFORMS + CONTOUR ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            {/* Sinusoidal Monitor A */}
            <div style={CELL}>
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
                  height={110}
                />
              </HUDFrame>
            </div>

            {/* Sinusoidal Monitor B */}
            <div style={CELL}>
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
                  height={110}
                />
              </HUDFrame>
            </div>

            {/* Neural pattern C */}
            <div style={CELL}>
              <HUDFrame label="A.T. FIELD HARMONICS" labelJp="ATフィールド" color="green" cornerBrackets>
                <WaveformMonitor
                  waveCount={12}
                  color="green"
                  frequency={3.2}
                  amplitude={0.7}
                  showGrid
                  gridMarker="plus"
                  showAxis
                  readout="SYNC: 98.2%"
                  readoutLabel="RATIO"
                  height={110}
                />
              </HUDFrame>
            </div>
          </div>

          {/* ═══ ROW 2: CONTOUR MAP (FULL WIDTH) ═══ */}
          <div style={SPACER_2} />
          <HUDFrame
            label="AGENT SWARM TOPOLOGY"
            labelJp="エージェント群トポロジー"
            color="cyan"
            cornerBrackets
          >
            <ContourMap
              height={300}
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
            />
          </HUDFrame>

          {/* ═══ ROW 3: THREE COLUMN — RADAR / MAGI / SONAR ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            {/* Radar */}
            <div style={CELL}>
              <HUDFrame label="RADAR — 5KM RANGE" labelJp="レーダー" color="green" cornerBrackets>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <RadarDisplay
                    size={200}
                    targets={[
                      { id: '1', angle: 47, distance: 60, type: 'hostile', label: 'ANGEL' },
                      { id: '2', angle: 180, distance: 30, type: 'friendly', label: 'EVA-01' },
                      { id: '3', angle: 225, distance: 45, type: 'friendly', label: 'EVA-02' },
                      { id: '4', angle: 310, distance: 75, type: 'unknown', label: 'UNK-1' },
                    ]}
                    sweepSpeed={3}
                    rangeLabel="5 KM"
                  />
                </div>
              </HUDFrame>
            </div>

            {/* MAGI Decision */}
            <div style={CELL}>
              <NERVPanel title="MAGI SYSTEM" titleJa="三賢人">
                <MAGIDecision
                  nodes={{
                    caspar: { vote: 'accept' },
                    melchior: { vote: 'accept' },
                    balthasar: { vote: 'reject' },
                  }}
                />
              </NERVPanel>
            </div>

            {/* Sonar */}
            <div style={CELL}>
              <HUDFrame label="SONAR ARRAY" labelJp="ソナー配列" color="cyan" cornerBrackets>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <SonarDisplay
                    size={200}
                    pings={[
                      { angle: 90, distance: 40, intensity: 0.8 },
                      { angle: 200, distance: 70, intensity: 0.5 },
                      { angle: 320, distance: 30, intensity: 0.9 },
                    ]}
                    pingInterval={2500}
                  />
                </div>
              </HUDFrame>
            </div>
          </div>

          {/* ═══ ROW 4: PSYCHOGRAPH / HEX TARGET / STATUS ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            {/* Psychograph channels */}
            <div style={CELL}>
              <NERVPanel title="PSYCHOGRAPH" titleJa="精神グラフ">
                <Psychograph width={600} height={220} />
              </NERVPanel>
            </div>

            {/* Hexagonal targeting */}
            <div style={CELL}>
              <HUDFrame label="TARGET ACQUISITION" labelJp="目標捕捉" color="orange" cornerBrackets>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                  <HexagonalTarget size={200} />
                </div>
              </HUDFrame>
            </div>

            {/* Status + Sync + Data */}
            <div style={CELL}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%' }}>
                <NERVPanel title="PILOT STATUS" titleJa="パイロット状態">
                  <StatusReadout
                    data={[
                      { label: 'HEART RATE', labelJa: '心拍', value: '78', unit: 'BPM', status: 'normal' },
                      { label: 'SYNC RATE', labelJa: '同期率', value: `${syncValue.toFixed(1)}%`, status: 'normal' },
                      { label: 'MENTAL', labelJa: '精神', value: 'STABLE', status: 'normal' },
                      { label: 'LCL O₂', labelJa: '酸素', value: '98.7%', status: 'normal' },
                    ]}
                    columns={2}
                  />
                </NERVPanel>
                <NERVPanel title="CONTAMINATION" titleJa="精神汚染度">
                  <ContaminationGauge
                    value={contamination}
                    warningThreshold={30}
                    dangerThreshold={60}
                  />
                </NERVPanel>
              </div>
            </div>
          </div>

          {/* ═══ ROW 5: TACTICAL + SYNC + HEX MATRIX ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            {/* Wireframe terrain */}
            <div style={CELL}>
              <HUDFrame label="GEOFRONT — TACTICAL" labelJp="ジオフロント" color="amber" cornerBrackets>
                <WireframeTerrain
                  width={600}
                  height={240}
                  gridDensity={12}
                  showContours
                  blips={[
                    { id: 'eva01', x: 150, y: 120, type: 'friendly', label: 'EVA-01' },
                    { id: 'angel', x: 280, y: 80, type: 'hostile', label: 'TARGET' },
                  ]}
                />
              </HUDFrame>
            </div>

            {/* Sync ratio + status grid */}
            <div style={CELL}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%' }}>
                <NERVPanel title="SYNC RATIO" titleJa="同期率">
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px' }}>
                    <SyncRatio value={syncValue} />
                  </div>
                </NERVPanel>
                <NERVPanel title="SUBSYSTEMS" titleJa="サブシステム">
                  <StatusGrid
                    width={300}
                    height={80}
                    title="EVA-01"
                    titleJa="初号機"
                    cells={[
                      { label: 'REACTOR', value: 'NOMINAL', status: 'normal' },
                      { label: 'WEAPONS', value: 'ARMED', status: 'normal' },
                      { label: 'A.T.FIELD', value: 'ACTIVE', status: 'normal' },
                      { label: 'UMBILICAL', value: 'CONN.', status: 'normal' },
                      { label: 'COOLANT', value: 'WARNING', status: 'warning' },
                      { label: 'ENTRY PLUG', value: 'PHASE 2', status: 'normal' },
                    ]}
                  />
                </NERVPanel>
              </div>
            </div>

            {/* Skill hex matrix */}
            <div style={CELL}>
              <HUDFrame label="SKILL TAXONOMY" labelJp="スキル分類" color="green" cornerBrackets>
                <HexagonalCluster
                  height={210}
                  hexSize={22}
                  borderColor="green"
                  hexes={skillHexes}
                  clusters={skillClusters}
                  showLabels
                  interactive
                />
              </HUDFrame>
            </div>
          </div>

          {/* ═══ ROW 6: DATA READOUTS + SYNC LARGE + RADAR SWEEP ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            {/* Dense data readouts */}
            <div style={CELL}>
              <NERVPanel title="SYSTEM TELEMETRY" titleJa="テレメトリー">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px' }}>
                  <DataReadout label="CORE TEMP" value="2,847°K" status="normal" />
                  <DataReadout label="PRESSURE" value="101.3 kPa" status="normal" />
                  <DataReadout label="RADIATION" value="0.3 mSv" status="normal" />
                  <DataReadout label="DEPTH" value="847m" status="normal" />
                  <DataReadout label="PWR REMAIN" value="04:32:17" status="warning" />
                  <DataReadout label="AT DENSITY" value="1.2×10³" status="normal" />
                </div>
              </NERVPanel>
            </div>

            {/* Sync ratio large display */}
            <div style={CELL}>
              <NERVPanel title="SYNC RATIO — LARGE" titleJa="同期率表示">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                  <SyncRatioLarge value={syncValue} width={580} height={80} />
                </div>
              </NERVPanel>
            </div>

            {/* Radar sweep mini */}
            <div style={CELL}>
              <HUDFrame label="SECTOR SWEEP" labelJp="セクター掃引" color="green" cornerBrackets>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
                  <RadarSweep
                    size={160}
                    contacts={[
                      { angle: 45, distance: 60, type: 'hostile' },
                      { angle: 180, distance: 35, type: 'friendly' },
                      { angle: 270, distance: 80, type: 'unknown' },
                    ]}
                  />
                </div>
              </HUDFrame>
            </div>
          </div>

          {/* ═══ ROW 7: EEG CHANNELS (FULL WIDTH) ═══ */}
          <div style={SPACER_2} />
          <HUDFrame label="NEURAL PATTERN ANALYSIS — EEG" labelJp="脳波パターン解析" color="green" cornerBrackets>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px' }}>
              {[
                { type: 'emotional' as const, label: 'AMYGDALA', labelJa: '扁桃体', state: 'normal' as const },
                { type: 'rational' as const, label: 'HIPPOCAMPUS', labelJa: '海馬', state: 'normal' as const },
                { type: 'sync' as const, label: 'PARIETAL LOBE', labelJa: '頭頂葉', state: 'warning' as const },
                { type: 'alpha' as const, label: 'MOTOR CORTEX', labelJa: '運動皮質', state: 'normal' as const },
                { type: 'beta' as const, label: 'SENSORY CORTEX', labelJa: '感覚皮質', state: 'normal' as const },
              ].map((ch, i) => (
                <div key={i} style={{
                  borderRight: i < 4 ? '1px solid #1A1A1A' : 'none',
                  background: i % 2 === 0 ? '#060610' : '#0A0A06',
                }}>
                  <PsychographWave
                    type={ch.type}
                    state={ch.state}
                    label={ch.label}
                    labelJa={ch.labelJa}
                    height={70}
                    showBaseline
                    showGrid
                    compact
                  />
                </div>
              ))}
            </div>
          </HUDFrame>

          {/* ═══ ROW 8: HUD PRIMITIVES + LOG FEED ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            {/* Status indicators */}
            <div style={CELL}>
              <NERVPanel title="SYSTEM HEALTH" titleJa="システム状態">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px' }}>
                  <StatusIndicator label="MAGI" status="online" />
                  <StatusIndicator label="SYNC LINK" status="online" />
                  <StatusIndicator label="A.T. FIELD" status="warning" />
                  <StatusIndicator label="COOLANT" status="error" />
                  <StatusIndicator label="EXT POWER" status="online" />
                </div>
              </NERVPanel>
            </div>

            {/* Progress bars */}
            <div style={CELL}>
              <NERVPanel title="RESOURCE ALLOCATION" titleJa="リソース配分">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  <HUDProgress value={0.94} label="SYNC RATE" />
                  <HUDProgress value={0.72} label="POWER OUTPUT" color="#FFAA00" />
                  <HUDProgress value={0.35} label="COOLANT LEVEL" color="#DC143C" />
                  <HUDProgress value={0.88} label="LIFE SUPPORT" />
                  <HUDProgress value={0.61} label="AMMUNITION" color="#FFAA00" />
                </div>
              </NERVPanel>
            </div>

            {/* Live log feed */}
            <div style={CELL}>
              <NERVPanel title="SYSTEM LOG" titleJa="システムログ">
                <DataFeed entries={logEntries} color="#39FF14" />
              </NERVPanel>
            </div>
          </div>

          {/* ═══ ROW 9: CROSSHAIRS + HEX TARGET SMALL + TACTICAL MAP ═══ */}
          <div style={SPACER_2} />
          <div style={GRID_3COL}>
            <div style={CELL}>
              <HUDFrame label="TARGETING SYSTEM" labelJp="照準" color="orange" cornerBrackets crosshairs crosshairVariant="plus">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px', gap: '24px' }}>
                  <Crosshair size={100} color="#FF6600" variant="target" animated />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: '#FF6600', fontSize: 10, letterSpacing: 2 }}>TARGET: 5th ANGEL</div>
                    <div style={{ color: '#666', fontSize: 9 }}>DIST: 2,847m</div>
                    <div style={{ color: '#666', fontSize: 9 }}>BEAR: 047°</div>
                    <div style={{ color: '#FF0000', fontSize: 10, fontWeight: 'bold' }}>
                      <Blink interval={500}>▲ LOCK ON ▲</Blink>
                    </div>
                  </div>
                </div>
              </HUDFrame>
            </div>

            <div style={CELL}>
              <NERVPanel title="TARGET PROFILE" titleJa="ターゲット情報">
                <HexTarget
                  width={300}
                  height={170}
                  targetName="ANGEL-05"
                  distance="2,847m"
                  bearing="047°"
                />
              </NERVPanel>
            </div>

            <div style={CELL}>
              <NERVPanel title="TACTICAL MAP" titleJa="戦術マップ">
                <TacticalMap width={600} height={200} />
              </NERVPanel>
            </div>
          </div>

          {/* ═══ BOTTOM TICKER ═══ */}
          <div style={SPACER_2} />
          <DataStream speed="normal" />

          {/* ═══ BOTTOM ALERT ═══ */}
          <ChevronAlertBanner
            level="critical"
            label="第壱種戦闘配備"
            labelJp="FIRST STAGE BATTLE STATIONS"
            chevronPattern
            chevronSpeed={600}
            strobe
          />

        </div>
      </CRTOverlay>
    </AlertProvider>
  );
}

export default NERVAuthenticDemo;
