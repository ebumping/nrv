import React, { useRef, useEffect, useCallback } from 'react';

/**
 * HexGrid3D - Multi-layered 3D hexagonal grid
 *
 * Canvas-based rotating hexagonal grid with multiple depth layers.
 * Each layer is a hex grid at a different Z-depth, connected by
 * vertical data lines. Status-based hex coloring and breathing animation.
 */

export interface HexCell3D {
  id: string;
  label?: string;
  layer: number;
  q: number; // axial coordinate
  r: number; // axial coordinate
  status?: 'active' | 'warning' | 'critical' | 'inactive';
  value?: number;
}

export interface HexGrid3DProps {
  height?: number;
  /** Hex cells to render */
  cells?: HexCell3D[];
  /** Number of layers */
  layers?: number;
  /** Hex size in 3D units */
  hexSize?: number;
  /** Rotation speed */
  rotationSpeed?: number;
  /** Show inter-layer connections */
  showConnections?: boolean;
  className?: string;
}

interface Vec3 { x: number; y: number; z: number; }
interface Projected { x: number; y: number; z: number; scale: number; }

const STATUS_COLORS: Record<string, string> = {
  active: '#00FF66',
  warning: '#FFAA00',
  critical: '#DC143C',
  inactive: '#333333',
};

function generateDefaultCells(): HexCell3D[] {
  const cells: HexCell3D[] = [];
  const labels = [
    'WEB', 'EMB', 'LLM', 'FILE', 'TERM', 'CODE', 'TEST',
    'NET', 'API', 'AUTH', 'CRYPT', 'PARSE', 'BUILD', 'DEPLOY',
    'CORE', 'EXEC', 'MEM', 'SYNC', 'PROC', 'I/O', 'LINK',
    'HOOK', 'PIPE', 'GRPC', 'REST', 'WASM', 'CUDA', 'DISK',
  ];
  let li = 0;
  const layerRadii = [3, 3, 2, 2, 1];

  for (let layer = 0; layer < layerRadii.length; layer++) {
    const radius = layerRadii[layer];
    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        const s = -q - r;
        if (Math.abs(s) > radius) continue;
        cells.push({
          id: `hex-${layer}-${q}-${r}`,
          label: labels[li % labels.length],
          layer,
          q,
          r,
          status: li % 7 === 0 ? 'warning' : li % 13 === 0 ? 'critical' : li % 19 === 0 ? 'inactive' : 'active',
          value: 0.5 + ((li * 0.618) % 1) * 0.5,
        });
        li++;
      }
    }
  }
  return cells;
}

export function HexGrid3D({
  height = 280,
  cells: inputCells,
  layers = 3,
  hexSize = 18,
  rotationSpeed = 0.004,
  showConnections = true,
  className,
}: HexGrid3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    cameraAngle: number;
    cameraTilt: number;
    frame: number;
    width: number;
    cells: HexCell3D[];
    dragStart: { x: number; y: number } | null;
    dragAngleStart: number;
    dragTiltStart: number;
    zoomLevel: number;
  }>({
    cameraAngle: -0.4,
    cameraTilt: 0.55,
    frame: 0,
    width: 400,
    cells: [],
    dragStart: null,
    dragAngleStart: 0,
    dragTiltStart: 0,
    zoomLevel: 1,
  });

  useEffect(() => {
    stateRef.current.cells = inputCells || generateDefaultCells();
  }, [inputCells]);

  const project = useCallback((point: Vec3, w: number, h: number, camAngle: number): Projected => {
    const fov = 350;
    const camDist = 250 * stateRef.current.zoomLevel;
    const camTilt = stateRef.current.cameraTilt;

    const cosA = Math.cos(camAngle);
    const sinA = Math.sin(camAngle);
    const rx = point.x * cosA - point.z * sinA;
    const rz = point.x * sinA + point.z * cosA;

    const cosT = Math.cos(camTilt);
    const sinT = Math.sin(camTilt);
    const ry = point.y * cosT - rz * sinT;
    const rz2 = point.y * sinT + rz * cosT;

    const z = rz2 + camDist;
    const scale = fov / Math.max(z, 1);
    return { x: rx * scale + w / 2, y: ry * scale + h / 2, z, scale };
  }, []);

  // Convert hex axial coords to 3D position
  const hexTo3D = useCallback((q: number, r: number, layer: number): Vec3 => {
    const size = hexSize;
    const x = size * (3 / 2 * q);
    const z = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    const y = -layer * 55; // Layer separation
    return { x, y, z };
  }, [hexSize]);

  // Draw a flat-top hexagon projected into 3D
  const drawHex3D = useCallback((
    ctx: CanvasRenderingContext2D,
    center: Vec3, size: number,
    w: number, h: number, camAngle: number,
    fillColor: string, strokeColor: string,
    alpha: number, breathScale: number
  ) => {
    const vertices: Projected[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const vx = center.x + size * breathScale * Math.cos(angle);
      const vz = center.z + size * breathScale * Math.sin(angle);
      vertices.push(project({ x: vx, y: center.y, z: vz }, w, h, camAngle));
    }

    if (vertices.some(v => v.z <= 0)) return;

    const avgZ = vertices.reduce((s, v) => s + v.z, 0) / 6;
    const depthAlpha = Math.max(0.15, Math.min(0.85, 350 / avgZ));

    // Fill
    ctx.globalAlpha = depthAlpha * alpha * 0.3;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Stroke
    ctx.globalAlpha = depthAlpha * alpha * 0.8;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }, [project]);

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
      if (!state.dragStart) state.cameraAngle += rotationSpeed;
      const camAngle = state.cameraAngle;
      const time = state.frame * 0.02;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      const cells = state.cells;
      if (cells.length === 0) {
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // Breathing animation
      const breathScale = 1 + Math.sin(time * 0.6) * 0.04;

      // Sort cells by projected depth for correct draw order
      const projected = cells.map(cell => {
        const pos = hexTo3D(cell.q, cell.r, cell.layer);
        const proj = project(pos, w, h, camAngle);
        return { cell, pos, proj };
      }).filter(c => c.proj.z > 0).sort((a, b) => b.proj.z - a.proj.z);

      // Draw inter-layer connections first (behind hexes)
      if (showConnections) {
        // Connect hexes at same q,r across layers
        const byCoord = new Map<string, typeof projected>();
        for (const item of projected) {
          const key = `${item.cell.q},${item.cell.r}`;
          const existing = byCoord.get(key);
          if (!existing) {
            byCoord.set(key, [item]);
          } else {
            existing.push(item);
          }
        }

        for (const [, items] of byCoord) {
          if (items.length < 2) continue;
          items.sort((a, b) => a.cell.layer - b.cell.layer);
          for (let i = 0; i < items.length - 1; i++) {
            const a = items[i];
            const b = items[i + 1];
            const avgZ = (a.proj.z + b.proj.z) / 2;
            ctx.globalAlpha = Math.max(0.05, Math.min(0.2, 250 / avgZ));
            ctx.strokeStyle = '#00CCFF';
            ctx.lineWidth = 0.4;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(a.proj.x, a.proj.y);
            ctx.lineTo(b.proj.x, b.proj.y);
            ctx.stroke();
          }
        }
        ctx.setLineDash([]);
      }

      // Draw hexes
      for (const { cell, pos, proj } of projected) {
        const color = STATUS_COLORS[cell.status || 'active'];
        const pulse = cell.status === 'warning' || cell.status === 'critical'
          ? 1 + Math.sin(time * 2 + cell.q * 0.5 + cell.r * 0.7) * 0.15
          : 1;

        const layerAlpha = 1 - cell.layer * 0.15;

        drawHex3D(
          ctx, pos, hexSize * 0.85,
          w, h, camAngle,
          color, color,
          layerAlpha * pulse, breathScale
        );

        // Label
        if (cell.label && proj.scale > 0.6) {
          const depthAlpha = Math.max(0.15, Math.min(0.8, 350 / proj.z));
          ctx.globalAlpha = depthAlpha * layerAlpha * 0.85;
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 2;
          ctx.font = `${Math.max(6, Math.min(9, 8 * proj.scale))}px 'Share Tech Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(cell.label, proj.x, proj.y + 3);
          ctx.shadowBlur = 0;
        }
      }

      // Layer labels
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00CCFF';
      ctx.font = "8px 'Share Tech Mono', monospace";
      ctx.textAlign = 'left';
      for (let l = 0; l < layers; l++) {
        const lp = project({ x: -90, y: -l * 55, z: 0 }, w, h, camAngle);
        if (lp.z > 0 && lp.x > 0 && lp.x < w) {
          const depthAlpha = Math.max(0.2, Math.min(0.6, 300 / lp.z));
          ctx.globalAlpha = depthAlpha;
          ctx.fillText(`L${l}`, lp.x - 15, lp.y);
        }
      }

      // Stats
      const active = cells.filter(c => c.status === 'active').length;
      const warn = cells.filter(c => c.status === 'warning').length;
      const crit = cells.filter(c => c.status === 'critical').length;
      ctx.globalAlpha = 0.6;
      ctx.font = "8px 'Share Tech Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00FF66';
      ctx.fillText(`ACT:${active}`, 6, 14);
      ctx.fillStyle = '#FFAA00';
      ctx.fillText(`WRN:${warn}`, 6, 26);
      ctx.fillStyle = '#DC143C';
      ctx.fillText(`CRT:${crit}`, 6, 38);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#666';
      ctx.fillText(`NODES:${cells.length}`, w - 6, 14);
      ctx.fillText(`LAYERS:${layers}`, w - 6, 26);

      ctx.globalAlpha = 1;
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [height, hexSize, rotationSpeed, showConnections, layers, project, hexTo3D, drawHex3D]);

  // Mouse drag-to-orbit and scroll-to-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const state = stateRef.current;

    const onMouseDown = (e: MouseEvent) => {
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.dragAngleStart = state.cameraAngle;
      state.dragTiltStart = state.cameraTilt;
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!state.dragStart) return;
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      state.cameraAngle = state.dragAngleStart + dx * 0.005;
      state.cameraTilt = Math.max(0.1, Math.min(1.2, state.dragTiltStart + dy * 0.005));
    };
    const onMouseUp = () => {
      state.dragStart = null;
      el.style.cursor = 'grab';
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.zoomLevel = Math.max(0.5, Math.min(3, state.zoomLevel + e.deltaY * 0.001));
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.style.cursor = 'grab';

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

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

export default HexGrid3D;
