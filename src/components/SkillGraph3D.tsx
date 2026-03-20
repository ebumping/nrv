import React, { useRef, useEffect, useCallback } from 'react';

/**
 * SkillGraph3D - Layered 3D skill topology visualization
 *
 * Blue wireframe mesh at the base with orange connection arcs that
 * wrap and unwrap over time to show cluster relations. Side bar
 * panels show activity. Reference: NERV MAGI neural topology display.
 */

export interface SkillNode3D {
  id: string;
  label?: string;
  gridX?: number;
  gridZ?: number;
  layer?: number;
  color?: string;
  value?: number;
}

export interface SkillEdge3D {
  source: string;
  target: string;
  strength?: number;
}

export interface SkillGraph3DProps {
  height?: number;
  nodes?: SkillNode3D[];
  edges?: SkillEdge3D[];
  gridResolution?: number;
  rotationSpeed?: number;
  showSidePanels?: boolean;
  className?: string;
}

interface Vec3 { x: number; y: number; z: number; }
interface Projected { x: number; y: number; z: number; scale: number; }

const DEFAULT_NODES: SkillNode3D[] = [
  // Base grid nodes - spread across the mesh
  { id: 's1', label: '1', gridX: 0.15, gridZ: 0.2, layer: 0 },
  { id: 's2', label: '2', gridX: 0.35, gridZ: 0.15, layer: 0 },
  { id: 's3', label: '3', gridX: 0.55, gridZ: 0.25, layer: 0 },
  { id: 's4', label: '4', gridX: 0.75, gridZ: 0.2, layer: 0 },
  { id: 's5', label: '5', gridX: 0.2, gridZ: 0.5, layer: 0 },
  { id: 's6', label: '6', gridX: 0.45, gridZ: 0.45, layer: 0 },
  { id: 's7', label: '7', gridX: 0.65, gridZ: 0.5, layer: 0 },
  { id: 's8', label: '8', gridX: 0.85, gridZ: 0.45, layer: 0 },
  { id: 's9', label: '9', gridX: 0.3, gridZ: 0.75, layer: 0 },
  { id: 's10', label: '0', gridX: 0.5, gridZ: 0.7, layer: 0 },
  { id: 's11', label: '1', gridX: 0.7, gridZ: 0.75, layer: 0 },
  { id: 's12', label: '2', gridX: 0.9, gridZ: 0.7, layer: 0 },
  // Elevated nodes - spread wide above
  { id: 'h1', label: 'CORE', layer: 1, color: '#FF6600' },
  { id: 'h2', label: 'EXEC', layer: 1, color: '#FF6600' },
  { id: 'h3', label: 'NET', layer: 2, color: '#FF4400' },
  { id: 'h4', label: 'MEM', layer: 1, color: '#FF6600' },
  { id: 'h5', label: 'SYNC', layer: 2, color: '#FF4400' },
  { id: 'h6', label: 'I/O', layer: 1, color: '#FF6600' },
  { id: 'h7', label: 'PROC', layer: 2, color: '#FF4400' },
  { id: 'h8', label: 'LINK', layer: 1, color: '#FF6600' },
];

const DEFAULT_EDGES: SkillEdge3D[] = [
  { source: 's1', target: 'h1', strength: 0.8 },
  { source: 's2', target: 'h1', strength: 0.6 },
  { source: 's3', target: 'h2', strength: 0.7 },
  { source: 's4', target: 'h3', strength: 0.5 },
  { source: 's5', target: 'h2', strength: 0.6 },
  { source: 's6', target: 'h4', strength: 0.4 },
  { source: 's7', target: 'h3', strength: 0.7 },
  { source: 's8', target: 'h5', strength: 0.5 },
  { source: 's9', target: 'h6', strength: 0.6 },
  { source: 's10', target: 'h7', strength: 0.5 },
  { source: 's11', target: 'h8', strength: 0.6 },
  { source: 's12', target: 'h5', strength: 0.4 },
  { source: 's1', target: 'h3', strength: 0.3 },
  { source: 's3', target: 'h5', strength: 0.5 },
  { source: 's5', target: 'h7', strength: 0.4 },
  { source: 's2', target: 'h4', strength: 0.3 },
  { source: 's7', target: 'h1', strength: 0.4 },
  { source: 's4', target: 'h6', strength: 0.3 },
  { source: 's6', target: 'h8', strength: 0.5 },
  { source: 's8', target: 'h1', strength: 0.3 },
  { source: 's9', target: 'h2', strength: 0.4 },
  { source: 's10', target: 'h4', strength: 0.3 },
  { source: 's11', target: 'h3', strength: 0.5 },
  { source: 's12', target: 'h7', strength: 0.4 },
];

export function SkillGraph3D({
  height = 500,
  nodes: inputNodes = DEFAULT_NODES,
  edges: inputEdges = DEFAULT_EDGES,
  gridResolution = 14,
  rotationSpeed = 0.003,
  showSidePanels = true,
  className,
}: SkillGraph3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    cameraAngle: number;
    cameraTilt: number;
    frame: number;
    width: number;
    heightMap: number[][];
    barValues: number[];
    dragStart: { x: number; y: number } | null;
    dragAngleStart: number;
    dragTiltStart: number;
    zoomLevel: number;
  }>({
    cameraAngle: -0.6,
    cameraTilt: 0.5,
    frame: 0,
    width: 800,
    heightMap: [],
    barValues: [],
    dragStart: null,
    dragAngleStart: 0,
    dragTiltStart: 0,
    zoomLevel: 1,
  });

  useEffect(() => {
    const state = stateRef.current;
    const map: number[][] = [];
    const res = gridResolution;
    for (let z = 0; z <= res; z++) {
      map[z] = [];
      for (let x = 0; x <= res; x++) {
        const nx = x / res;
        const nz = z / res;
        let h = Math.sin(nx * 5 + 1) * Math.cos(nz * 4 + 0.5) * 0.8;
        h += Math.sin(nx * 8 + 2) * Math.cos(nz * 6 + 1) * 0.3;
        h += Math.sin(nx * 12 + 3) * Math.cos(nz * 10 + 2) * 0.1;
        map[z][x] = h;
      }
    }
    state.heightMap = map;
    state.barValues = Array.from({ length: 32 }, () => 0.2 + Math.random() * 0.8);
  }, [gridResolution]);

  const project = useCallback((point: Vec3, w: number, h: number, camAngle: number): Projected => {
    const fov = 380;
    const camDist = 400 * stateRef.current.zoomLevel;
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

    return {
      x: rx * scale + w / 2,
      y: ry * scale + h * 0.55,
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

    const getNodePos = (node: SkillNode3D, time: number): Vec3 => {
      const spread = 120;
      if (node.layer === 0) {
        const gx = (node.gridX ?? 0.5) - 0.5;
        const gz = (node.gridZ ?? 0.5) - 0.5;
        const mx = Math.min(gridResolution, Math.floor((node.gridX ?? 0.5) * gridResolution));
        const mz = Math.min(gridResolution, Math.floor((node.gridZ ?? 0.5) * gridResolution));
        const meshH = state.heightMap[mz]?.[mx] || 0;
        return {
          x: gx * spread * 2,
          y: meshH * 18 + 15,
          z: gz * spread * 2,
        };
      } else {
        // Elevated nodes: spread wide across the space
        const elevatedNodes = inputNodes.filter(n => (n.layer || 0) > 0);
        const idx = elevatedNodes.indexOf(node);
        const count = elevatedNodes.length;
        // Use wider spread, not circular - distribute across width
        const golden = 0.618033988749895;
        const spreadAngle = ((idx * golden) % 1) * Math.PI * 2;
        const r = 40 + (node.layer || 1) * 30 + ((idx * golden * 7) % 1) * 30;
        const yBase = -90 - (node.layer || 1) * 50;
        // Gentle sway
        const sway = Math.sin(time * 0.3 + idx * 1.7) * 8;
        return {
          x: Math.cos(spreadAngle) * r + sway,
          y: yBase + Math.sin(time * 0.4 + idx * 0.9) * 4,
          z: Math.sin(spreadAngle) * r,
        };
      }
    };

    // Draw animated arc that wraps/unwraps
    const drawArc3D = (
      from: Vec3, to: Vec3,
      w: number, h: number, camAngle: number,
      arcColor: string, strength: number,
      edgeIdx: number, time: number
    ) => {
      const segments = 28;
      // Animated control points - arcs wrap and unwrap over time
      const phase = time * 0.15 + edgeIdx * 0.7;
      const wrapAmount = 0.5 + Math.sin(phase) * 0.4; // 0.1 to 0.9
      const lateralSway = Math.sin(phase * 0.7 + edgeIdx * 1.3) * 40;

      const midX = (from.x + to.x) / 2 + lateralSway * wrapAmount;
      const midZ = (from.z + to.z) / 2 + Math.cos(phase * 0.5) * 30 * wrapAmount;
      const arcHeight = Math.min(from.y, to.y) - 30 - Math.abs(from.y - to.y) * 0.3 - wrapAmount * 40;

      const points: Projected[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        const cp1: Vec3 = { x: midX, y: arcHeight, z: midZ };
        const cp2: Vec3 = { x: midX, y: arcHeight * 0.8, z: midZ };

        const px = mt3 * from.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * to.x;
        const py = mt3 * from.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * to.y;
        const pz = mt3 * from.z + 3 * mt2 * t * cp1.z + 3 * mt * t2 * cp2.z + t3 * to.z;

        points.push(project({ x: px, y: py, z: pz }, w, h, camAngle));
      }

      // Draw the arc with depth-aware opacity
      ctx.beginPath();
      let started = false;
      for (const p of points) {
        if (p.z <= 0) { started = false; continue; }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      const avgZ = points.reduce((s, p) => s + p.z, 0) / points.length;
      const depthAlpha = Math.max(0.15, Math.min(0.7, 450 / avgZ));
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 0.8 + strength * 1.2;
      ctx.globalAlpha = depthAlpha * (0.4 + strength * 0.3);
      ctx.shadowColor = arcColor;
      ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const render = () => {
      const w = state.width;
      const h = height;
      state.frame++;
      if (!state.dragStart) state.cameraAngle += rotationSpeed;
      const time = state.frame * 0.02;
      const camAngle = state.cameraAngle;

      // Clip to bounds
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      if (state.heightMap.length === 0) {
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      const spread = 120;
      const res = gridResolution;

      // === SIDE PANELS (draw first, behind everything) ===
      if (showSidePanels) {
        if (state.frame % 8 === 0) {
          for (let i = 0; i < state.barValues.length; i++) {
            state.barValues[i] += (Math.random() - 0.5) * 0.06;
            state.barValues[i] = Math.max(0.1, Math.min(1, state.barValues[i]));
          }
        }

        const panelW = 28;
        const barH = 10;
        const barGap = 2;
        const panelBars = 16;
        const panelTotalH = panelBars * (barH + barGap);
        const panelMargin = 8;

        // Left panel
        const lpy = (h - panelTotalH) / 2;
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(panelMargin - 1, lpy - 6, panelW + 2, panelTotalH + 12);

        for (let i = 0; i < panelBars; i++) {
          const val = state.barValues[i];
          const y = lpy + i * (barH + barGap);
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = '#FF6600';
          ctx.fillRect(panelMargin, y, panelW, barH);
          ctx.globalAlpha = 0.6 + val * 0.4;
          ctx.fillStyle = val > 0.7 ? '#FF6600' : val > 0.4 ? '#FF8800' : '#FFAA00';
          ctx.shadowColor = '#FF6600';
          ctx.shadowBlur = 3;
          ctx.fillRect(panelMargin, y, panelW * val, barH);
        }

        // Right panel
        const rpx = w - panelMargin - panelW;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(rpx - 1, lpy - 6, panelW + 2, panelTotalH + 12);

        for (let i = 0; i < panelBars; i++) {
          const val = state.barValues[i + panelBars];
          const y = lpy + i * (barH + barGap);
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = '#FF6600';
          ctx.fillRect(rpx, y, panelW, barH);
          ctx.globalAlpha = 0.6 + val * 0.4;
          ctx.fillStyle = val > 0.7 ? '#FF6600' : val > 0.4 ? '#FF8800' : '#FFAA00';
          ctx.shadowColor = '#FF6600';
          ctx.shadowBlur = 3;
          ctx.fillRect(rpx, y, panelW * val, barH);
        }
        ctx.shadowBlur = 0;
      }

      // === BLUE WIREFRAME MESH ===
      const projGrid: Projected[][] = [];
      for (let z = 0; z <= res; z++) {
        projGrid[z] = [];
        for (let x = 0; x <= res; x++) {
          const nx = (x / res - 0.5) * spread * 2;
          const nz = (z / res - 0.5) * spread * 2;
          const baseH = state.heightMap[z]?.[x] || 0;
          const animH = baseH + Math.sin(x * 0.4 + time * 0.8) * Math.cos(z * 0.3 + time * 0.5) * 0.2;
          const ny = animH * 18 + 15;
          projGrid[z][x] = project({ x: nx, y: ny, z: nz }, w, h, camAngle);
        }
      }

      // Mesh lines X
      for (let z = 0; z <= res; z++) {
        ctx.beginPath();
        let started = false;
        for (let x = 0; x <= res; x++) {
          const p = projGrid[z][x];
          if (p.z <= 0) { started = false; continue; }
          ctx.strokeStyle = '#0088FF';
          ctx.globalAlpha = Math.max(0.12, Math.min(0.55, 400 / p.z));
          ctx.lineWidth = 0.7;
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      // Mesh lines Z
      for (let x = 0; x <= res; x++) {
        ctx.beginPath();
        let started = false;
        for (let z = 0; z <= res; z++) {
          const p = projGrid[z][x];
          if (p.z <= 0) { started = false; continue; }
          ctx.strokeStyle = '#0088FF';
          ctx.globalAlpha = Math.max(0.12, Math.min(0.55, 400 / p.z));
          ctx.lineWidth = 0.7;
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Grid numbers
      ctx.font = "7px 'Share Tech Mono', monospace";
      ctx.textAlign = 'center';
      for (let z = 0; z <= res; z += 2) {
        for (let x = 0; x <= res; x += 2) {
          const p = projGrid[z][x];
          if (p.z <= 0) continue;
          ctx.globalAlpha = Math.max(0.15, Math.min(0.65, 350 / p.z));
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(String((Math.floor(x / 2) % 9) + 1), p.x, p.y - 3);
        }
      }

      // === COMPUTE NODE POSITIONS ===
      const nodePositions = new Map<string, Vec3>();
      for (const node of inputNodes) {
        nodePositions.set(node.id, getNodePos(node, time));
      }

      // === DRAW CONNECTION ARCS (with wrap/unwrap animation) ===
      for (let ei = 0; ei < inputEdges.length; ei++) {
        const edge = inputEdges[ei];
        const fromPos = nodePositions.get(edge.source);
        const toPos = nodePositions.get(edge.target);
        if (!fromPos || !toPos) continue;

        drawArc3D(
          fromPos, toPos,
          w, h, camAngle,
          '#FF5500',
          edge.strength || 0.5,
          ei, time
        );
      }

      // === DRAW NODES ===
      const sortedNodes = inputNodes.map(node => ({
        node,
        pos: nodePositions.get(node.id)!,
        proj: project(nodePositions.get(node.id)!, w, h, camAngle),
      })).filter(n => n.proj.z > 0).sort((a, b) => b.proj.z - a.proj.z);

      for (const { node, proj } of sortedNodes) {
        const depthAlpha = Math.max(0.3, Math.min(1, 450 / proj.z));
        const isBase = (node.layer || 0) === 0;
        const nodeColor = node.color || '#FF8800';
        const r = isBase ? Math.max(2, 2.5 * proj.scale) : Math.max(3, 4.5 * proj.scale);

        // Outer glow
        ctx.globalAlpha = depthAlpha * 0.2;
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isBase ? 6 : 12;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = depthAlpha * 0.9;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (node.label) {
          ctx.globalAlpha = depthAlpha * 0.8;
          ctx.fillStyle = isBase ? '#FFFFFF' : '#FF8800';
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = 2;
          ctx.font = isBase ? "7px 'Share Tech Mono', monospace" : "9px 'Share Tech Mono', monospace";
          ctx.textAlign = 'center';
          ctx.fillText(node.label, proj.x, proj.y - r - 3);
        }
      }

      ctx.shadowBlur = 0;

      // Green floating data points
      ctx.fillStyle = '#00FF66';
      for (let i = 0; i < 12; i++) {
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.4 + i * 2) * 0.15;
        const px = 48 + Math.sin(time * 0.25 + i * 1.2) * 25;
        const py = 15 + i * 10 + Math.cos(time * 0.35 + i * 0.8) * 4;
        ctx.fillRect(px, py, 2, 2);
        // Mirror on right
        const rpx = w - 48 + Math.sin(time * 0.3 + i * 1.5) * 20;
        ctx.fillRect(rpx, py, 2, 2);
      }

      ctx.globalAlpha = 1;
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [inputNodes, inputEdges, gridResolution, height, rotationSpeed, showSidePanels, project]);

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

export default SkillGraph3D;
