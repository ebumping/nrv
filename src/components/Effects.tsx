import React, { useState, useEffect } from 'react';
import { NERVColors } from './NERVPanel';

// ═══════════════════════════════════════════════════════════════════════════════
// CRT SCREEN EFFECTS - Scanlines, vignette, phosphor bloom, flicker
// These give the authentic CRT monitor feel from the 90s anime
// ═══════════════════════════════════════════════════════════════════════════════

export const CRTEffectsCSS = `
/* ═══════════════════════════════════════════════════════════════════════════════
   NERV CRT EFFECTS - Inject these styles into your app
   ═══════════════════════════════════════════════════════════════════════════════ */

/* Scanlines - subtle horizontal lines like CRT monitors */
.nerv-crt-scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.04) 2px,
    rgba(0, 0, 0, 0.04) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

/* Vignette - darkened edges like curved CRT screen */
.nerv-crt-vignette {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 80%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
  z-index: 9998;
}

/* Subtle screen flicker - barely perceptible */
@keyframes nerv-flicker {
  0% { opacity: 0.97; }
  3% { opacity: 1; }
  6% { opacity: 0.98; }
  9% { opacity: 1; }
  12% { opacity: 0.99; }
  100% { opacity: 1; }
}

.nerv-crt-flicker {
  animation: nerv-flicker 0.1s infinite;
}

/* Phosphor glow for text */
.nerv-glow-amber {
  text-shadow: 
    0 0 4px ${NERVColors.amber},
    0 0 8px ${NERVColors.amber};
}

.nerv-glow-green {
  text-shadow: 
    0 0 4px ${NERVColors.phosphorGreen},
    0 0 8px ${NERVColors.phosphorGreen};
}

.nerv-glow-cyan {
  text-shadow: 
    0 0 4px ${NERVColors.phosphorCyan},
    0 0 8px ${NERVColors.phosphorCyan};
}

.nerv-glow-crimson {
  text-shadow: 
    0 0 4px ${NERVColors.crimson},
    0 0 8px ${NERVColors.crimson};
}

/* Blinking cursor */
@keyframes nerv-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.nerv-blink {
  animation: nerv-blink 1s step-end infinite;
}

/* Alert flash */
@keyframes nerv-alert-flash {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.3; }
}

.nerv-alert-flash {
  animation: nerv-alert-flash 0.5s step-end infinite;
}

/* Pulse glow */
@keyframes nerv-pulse {
  0%, 100% { 
    opacity: 1;
    filter: brightness(1);
  }
  50% { 
    opacity: 0.7;
    filter: brightness(0.8);
  }
}

.nerv-pulse {
  animation: nerv-pulse 2s ease-in-out infinite;
}

/* Scan line moving down screen */
@keyframes nerv-scan-line {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}

.nerv-scan-line {
  position: fixed;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 140, 0, 0.1),
    rgba(255, 140, 0, 0.2),
    rgba(255, 140, 0, 0.1),
    transparent
  );
  animation: nerv-scan-line 8s linear infinite;
  pointer-events: none;
  z-index: 10000;
}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRANCE ANIMATION WRAPPER - Static noise, typewriter, slide-in
// ═══════════════════════════════════════════════════════════════════════════════

interface NERVEntranceProps {
  children: React.ReactNode;
  type?: 'static' | 'typewriter' | 'slide-left' | 'slide-right' | 'fade';
  delay?: number;
  duration?: number;
}

export function NERVEntrance({ 
  children, 
  type = 'fade', 
  delay = 0,
  duration = 500 
}: NERVEntranceProps) {
  const [phase, setPhase] = useState<'hidden' | 'animating' | 'visible'>('hidden');
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('animating');
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  useEffect(() => {
    if (phase === 'animating' && type === 'typewriter') {
      // Extract text from children (simple case)
      const text = typeof children === 'string' ? children : '';
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setPhase('visible');
        }
      }, duration / text.length);
      
      return () => clearInterval(interval);
    } else if (phase === 'animating') {
      const timer = setTimeout(() => setPhase('visible'), duration);
      return () => clearTimeout(timer);
    }
  }, [phase, type, children, duration]);
  
  const getStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transition: `all ${duration}ms ease-out`,
    };
    
    switch (type) {
      case 'static':
        // Handled separately with NERVStaticNoise
        return phase === 'visible' 
          ? { ...baseStyle, opacity: 1 }
          : { ...baseStyle, opacity: 0 };
      case 'slide-left':
        return phase === 'visible'
          ? { ...baseStyle, transform: 'translateX(0)', opacity: 1 }
          : { ...baseStyle, transform: 'translateX(-50px)', opacity: 0 };
      case 'slide-right':
        return phase === 'visible'
          ? { ...baseStyle, transform: 'translateX(0)', opacity: 1 }
          : { ...baseStyle, transform: 'translateX(50px)', opacity: 0 };
      case 'typewriter':
        return { ...baseStyle, opacity: 1 };
      default:
        return phase === 'visible'
          ? { ...baseStyle, opacity: 1 }
          : { ...baseStyle, opacity: 0 };
    }
  };
  
  if (type === 'typewriter' && typeof children === 'string') {
    return (
      <span style={getStyle()}>
        {displayedText}
        {phase === 'animating' && (
          <span style={{ 
            borderLeft: `2px solid ${NERVColors.amber}`,
            paddingLeft: 2,
            animation: 'nerv-blink 0.5s step-end infinite'
          }} />
        )}
      </span>
    );
  }
  
  return <div style={getStyle()}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC NOISE OVERLAY - TV static effect for boot sequences
// ═══════════════════════════════════════════════════════════════════════════════

interface StaticNoiseProps {
  duration?: number;
  onComplete?: () => void;
  active?: boolean;
}

export function StaticNoise({ duration = 300, onComplete, active = true }: StaticNoiseProps) {
  const [opacity, setOpacity] = useState(active ? 1 : 0);
  
  useEffect(() => {
    if (active) {
      setOpacity(1);
      const timer = setTimeout(() => {
        setOpacity(0);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);
  
  if (opacity === 0) return null;
  
  // Generate random static noise as canvas would be complex
  // Using CSS noise approximation
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: NERVColors.terminalBlack,
      zIndex: 10000,
      opacity,
      transition: `opacity ${duration / 4}ms ease-out`,
    }}>
      {/* Noise pattern approximation with pseudo-random dots */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )
        `,
        animation: 'nerv-noise 0.1s infinite',
      }} />
      
      {/* Horizontal tear lines */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${20 + i * 15}%`,
          height: 2,
          backgroundColor: NERVColors.amber,
          opacity: 0.3,
          transform: `translateX(${Math.random() * 100 - 50}px)`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOT SEQUENCE - Full NERV boot animation
// ═══════════════════════════════════════════════════════════════════════════════

interface BootSequenceProps {
  onComplete?: () => void;
  showStatic?: boolean;
}

export function BootSequence({ onComplete, showStatic = true }: BootSequenceProps) {
  const [phase, setPhase] = useState<'static' | 'boot' | 'complete'>(
    showStatic ? 'static' : 'boot'
  );
  const [lines, setLines] = useState<string[]>([]);
  
  const bootText = [
    'NERV MAGI SYSTEM v3.7',
    '> INITIALIZING...',
    '> LOADING KERNEL... OK',
    '> CHECKING MEMORY... 128TB OK',
    '> CASPAR: ONLINE',
    '> MELCHIOR: ONLINE',
    '> BALTHASAR: ONLINE',
    '> SYNC INTERFACE... READY',
    '> SYSTEM READY',
  ];
  
  useEffect(() => {
    if (phase === 'boot') {
      let currentLine = 0;
      const interval = setInterval(() => {
        if (currentLine < bootText.length) {
          setLines(prev => [...prev, bootText[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setPhase('complete');
            onComplete?.();
          }, 500);
        }
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [phase, onComplete]);
  
  if (phase === 'complete') return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: NERVColors.terminalBlack,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Courier New', monospace",
    }}>
      {phase === 'static' && (
        <StaticNoise 
          duration={500} 
          onComplete={() => setPhase('boot')} 
        />
      )}
      
      {phase === 'boot' && (
        <div style={{
          width: '80%',
          maxWidth: 600,
          padding: 20,
        }}>
          {/* Header */}
          <div style={{
            borderBottom: `1px solid ${NERVColors.amber}`,
            paddingBottom: 10,
            marginBottom: 20,
          }}>
            <div style={{
              color: NERVColors.amber,
              fontSize: 24,
              fontWeight: 'bold',
              letterSpacing: 6,
              textShadow: `0 0 10px ${NERVColors.amber}`,
            }}>
              NERV
            </div>
            <div style={{
              color: NERVColors.textDim,
              fontSize: 10,
              marginTop: 4,
            }}>
              NEON GENESIS EVANGELION INTERFACE
            </div>
          </div>
          
          {/* Boot lines */}
          <div style={{
            fontSize: 12,
            lineHeight: 1.8,
          }}>
            {lines.map((line, i) => (
              <div key={i} style={{
                color: line.startsWith('>') ? NERVColors.phosphorGreen : NERVColors.amber,
                textShadow: `0 0 4px ${line.startsWith('>') ? NERVColors.phosphorGreen : NERVColors.amber}`,
              }}>
                {line}
              </div>
            ))}
            
            {/* Cursor */}
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 14,
              backgroundColor: NERVColors.phosphorGreen,
              animation: 'nerv-blink 0.5s step-end infinite',
              marginTop: 4,
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA STREAM TICKER - Scrolling data at bottom of screen
// ═══════════════════════════════════════════════════════════════════════════════

interface DataStreamProps {
  data?: string[];
  speed?: number; // pixels per second
}

export function DataStream({ 
  data = generateDefaultDataStream(),
  speed = 50 
}: DataStreamProps) {
  const content = data.join('  █  ');
  const doubledContent = content + '  █  ' + content;
  
  const duration = (doubledContent.length * 8) / speed;
  
  return (
    <div style={{
      backgroundColor: NERVColors.terminalBlack,
      borderTop: `1px solid ${NERVColors.amber}`,
      borderBottom: `1px solid ${NERVColors.amber}`,
      padding: '4px 0',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      fontFamily: "'Courier New', monospace",
      fontSize: 10,
    }}>
      <div style={{
        display: 'inline-block',
        color: NERVColors.phosphorGreen,
        textShadow: `0 0 4px ${NERVColors.phosphorGreen}`,
        animation: `scroll-left ${duration}s linear infinite`,
      }}>
        {doubledContent}
      </div>
      
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function generateDefaultDataStream(): string[] {
  const labels = [
    'SYNC:94.2%',
    'DEPTH:847m',
    'TEMP:28.4°C',
    'PATTERN:BLUE',
    'AT-FIELD:STABLE',
    'PLUG:ACTIVE',
    'EVA-01:ONLINE',
    'PILOT:SHINJI',
    'BATT:87%',
    'O2:21.4%',
    'PRESS:ATM',
    'LINK:OK',
  ];
  
  // Shuffle and return
  return labels.sort(() => Math.random() - 0.5);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRT OVERLAY COMPONENT - Wraps entire app with CRT effects
// ═══════════════════════════════════════════════════════════════════════════════

interface CRTOverlayProps {
  children: React.ReactNode;
  scanlines?: boolean;
  vignette?: boolean;
  flicker?: boolean;
  scanLine?: boolean;
}

export function CRTOverlay({ 
  children, 
  scanlines = true, 
  vignette = true,
  flicker: _flicker = false,
  scanLine = true,
}: CRTOverlayProps) {
  return (
    <div style={{ 
      backgroundColor: NERVColors.terminalBlack,
      minHeight: '100vh',
    }}>
      {/* Inject global styles */}
      <style dangerouslySetInnerHTML={{ __html: CRTEffectsCSS }} />
      
      {children}
      
      {/* Scanlines overlay */}
      {scanlines && <div className="nerv-crt-scanlines" />}
      
      {/* Vignette overlay */}
      {vignette && <div className="nerv-crt-vignette" />}
      
      {/* Moving scan line */}
      {scanLine && <div className="nerv-scan-line" />}
    </div>
  );
}

export default CRTOverlay;
