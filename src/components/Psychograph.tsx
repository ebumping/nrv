import React, { useEffect, useRef, useState, useMemo } from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// PSYCHOGRAPH - Authentic Eva brain wave displays
// 感情 (Emotional) | 理性 (Rational) | 同期 (Sync Pattern)
// ═══════════════════════════════════════════════════════════════════════════════

export type PsychographType = 
  | 'emotional'    // 感情 - Smooth sine waves
  | 'rational'     // 理性 - Noise pattern
  | 'sync'         // 同期 - Spike pattern
  | 'contamination' // 精神汚染 - Chaotic waves
  | 'alpha'        // Alpha wave - 8-12 Hz calm
  | 'beta'         // Beta wave - 13-30 Hz alert
  | 'theta'        // Theta wave - 4-7 Hz drowsy
  | 'gamma'        // Gamma wave - 30+ Hz intense
  | 'flatline'     // Critical - no activity
  | 'burst'        // Neural burst - sudden spikes
  | 'harmonic'     // Harmonic - multiple frequencies
  | 'chaos';       // Chaos - unpredictable

export type PsychographState = 'normal' | 'warning' | 'danger' | 'critical';

export interface PsychographProps {
  /** Type of brain wave pattern */
  type?: PsychographType;
  
  /** Current state (affects color) */
  state?: PsychographState;
  
  /** Label text */
  label?: string;
  
  /** Japanese label */
  labelJa?: string;
  
  /** Show value indicator */
  value?: number;
  
  /** Width */
  width?: string | number;
  
  /** Height */
  height?: number;
  
  /** Animation speed (lower = faster) */
  animationSpeed?: number;
  
  /** Show baseline reference */
  showBaseline?: boolean;
  
  /** Show grid */
  showGrid?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Additional className */
  className?: string;
}

// State colors
const stateColors: Record<PsychographState, string> = {
  normal: NERVColors.phosphorGreen,
  warning: NERVColors.amber,
  danger: NERVColors.crimson,
  critical: '#FF0000',
};

// Wave pattern generators
const waveGenerators = {
  // Smooth sine - emotional stability
  emotional: (frame: number, x: number, width: number): number => {
    const phase = frame * 0.02;
    const primary = Math.sin(phase + x * 0.03) * 12;
    const secondary = Math.sin(phase * 1.5 + x * 0.02) * 6;
    return primary + secondary;
  },
  
  // Noise - active rational processing
  rational: (frame: number, x: number, width: number): number => {
    const seed = frame * 1000 + x;
    const noise = Math.sin(seed * 0.1) * Math.sin(seed * 0.07);
    const envelope = Math.sin(frame * 0.01 + x * 0.01) * 0.5 + 0.5;
    return noise * 15 * envelope;
  },
  
  // Spike - irregular sync
  sync: (frame: number, x: number, width: number): number => {
    const spikeInterval = 60;
    const spikePos = x % spikeInterval;
    const spikePhase = Math.floor(x / spikeInterval);
    
    // Generate spike based on position
    const spikeHeight = Math.sin(spikePhase * 1.7 + frame * 0.05) * 15;
    const spikeWidth = 8;
    
    if (spikePos < spikeWidth) {
      const t = spikePos / spikeWidth;
      return spikeHeight * Math.sin(t * Math.PI);
    }
    return 0;
  },
  
  // Contamination - mental pollution
  contamination: (frame: number, x: number, width: number): number => {
    const chaos1 = Math.sin(frame * 0.015 + x * 0.08);
    const chaos2 = Math.cos(frame * 0.025 + x * 0.12);
    const chaos3 = Math.sin(x * 0.05) * Math.cos(frame * 0.03);
    return (chaos1 + chaos2 + chaos3) * 8;
  },
  
  // Alpha wave - 8-12 Hz calm
  alpha: (frame: number, x: number, width: number): number => {
    const freq = 10; // ~10 Hz
    const primary = Math.sin((frame + x) * freq * 0.008) * 10;
    const modulation = Math.sin(frame * 0.005) * 0.3 + 0.7;
    return primary * modulation;
  },
  
  // Beta wave - 13-30 Hz alert
  beta: (frame: number, x: number, width: number): number => {
    const freq = 20; // ~20 Hz
    const primary = Math.sin((frame + x) * freq * 0.005) * 8;
    const secondary = Math.sin((frame + x) * 25 * 0.004) * 4;
    return primary + secondary;
  },
  
  // Theta wave - 4-7 Hz drowsy
  theta: (frame: number, x: number, width: number): number => {
    const freq = 5; // ~5 Hz
    const primary = Math.sin((frame + x) * freq * 0.015) * 14;
    const slowMod = Math.sin(frame * 0.002) * 0.4 + 0.6;
    return primary * slowMod;
  },
  
  // Gamma wave - 30+ Hz intense
  gamma: (frame: number, x: number, width: number): number => {
    const primary = Math.sin((frame + x) * 35 * 0.003) * 6;
    const secondary = Math.sin((frame + x) * 45 * 0.002) * 4;
    const tertiary = Math.sin((frame + x) * 55 * 0.001) * 2;
    return primary + secondary + tertiary;
  },
  
  // Flatline - critical
  flatline: (frame: number, x: number, width: number): number => {
    const flicker = Math.sin(frame * 0.1) > 0.95 ? Math.random() * 3 : 0;
    return flicker;
  },
  
  // Burst - sudden neural spikes
  burst: (frame: number, x: number, width: number): number => {
    const burstFreq = 0.15;
    const burstPhase = Math.floor(frame * burstFreq) % width;
    const distance = Math.abs(x - burstPhase);
    
    if (distance < 15) {
      const intensity = 1 - distance / 15;
      return Math.sin(distance * 0.5) * 20 * intensity * Math.sin(frame * 0.2);
    }
    return Math.sin(x * 0.05 + frame * 0.01) * 3;
  },
  
  // Harmonic - multiple frequencies
  harmonic: (frame: number, x: number, width: number): number => {
    const fund = Math.sin((frame + x * 0.5) * 0.02) * 10;
    const harmonic2 = Math.sin((frame + x * 0.5) * 0.04) * 5;
    const harmonic3 = Math.sin((frame + x * 0.5) * 0.06) * 3;
    const harmonic4 = Math.sin((frame + x * 0.5) * 0.08) * 2;
    return fund + harmonic2 + harmonic3 + harmonic4;
  },
  
  // Chaos - unpredictable
  chaos: (frame: number, x: number, width: number): number => {
    const lorenz = (t: number) => {
      const sigma = 10;
      const rho = 28;
      const beta = 8/3;
      return sigma * (Math.sin(t * 0.1) - Math.cos(t * 0.2));
    };
    return lorenz(frame + x) * 0.8 + Math.sin(frame * 0.1 + x * 0.05) * 8;
  },
};

export function Psychograph({
  type = 'emotional',
  state = 'normal',
  label,
  labelJa,
  value,
  width = '100%',
  height = 50,
  animationSpeed = 50,
  showBaseline = true,
  showGrid = false,
  compact = false,
  className,
}: PsychographProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [frame, setFrame] = useState(0);
  
  const color = stateColors[state];
  
  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      
      if (delta >= animationSpeed) {
        setFrame(f => f + 1);
        lastTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [animationSpeed]);
  
  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const centerY = h / 2;
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < h; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
    
    // Baseline
    if (showBaseline) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Wave
    const generator = waveGenerators[type];
    
    ctx.strokeStyle = color;
    ctx.lineWidth = state === 'critical' ? 2 : 1.5;
    ctx.beginPath();
    
    for (let x = 0; x < w; x += 2) {
      const y = centerY - generator(frame, x, w);
      const clampedY = Math.max(2, Math.min(h - 2, y));
      
      if (x === 0) {
        ctx.moveTo(x, clampedY);
      } else {
        ctx.lineTo(x, clampedY);
      }
    }
    
    ctx.stroke();
    
    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Danger flash
    if (state === 'critical' || state === 'danger') {
      const flash = Math.sin(frame * 0.2) > 0;
      if (flash) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
    
  }, [frame, type, state, color, showBaseline, showGrid, height]);
  
  const labelData = useMemo(() => {
    const labels: Record<PsychographType, { en: string; ja: string }> = {
      emotional: { en: 'EMOTIONAL', ja: '感情' },
      rational: { en: 'RATIONAL', ja: '理性' },
      sync: { en: 'SYNC PATTERN', ja: '同期' },
      contamination: { en: 'CONTAMINATION', ja: '精神汚染' },
      alpha: { en: 'ALPHA WAVE', ja: 'α波' },
      beta: { en: 'BETA WAVE', ja: 'β波' },
      theta: { en: 'THETA WAVE', ja: 'θ波' },
      gamma: { en: 'GAMMA WAVE', ja: 'γ波' },
      flatline: { en: 'FLATLINE', ja: '停止' },
      burst: { en: 'NEURAL BURST', ja: '神経発火' },
      harmonic: { en: 'HARMONIC', ja: '調波' },
      chaos: { en: 'CHAOS', ja: '混沌' },
    };
    return labels[type];
  }, [type]);
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#000000',
    border: `1px solid ${NERVColors.white}`,
    padding: compact ? 4 : 8,
    marginBottom: 8,
    fontFamily: "'Courier New', monospace",
  };
  
  return (
    <div style={containerStyle} className={className}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? 2 : 4,
        fontSize: compact ? 8 : 9,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: NERVColors.textDim }}>
            {label || labelData.en}
          </span>
          <span style={{ color: NERVColors.phosphorGreen }}>
            {labelJa || labelData.ja}
          </span>
        </div>
        {value !== undefined && (
          <span style={{
            color,
            fontWeight: 'bold',
            textShadow: `0 0 4px ${color}`,
          }}>
            {value}%
          </span>
        )}
      </div>
      
      {/* Wave display */}
      <div style={{ width, height, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PSYCHOGRAPH PANEL - Combined emotional/rational/sync display
// ═══════════════════════════════════════════════════════════════════════════════

export interface PsychographPanelProps {
  /** Pilot name */
  pilotName?: string;
  
  /** Pilot name (Japanese) */
  pilotNameJa?: string;
  
  /** Sync ratio */
  syncRatio?: number;
  
  /** Emotional state 0-100 */
  emotionalValue?: number;
  
  /** Rational state 0-100 */
  rationalValue?: number;
  
  /** Contamination level 0-100 */
  contaminationLevel?: number;
  
  /** Overall state */
  state?: PsychographState;
  
  /** Height */
  height?: number;
  
  /** Compact mode */
  compact?: boolean;
}

export function PsychographPanel({
  pilotName = 'SHINJI',
  pilotNameJa = 'シンジ',
  syncRatio = 94.2,
  emotionalValue = 78,
  rationalValue = 92,
  contaminationLevel = 12.3,
  state = 'normal',
  height = 180,
  compact = false,
}: PsychographPanelProps) {
  const waveHeight = compact ? 30 : 40;
  
  // Determine individual states based on values
  const emotionalState = emotionalValue > 80 ? 'normal' : emotionalValue > 50 ? 'warning' : 'danger';
  const rationalState = rationalValue > 85 ? 'normal' : rationalValue > 60 ? 'warning' : 'danger';
  const syncState = syncRatio > 100 ? 'warning' : syncRatio > 50 ? 'normal' : 'danger';
  const contaminationState = contaminationLevel < 30 ? 'normal' : contaminationLevel < 60 ? 'warning' : 'danger';
  
  return (
    <div style={{
      backgroundColor: '#000',
      border: `1px solid ${NERVColors.white}`,
      padding: compact ? 4 : 8,
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${NERVColors.borderMid}`,
        paddingBottom: 4,
        marginBottom: 8,
      }}>
        <div>
          <span style={{ color: NERVColors.amber, fontSize: 11, fontWeight: 'bold' }}>
            PILOT: {pilotName}
          </span>
          <span style={{ color: NERVColors.textDim, fontSize: 9, marginLeft: 8 }}>
            {pilotNameJa}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: stateColors[syncState], fontSize: 16, fontWeight: 'bold' }}>
            {syncRatio.toFixed(1)}%
          </div>
          <div style={{ color: NERVColors.textDim, fontSize: 8 }}>
            SYNC RATE / 同期率
          </div>
        </div>
      </div>
      
      {/* Psychographs */}
      <Psychograph
        type="emotional"
        state={emotionalState}
        value={emotionalValue}
        height={waveHeight}
        compact={compact}
      />
      
      <Psychograph
        type="rational"
        state={rationalState}
        value={rationalValue}
        height={waveHeight}
        compact={compact}
      />
      
      <Psychograph
        type="sync"
        state={syncState}
        label="SYNC PATTERN"
        labelJa="同期パターン"
        height={waveHeight}
        compact={compact}
      />
      
      {/* Contamination gauge */}
      <div style={{
        marginTop: 8,
        padding: '4px 8px',
        border: `1px solid ${stateColors[contaminationState]}`,
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          marginBottom: 4,
        }}>
          <span style={{ color: NERVColors.textDim }}>
            CONTAMINATION / 精神汚染
          </span>
          <span style={{
            color: stateColors[contaminationState],
            fontWeight: 'bold',
          }}>
            {contaminationLevel.toFixed(1)}%
          </span>
        </div>
        <div style={{
          height: 6,
          backgroundColor: NERVColors.borderMid,
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${contaminationLevel}%`,
            backgroundColor: stateColors[contaminationState],
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }} />
          {/* Threshold markers */}
          <div style={{
            position: 'absolute',
            left: '30%',
            top: -2,
            bottom: -2,
            width: 1,
            background: NERVColors.amber,
          }} />
          <div style={{
            position: 'absolute',
            left: '60%',
            top: -2,
            bottom: -2,
            width: 1,
            background: NERVColors.crimson,
          }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EEG DISPLAY - Multi-channel brain wave display
// ═══════════════════════════════════════════════════════════════════════════════

export interface EEGDisplayProps {
  /** Number of channels */
  channels?: number;
  
  /** Active channels */
  activeChannels?: number[];
  
  /** Danger channels */
  dangerChannels?: number[];
  
  /** Height */
  height?: number;
}

export function EEGDisplay({
  channels = 6,
  activeChannels = [0, 1, 2],
  dangerChannels = [],
  height = 120,
}: EEGDisplayProps) {
  const channelHeight = height / channels;
  const channelNames = ['Fp1', 'Fp2', 'C3', 'C4', 'O1', 'O2'];
  const waveTypes: PsychographType[] = ['alpha', 'beta', 'alpha', 'gamma', 'alpha', 'beta'];
  
  return (
    <div style={{
      backgroundColor: '#000',
      border: `1px solid ${NERVColors.white}`,
      padding: 4,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 9,
        marginBottom: 4,
        borderBottom: `1px solid ${NERVColors.borderMid}`,
        paddingBottom: 4,
      }}>
        <span style={{ color: NERVColors.amber }}>EEG // 脳波</span>
        <span style={{ color: NERVColors.textDim }}>
          {channels}CH | {activeChannels.length} ACTIVE
        </span>
      </div>
      
      <div style={{ position: 'relative', height }}>
        {Array.from({ length: channels }, (_, i) => {
          const isActive = activeChannels.includes(i);
          const isDanger = dangerChannels.includes(i);
          const state = isDanger ? 'danger' : isActive ? 'normal' : 'warning';
          
          return (
            <div key={i} style={{
              position: 'absolute',
              top: i * channelHeight,
              left: 0,
              right: 0,
              height: channelHeight,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              {/* Channel label */}
              <span style={{
                position: 'absolute',
                left: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                color: stateColors[state],
                fontSize: 8,
                fontWeight: 'bold',
                zIndex: 1,
              }}>
                {channelNames[i] || `CH${i + 1}`}
              </span>
              
              {/* Wave */}
              <Psychograph
                type={waveTypes[i] || 'alpha'}
                state={state}
                height={channelHeight - 4}
                showBaseline={false}
                compact
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Psychograph;
ENDOFFILE; __hermes_rc=$?; printf '__HERMES_FENCE_a9f7b3__'; exit $__hermes_rc
