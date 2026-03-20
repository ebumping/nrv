import { useRef, useEffect, memo } from 'react';
import { useVisibility } from '../hooks/useVisibility';

/**
 * TacticalDisplay - NERV Tactical Operations Display
 *
 * Canvas-based top-down tactical screen with animated sweep line,
 * sector grid, unit tracking with motion trails, threat assessment
 * rings, and engagement vector overlays. Evangelion command center style.
 */

export interface TacticalUnit {
  id: string;
  label: string;
  x: number;
  y: number;
  heading?: number;
  type: 'friendly' | 'hostile' | 'unknown';
  speed?: number;
}

export interface TacticalDisplayProps {
  height?: number;
  units?: TacticalUnit[];
  sweepSpeed?: number;
  sectorLabel?: string;
  className?: string;
}

const DEFAULT_UNITS: TacticalUnit[] = [
  { id: 'eva01', label: 'EVA-01', x: 0.65, y: 0.55, heading: 315, type: 'friendly', speed: 2 },
  { id: 'eva02', label: 'EVA-02', x: 0.4, y: 0.7, heading: 45, type: 'friendly', speed: 1.5 },
  { id: 'eva00', label: 'EVA-00', x: 0.55, y: 0.65, heading: 0, type: 'friendly', speed: 1 },
  { id: 'angel', label: '5th ANGEL', x: 0.35, y: 0.2, heading: 170, type: 'hostile', speed: 3 },
  { id: 'unk1', label: 'PATTERN-B', x: 0.82, y: 0.15, heading: 225, type: 'unknown', speed: 0.5 },
];

const TYPE_COLORS: Record<string, string> = {
  friendly: '#00FF66',
  hostile: '#DC143C',
  unknown: '#FFAA00',
};

function TacticalDisplayBase({
  height = 200,
  units: inputUnits = DEFAULT_UNITS,
  sweepSpeed = 2,
  sectorLabel = 'TOKYO-3',
  className,
}: TacticalDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleRef } = useVisibility(containerRef);
  const stateRef = useRef({
    frame: 0,
    width: 400,
    trails: new Map<string, { x: number; y: number }[]>(),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const state = stateRef.current;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(rect.width);
      const newW = w * dpr;
      const newH = height * dpr;
      if (canvas.width === newW && canvas.height === newH) {
        state.width = w;
        return;
      }
      canvas.width = newW;
      canvas.height = newH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.width = w;
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    const render = () => {
      const w = state.width;
      const h = height;
      state.frame++;
      if (!visibleRef.current) { animId = requestAnimationFrame(render); return; }
      const time = state.frame * 0.016;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // === SECTOR GRID ===
      const cols = 8;
      const rows = 6;
      const cellW = w / cols;
      const cellH = h / rows;

      ctx.strokeStyle = '#0088FF';
      ctx.lineWidth = 0.3;
      ctx.globalAlpha = 0.15;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, h);
        ctx.stroke();
      }
      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellH);
        ctx.lineTo(w, i * cellH);
        ctx.stroke();
      }

      // Sector labels
      ctx.font = "6px 'Share Tech Mono', monospace";
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#0088FF';
      const secLetters = 'ABCDEFGH';
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          ctx.fillText(`${secLetters[c]}${r + 1}`, (c + 0.5) * cellW, (r + 0.5) * cellH + 2);
        }
      }

      // === TERRAIN CONTOURS (Geofront outline) ===
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 0.5;
      // Concentric irregular contours suggesting underground structure
      for (let ring = 0; ring < 6; ring++) {
        ctx.beginPath();
        const cx = w * 0.5;
        const cy = h * 0.45;
        const rx = 25 + ring * 22;
        const ry = 15 + ring * 14;
        for (let a = 0; a <= 360; a += 5) {
          const rad = (a * Math.PI) / 180;
          const wobble = Math.sin(a * 0.05 + ring * 1.3) * (3 + ring * 2);
          const px = cx + (rx + wobble) * Math.cos(rad);
          const py = cy + (ry + wobble * 0.6) * Math.sin(rad);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // === RANGE RINGS FROM CENTER ===
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#0088FF';
      ctx.lineWidth = 0.5;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * 30, 0, Math.PI * 2);
        ctx.stroke();
        // Range label
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#0088FF';
        ctx.font = "6px 'Share Tech Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText(`${r}KM`, centerX + r * 30 + 2, centerY - 2);
        ctx.globalAlpha = 0.1;
      }

      // === SWEEP LINE ===
      const sweepAngle = time * sweepSpeed;
      const sweepLen = Math.max(w, h);

      // Sweep trail (fading arc)
      for (let i = 0; i < 25; i++) {
        const trailAngle = sweepAngle - i * 0.04;
        ctx.globalAlpha = 0.06 * (1 - i / 25);
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(trailAngle) * sweepLen,
          centerY + Math.sin(trailAngle) * sweepLen
        );
        ctx.stroke();
      }

      // Main sweep line — double stroke for glow
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * sweepLen,
        centerY + Math.sin(sweepAngle) * sweepLen
      );
      ctx.stroke();
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.stroke();

      // === UNITS ===
      for (const unit of inputUnits) {
        const ux = unit.x * w;
        const uy = unit.y * h;
        const color = TYPE_COLORS[unit.type];
        const heading = ((unit.heading || 0) * Math.PI) / 180;

        // Update trails
        if (!state.trails.has(unit.id)) state.trails.set(unit.id, []);
        const trail = state.trails.get(unit.id)!;
        if (state.frame % 3 === 0) {
          // Slight drift for visual interest
          const drift = 0.3;
          trail.push({
            x: ux + Math.sin(time * 0.5 + trail.length) * drift,
            y: uy + Math.cos(time * 0.4 + trail.length) * drift,
          });
          if (trail.length > 15) trail.shift();
        }

        // Motion trail
        for (let i = 0; i < trail.length; i++) {
          ctx.globalAlpha = (i / trail.length) * 0.3;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Threat rings for hostile
        if (unit.type === 'hostile') {
          const ringPulse = 1 + Math.sin(time * 3) * 0.15;
          for (let r = 1; r <= 3; r++) {
            ctx.globalAlpha = 0.12 / r;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(ux, uy, r * 18 * ringPulse, 0, Math.PI * 2);
            ctx.stroke();
          }
          // AT field indicator
          ctx.globalAlpha = 0.06 + Math.sin(time * 4) * 0.03;
          ctx.fillStyle = '#FF4400';
          ctx.beginPath();
          ctx.arc(ux, uy, 25 * ringPulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Engagement range for friendly
        if (unit.type === 'friendly') {
          ctx.globalAlpha = 0.06;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.arc(ux, uy, 35, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Unit marker
        const sz = unit.type === 'hostile' ? 6 : 5;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;

        if (unit.type === 'hostile') {
          // Diamond
          ctx.beginPath();
          ctx.moveTo(ux, uy - sz);
          ctx.lineTo(ux + sz, uy);
          ctx.lineTo(ux, uy + sz);
          ctx.lineTo(ux - sz, uy);
          ctx.closePath();
          ctx.fill();
        } else if (unit.type === 'unknown') {
          // Circle with question
          ctx.beginPath();
          ctx.arc(ux, uy, sz * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Triangle pointing in heading direction
          ctx.beginPath();
          ctx.moveTo(
            ux + Math.cos(heading) * sz,
            uy + Math.sin(heading) * sz
          );
          ctx.lineTo(
            ux + Math.cos(heading + 2.4) * sz * 0.7,
            uy + Math.sin(heading + 2.4) * sz * 0.7
          );
          ctx.lineTo(
            ux + Math.cos(heading - 2.4) * sz * 0.7,
            uy + Math.sin(heading - 2.4) * sz * 0.7
          );
          ctx.closePath();
          ctx.fill();
        }

        // Heading vector
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(ux, uy);
        ctx.lineTo(
          ux + Math.cos(heading) * 25,
          uy + Math.sin(heading) * 25
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = color;
        ctx.font = "7px 'Share Tech Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText(unit.label, ux + sz + 4, uy + 3);
      }

      // === INTERCEPT VECTORS (friendly → hostile) ===
      const hostiles = inputUnits.filter(u => u.type === 'hostile');
      const friendlies = inputUnits.filter(u => u.type === 'friendly');
      if (hostiles.length > 0 && friendlies.length > 0) {
        const target = hostiles[0];
        const tx = target.x * w;
        const ty = target.y * h;

        for (const f of friendlies) {
          const fx = f.x * w;
          const fy = f.y * h;

          // Animated dashed intercept line
          ctx.globalAlpha = 0.15;
          ctx.strokeStyle = '#FFAA00';
          ctx.lineWidth = 0.5;
          const dashOffset = (time * 20) % 10;
          ctx.setLineDash([3, 7]);
          ctx.lineDashOffset = -dashOffset;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }
      }

      // === CORNER READOUTS ===
      ctx.globalAlpha = 0.6;
      ctx.font = "8px 'Share Tech Mono', monospace";
      ctx.shadowBlur = 0;

      // Top-left: sector
      ctx.fillStyle = '#00CCFF';
      ctx.textAlign = 'left';
      ctx.fillText(sectorLabel, 4, 12);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#666';
      ctx.fillText('\u6226\u8853\u5730\u56F3', 4, 22); // 戦術地図

      // Top-right: threat status
      ctx.textAlign = 'right';
      const hostileCount = inputUnits.filter(u => u.type === 'hostile').length;
      ctx.globalAlpha = 0.7;
      if (hostileCount > 0) {
        ctx.fillStyle = '#DC143C';
        const blink = Math.sin(time * 4) > 0;
        ctx.fillText(blink ? `\u25B2 THREAT:${hostileCount}` : `  THREAT:${hostileCount}`, w - 4, 12);
      } else {
        ctx.fillStyle = '#00FF66';
        ctx.fillText('SECTOR CLEAR', w - 4, 12);
      }

      // Bottom-left: unit count
      ctx.textAlign = 'left';
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00FF66';
      ctx.fillText(`UNITS:${inputUnits.length}`, 4, h - 6);

      // Bottom-right: scale
      ctx.textAlign = 'right';
      ctx.fillStyle = '#666';
      ctx.fillText('1:50K', w - 4, h - 6);

      // Bottom-center: bearing
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00CCFF';
      ctx.fillText(`BRG:${String(Math.floor(time * 10) % 360).padStart(3, '0')}\u00B0`, w / 2, h - 6);

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [inputUnits, height, sweepSpeed, sectorLabel]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height,
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}

export const TacticalDisplay = memo(TacticalDisplayBase);
export default TacticalDisplay;
