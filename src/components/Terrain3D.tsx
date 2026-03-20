import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Terrain3D - 3D wireframe terrain with height displacement
 *
 * Canvas-based rotating 3D terrain mesh visualization.
 * Height-mapped wireframe grid with blip markers and contour coloring.
 */

export interface TerrainBlip {
  id: string;
  /** 0-1 normalized position on grid */
  x: number;
  /** 0-1 normalized position on grid */
  z: number;
  type: 'friendly' | 'hostile' | 'unknown';
  label?: string;
}

export interface Terrain3DProps {
  width?: number | string;
  height?: number;
  /** Grid resolution (vertices per side) */
  gridSize?: number;
  /** Height scale multiplier */
  heightScale?: number;
  /** Terrain mesh color */
  meshColor?: string;
  /** Blip markers */
  blips?: TerrainBlip[];
  /** Auto-rotation speed */
  rotationSpeed?: number;
  /** Show height-based coloring */
  showContours?: boolean;
  className?: string;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Projected {
  x: number;
  y: number;
  z: number;
  scale: number;
}

const DEFAULT_BLIPS: TerrainBlip[] = [
  { id: 'eva01', x: 0.35, z: 0.4, type: 'friendly', label: 'EVA-01' },
  { id: 'angel', x: 0.7, z: 0.3, type: 'hostile', label: 'TARGET' },
];

export function Terrain3D({
  height = 240,
  gridSize = 32,
  heightScale = 30,
  meshColor = '#00FF66',
  blips = DEFAULT_BLIPS,
  rotationSpeed = 0.002,
  showContours = true,
  className,
}: Terrain3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    heightMap: number[][];
    cameraAngle: number;
    cameraTilt: number;
    frame: number;
    width: number;
    dragStart: { x: number; y: number } | null;
    dragAngleStart: number;
    dragTiltStart: number;
    zoomLevel: number;
  }>({
    heightMap: [],
    cameraAngle: -0.5,
    cameraTilt: 0.7,
    frame: 0,
    width: 600,
    dragStart: null,
    dragAngleStart: 0,
    dragTiltStart: 0,
    zoomLevel: 1,
  });

  // Generate height map using layered noise
  useEffect(() => {
    const state = stateRef.current;
    const map: number[][] = [];

    for (let z = 0; z <= gridSize; z++) {
      map[z] = [];
      for (let x = 0; x <= gridSize; x++) {
        const nx = x / gridSize;
        const nz = z / gridSize;
        // Multi-octave noise
        let h = 0;
        h += Math.sin(nx * 4 + 0.5) * Math.cos(nz * 3 + 0.8) * 1.0;
        h += Math.sin(nx * 8 + 2.1) * Math.cos(nz * 7 + 1.3) * 0.4;
        h += Math.sin(nx * 16 + 4.2) * Math.cos(nz * 12 + 3.1) * 0.15;
        // Create a valley in the center (geofront)
        const cx = nx - 0.5;
        const cz = nz - 0.5;
        const distFromCenter = Math.sqrt(cx * cx + cz * cz);
        h -= Math.max(0, 0.8 - distFromCenter * 2.5) * 2;
        // Edge falloff
        const edgeFade = Math.min(nx, 1 - nx, nz, 1 - nz) * 4;
        h *= Math.min(1, edgeFade);
        map[z][x] = h;
      }
    }
    state.heightMap = map;
  }, [gridSize]);

  // 3D projection
  const project = useCallback((point: Vec3, w: number, h: number, camAngle: number): Projected => {
    const fov = 400;
    const camDist = 300 * stateRef.current.zoomLevel;
    const camTilt = stateRef.current.cameraTilt;

    const cosA = Math.cos(camAngle);
    const sinA = Math.sin(camAngle);
    const rx = point.x * cosA - point.z * sinA;
    const rz = point.x * sinA + point.z * cosA;
    let ry = point.y;

    const cosT = Math.cos(camTilt);
    const sinT = Math.sin(camTilt);
    const ry2 = ry * cosT - rz * sinT;
    const rz2 = ry * sinT + rz * cosT;

    const z = rz2 + camDist;
    const scale = fov / Math.max(z, 1);

    return {
      x: rx * scale + w / 2,
      y: ry2 * scale + h / 2 - 20,
      z,
      scale,
    };
  }, []);

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

    const blipColors: Record<string, string> = {
      friendly: '#00FF66',
      hostile: '#DC143C',
      unknown: '#FFAA00',
    };

    const render = () => {
      const w = state.width;
      const h = height;
      state.frame++;
      if (!state.dragStart) state.cameraAngle += rotationSpeed;

      if (state.heightMap.length === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Animate height map slightly
      const time = state.frame * 0.02;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      const camAngle = state.cameraAngle;
      const terrainSpread = 150;

      // Build projected grid
      const projectedGrid: Projected[][] = [];
      for (let z = 0; z <= gridSize; z++) {
        projectedGrid[z] = [];
        for (let x = 0; x <= gridSize; x++) {
          const nx = (x / gridSize - 0.5) * terrainSpread * 2;
          const nz = (z / gridSize - 0.5) * terrainSpread * 2;
          const baseH = state.heightMap[z]?.[x] || 0;
          // Animate with gentle waves
          const animH = baseH + Math.sin(x * 0.3 + time) * Math.cos(z * 0.2 + time * 0.7) * 0.15;
          const ny = -animH * heightScale;

          projectedGrid[z][x] = project({ x: nx, y: ny, z: nz }, w, h, camAngle);
        }
      }

      // Draw grid lines — each segment drawn individually to avoid flicker
      ctx.lineWidth = 0.5;

      const getContourColor = (zIdx: number, xIdx: number): string => {
        if (!showContours) return meshColor;
        const hVal = state.heightMap[zIdx]?.[xIdx] || 0;
        const n = (hVal + 2) / 4;
        if (n < 0.3) return '#0066FF';
        if (n < 0.5) return meshColor;
        if (n < 0.7) return '#FFAA00';
        return '#FF6600';
      };

      // Lines along X (row by row)
      for (let z = 0; z <= gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
          const p1 = projectedGrid[z][x];
          const p2 = projectedGrid[z][x + 1];
          if (p1.z <= 0 || p2.z <= 0) continue;
          const avgZ = (p1.z + p2.z) / 2;
          ctx.globalAlpha = Math.max(0.08, Math.min(0.5, 350 / avgZ));
          ctx.strokeStyle = getContourColor(z, x);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Lines along Z (column by column)
      for (let x = 0; x <= gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const p1 = projectedGrid[z][x];
          const p2 = projectedGrid[z + 1][x];
          if (p1.z <= 0 || p2.z <= 0) continue;
          const avgZ = (p1.z + p2.z) / 2;
          ctx.globalAlpha = Math.max(0.08, Math.min(0.5, 350 / avgZ));
          ctx.strokeStyle = getContourColor(z, x);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw blips
      for (const blip of blips) {
        const bx = (blip.x - 0.5) * terrainSpread * 2;
        const bz = (blip.z - 0.5) * terrainSpread * 2;
        const gx = Math.floor(blip.x * gridSize);
        const gz = Math.floor(blip.z * gridSize);
        const terrainH = state.heightMap[gz]?.[gx] || 0;
        const by = -terrainH * heightScale - 15;

        const bp = project({ x: bx, y: by, z: bz }, w, h, camAngle);
        if (bp.z <= 0) continue;

        const bColor = blipColors[blip.type] || '#FFAA00';
        const bSize = Math.max(3, 5 * bp.scale);
        const depthAlpha = Math.max(0.4, Math.min(1, 400 / bp.z));

        // Pulsing outer ring
        const pulse = 1 + 0.4 * Math.sin(state.frame * 0.1);
        ctx.globalAlpha = depthAlpha * 0.2;
        ctx.fillStyle = bColor;
        ctx.shadowColor = bColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bSize * 2.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = depthAlpha;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Crosshair for hostile
        if (blip.type === 'hostile') {
          ctx.strokeStyle = bColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = depthAlpha * 0.8;
          const ch = bSize * 3;
          ctx.beginPath();
          ctx.moveTo(bp.x - ch, bp.y);
          ctx.lineTo(bp.x - bSize * 1.5, bp.y);
          ctx.moveTo(bp.x + bSize * 1.5, bp.y);
          ctx.lineTo(bp.x + ch, bp.y);
          ctx.moveTo(bp.x, bp.y - ch);
          ctx.lineTo(bp.x, bp.y - bSize * 1.5);
          ctx.moveTo(bp.x, bp.y + bSize * 1.5);
          ctx.lineTo(bp.x, bp.y + ch);
          ctx.stroke();
        }

        // Vertical line to ground
        const groundP = project({ x: bx, y: -terrainH * heightScale, z: bz }, w, h, camAngle);
        if (groundP.z > 0) {
          ctx.globalAlpha = depthAlpha * 0.3;
          ctx.strokeStyle = bColor;
          ctx.setLineDash([2, 3]);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(bp.x, bp.y);
          ctx.lineTo(groundP.x, groundP.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Label
        if (blip.label) {
          ctx.globalAlpha = depthAlpha * 0.9;
          ctx.fillStyle = bColor;
          ctx.shadowColor = bColor;
          ctx.shadowBlur = 2;
          ctx.font = `${Math.max(8, Math.min(11, bSize * 1.8))}px 'Share Tech Mono', monospace`;
          ctx.textAlign = 'left';
          ctx.fillText(blip.label, bp.x + bSize + 4, bp.y + 3);
        }
      }
      ctx.shadowBlur = 0;

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Info footer
      ctx.fillStyle = '#FFAA00';
      ctx.font = "9px 'Share Tech Mono', monospace";
      ctx.globalAlpha = 0.6;
      ctx.textAlign = 'left';
      ctx.fillText('AREA: TOKYO-3', 8, h - 8);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00FF66';
      ctx.fillText('GRID: 47-K', w / 2, h - 8);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#666';
      ctx.fillText('SCALE: 1:50000', w - 8, h - 8);
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [gridSize, heightScale, meshColor, blips, rotationSpeed, showContours, height, project]);

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

export default Terrain3D;
