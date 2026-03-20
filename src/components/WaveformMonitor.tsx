import React, { useEffect, useRef, memo } from 'react';
import { useVisibility } from '../hooks/useVisibility';

/**
 * WaveformMonitor - NERV-style animated sine braid display
 * 
 * The signature Eva visual: multiple overlapping sinusoidal curves,
 * phase-offset, creating a braided/helix appearance.
 * 
 * Features:
 * - Multiple sine waves with phase animation
 * - Crosshair grid overlay
 * - Axis scales (X and Y)
 * - Corner readout display
 */

export interface WaveformMonitorProps {
  /** Number of overlapping sine waves */
  waveCount?: number;
  
  /** Primary wave color */
  color?: 'magenta' | 'green' | 'cyan' | 'orange' | 'red';
  
  /** Animation speed (ms per frame) */
  animationSpeed?: number;
  
  /** Wave frequency */
  frequency?: number;
  
  /** Wave amplitude (0-1 relative to height) */
  amplitude?: number;
  
  /** Show crosshair grid */
  showGrid?: boolean;
  
  /** Grid marker type */
  gridMarker?: 'plus' | 'cross';
  
  /** Show axis scales */
  showAxis?: boolean;
  
  /** X-axis range */
  xAxisRange?: [number, number];
  
  /** Y-axis range */
  yAxisRange?: [number, number];
  
  /** Corner readout value */
  readout?: string;
  
  /** Readout label */
  readoutLabel?: string;
  
  /** Width */
  width?: string | number;
  
  /** Height */
  height?: number;
  
  /** Show top/bottom border lines */
  borderLines?: boolean;
  
  /** Border line color */
  borderColor?: string;
  
  /** Additional className */
  className?: string;
}

const colorValues = {
  magenta: '#FF00CC',
  green: '#00FF66',
  cyan: '#00CCFF',
  orange: '#FF6600',
  red: '#CC0000',
};

interface Wave {
  phase: number;
  frequency: number;
  amplitude: number;
  color: string;
  alpha: number;
}

function WaveformMonitorBase({
  waveCount = 7,
  color = 'magenta',
  animationSpeed = 50,
  frequency = 2,
  amplitude = 0.8,
  showGrid = true,
  gridMarker = 'plus',
  showAxis = true,
  xAxisRange = [-5, 5],
  yAxisRange = [-1, 1],
  readout,
  readoutLabel = 'TIME',
  width = '100%',
  height = 120,
  borderLines = true,
  borderColor = '#FF6B8A',
  className,
}: WaveformMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const { visibleRef } = useVisibility(containerRef);
  
  const primaryColor = colorValues[color];
  
  // Generate wave configurations
  const waves: Wave[] = Array.from({ length: waveCount }, (_, i) => ({
    phase: (i / waveCount) * Math.PI * 2,
    frequency: frequency + (i * 0.1),
    amplitude: amplitude * (1 - Math.abs(i - waveCount / 2) / waveCount * 0.5),
    color: i === Math.floor(waveCount / 2) ? primaryColor : adjustAlpha(primaryColor, 0.3 + (i / waveCount) * 0.4),
    alpha: i === Math.floor(waveCount / 2) ? 1 : 0.3 + (i / waveCount) * 0.4,
  }));
  
  function adjustAlpha(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Single rAF-based render loop (no state-driven re-renders)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(rect.width);
      const h = height;
      const newW = w * dpr;
      const newH = h * dpr;
      if (canvas.width === newW && canvas.height === newH) return;
      canvas.width = newW;
      canvas.height = newH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    const render = (currentTime: number) => {
      if (!visibleRef.current) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const delta = currentTime - lastTime;
      if (delta >= animationSpeed) {
        timeRef.current += 0.05;
        lastTime = currentTime;
      }

      const time = timeRef.current;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Draw border lines (top/bottom)
      if (borderLines) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 1);
        ctx.lineTo(w, 1);
        ctx.moveTo(0, h - 1);
        ctx.lineTo(w, h - 1);
        ctx.stroke();
      }

      // Draw grid
      if (showGrid) {
        const gridSpacingX = w / 10;
        const gridSpacingY = h / 6;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;

        for (let i = 1; i < 10; i++) {
          for (let j = 1; j < 6; j++) {
            const x = i * gridSpacingX;
            const y = j * gridSpacingY;

            if (gridMarker === 'plus') {
              const size = 4;
              ctx.beginPath();
              ctx.moveTo(x - size, y);
              ctx.lineTo(x + size, y);
              ctx.moveTo(x, y - size);
              ctx.lineTo(x, y + size);
              ctx.stroke();
            } else {
              const size = 3;
              ctx.beginPath();
              ctx.moveTo(x - size, y - size);
              ctx.lineTo(x + size, y + size);
              ctx.moveTo(x + size, y - size);
              ctx.lineTo(x - size, y + size);
              ctx.stroke();
            }
          }
        }
      }

      // Draw Y-axis ticks
      if (showAxis) {
        ctx.fillStyle = '#FF6600';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';

        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
          const y = (i / yTicks) * h;
          const value = yAxisRange[1] - (i / yTicks) * (yAxisRange[1] - yAxisRange[0]);

          ctx.strokeStyle = '#FF6600';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.setLineDash([2, 2]);
          ctx.moveTo(20, y);
          ctx.lineTo(w - 20, y);
          ctx.stroke();
          ctx.setLineDash([]);

          if (i % 2 === 0) {
            ctx.fillText(value.toFixed(0), 16, y + 3);
          }
        }
      }

      // Draw X-axis labels
      if (showAxis) {
        ctx.fillStyle = '#FF6600';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        const xTicks = 5;
        for (let i = 0; i <= xTicks; i++) {
          const x = 24 + (i / xTicks) * (w - 48);
          const value = xAxisRange[0] + (i / xTicks) * (xAxisRange[1] - xAxisRange[0]);
          ctx.fillText(value.toFixed(0), x, h - 4);

          ctx.strokeStyle = '#FF6600';
          ctx.beginPath();
          ctx.setLineDash([1, 2]);
          ctx.moveTo(x, 10);
          ctx.lineTo(x, h - 10);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw sine waves — multi-pass glow (no shadowBlur)
      waves.forEach((wave) => {
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.alpha === 1 ? 2 : 1;
        ctx.beginPath();

        for (let x = 24; x < w - 24; x++) {
          const normalizedX = (x - 24) / (w - 48);
          const value = Math.sin((normalizedX * wave.frequency + time + wave.phase) * Math.PI * 2) * wave.amplitude;
          const y = (h / 2) - (value * (h / 2) * 0.85);

          if (x === 24) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Glow effect for primary wave — multi-pass (no shadowBlur)
        if (wave.alpha === 1) {
          ctx.globalAlpha = 0.15;
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 2;
        }
      });

      // Draw corner readout
      if (readout) {
        ctx.fillStyle = '#FF6600';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${readoutLabel}: ${readout}`, w - 8, 16);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationRef.current);
      ro.disconnect();
    };
  }, [animationSpeed, waves, showGrid, gridMarker, showAxis, xAxisRange, yAxisRange, borderLines, borderColor, readout, readoutLabel, primaryColor, height]);
  
  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  };
  
  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}

export const WaveformMonitor = memo(WaveformMonitorBase);
export default WaveformMonitor;
