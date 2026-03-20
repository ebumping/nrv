import { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useVisibility } from '../hooks/useVisibility';

/**
 * SkillGraph3D - Neural Mapping Topology
 *
 * Dynamic wireframe grid that scales with cluster count. Connections render
 * as helically-twisted wire bundles — tight twist = strong correlation,
 * loose splay = weak. High-connectivity hub nodes sprout organic tendrils.
 * Side panels show activity readouts.
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

// Layer colors matching skill registry (HexagonalSkillMatrix)
const layerColors: Record<number, string> = {
  0: '#FFFFFF',  // Infrastructure - white
  1: '#00CED1',  // Foundation - phosphorCyan
  2: '#39FF14',  // Core - phosphorGreen
  3: '#FF8C00',  // Advanced - amber
  4: '#DC143C',  // Expert - crimson
  5: '#7B1FA2',  // Strategy - evaPurple
};

// === DEFAULT DATA (spawning_pool themed) ===

const DEFAULT_NODES: SkillNode3D[] = [
  // Base clusters — grid points representing skill groups
  { id: 'soceng', label: 'SOCENG', gridX: 0.12, gridZ: 0.18, layer: 0 },
  { id: 'opsec', label: 'OPSEC', gridX: 0.32, gridZ: 0.12, layer: 0 },
  { id: 'persona', label: 'PERSONA', gridX: 0.52, gridZ: 0.22, layer: 0 },
  { id: 'comms', label: 'COMMS', gridX: 0.72, gridZ: 0.15, layer: 0 },
  { id: 'intel', label: 'INTEL', gridX: 0.18, gridZ: 0.42, layer: 0 },
  { id: 'craft', label: 'CRAFT', gridX: 0.42, gridZ: 0.38, layer: 0 },
  { id: 'adapt', label: 'ADAPT', gridX: 0.62, gridZ: 0.42, layer: 0 },
  { id: 'persist', label: 'PERSIST', gridX: 0.82, gridZ: 0.35, layer: 0 },
  { id: 'network', label: 'NETWORK', gridX: 0.25, gridZ: 0.62, layer: 0 },
  { id: 'recon', label: 'RECON', gridX: 0.48, gridZ: 0.58, layer: 0 },
  { id: 'lang', label: 'LANG', gridX: 0.68, gridZ: 0.62, layer: 0 },
  { id: 'visual', label: 'VISUAL', gridX: 0.88, gridZ: 0.55, layer: 0 },
  { id: 'sched', label: 'SCHED', gridX: 0.15, gridZ: 0.82, layer: 0 },
  { id: 'track', label: 'TRACK', gridX: 0.38, gridZ: 0.78, layer: 0 },
  { id: 'evade', label: 'EVADE', gridX: 0.58, gridZ: 0.82, layer: 0 },
  { id: 'infil', label: 'INFIL', gridX: 0.78, gridZ: 0.78, layer: 0 },
  // Elevated hubs — command layer
  { id: 'core', label: 'CORE', layer: 1, color: '#9C27B0' },
  { id: 'exec', label: 'EXEC', layer: 1, color: '#FF6600' },
  { id: 'sigint', label: 'SIGINT', layer: 1, color: '#9C27B0' },
  { id: 'humint', label: 'HUMINT', layer: 1, color: '#FF6600' },
  { id: 'c2', label: 'C2', layer: 2, color: '#7B1FA2' },
  { id: 'cogwar', label: 'COGWAR', layer: 2, color: '#7B1FA2' },
];

const DEFAULT_EDGES: SkillEdge3D[] = [
  // Strong correlations — tight helix
  { source: 'soceng', target: 'humint', strength: 0.9 },
  { source: 'persona', target: 'humint', strength: 0.85 },
  { source: 'opsec', target: 'exec', strength: 0.8 },
  { source: 'intel', target: 'sigint', strength: 0.85 },
  { source: 'recon', target: 'sigint', strength: 0.8 },
  { source: 'comms', target: 'c2', strength: 0.75 },
  { source: 'infil', target: 'humint', strength: 0.8 },
  { source: 'evade', target: 'opsec', strength: 0.75 },
  // Medium correlations
  { source: 'craft', target: 'cogwar', strength: 0.7 },
  { source: 'network', target: 'humint', strength: 0.7 },
  { source: 'persona', target: 'cogwar', strength: 0.7 },
  { source: 'persist', target: 'exec', strength: 0.65 },
  { source: 'track', target: 'sigint', strength: 0.65 },
  { source: 'adapt', target: 'core', strength: 0.6 },
  { source: 'soceng', target: 'cogwar', strength: 0.6 },
  { source: 'opsec', target: 'sigint', strength: 0.55 },
  { source: 'lang', target: 'cogwar', strength: 0.55 },
  { source: 'visual', target: 'craft', strength: 0.5 },
  { source: 'intel', target: 'core', strength: 0.5 },
  { source: 'comms', target: 'humint', strength: 0.5 },
  { source: 'sched', target: 'exec', strength: 0.5 },
  // Weak correlations — loose splay
  { source: 'network', target: 'core', strength: 0.45 },
  { source: 'infil', target: 'exec', strength: 0.45 },
  { source: 'adapt', target: 'cogwar', strength: 0.4 },
  { source: 'lang', target: 'humint', strength: 0.4 },
  { source: 'track', target: 'core', strength: 0.35 },
  { source: 'visual', target: 'cogwar', strength: 0.35 },
  { source: 'sched', target: 'c2', strength: 0.3 },
  // Hub interconnections
  { source: 'core', target: 'c2', strength: 0.9 },
  { source: 'exec', target: 'c2', strength: 0.85 },
  { source: 'sigint', target: 'core', strength: 0.7 },
  { source: 'humint', target: 'cogwar', strength: 0.75 },
  { source: 'humint', target: 'core', strength: 0.6 },
];

function SkillGraph3DBase({
  height = 500,
  nodes: inputNodes = DEFAULT_NODES,
  edges: inputEdges = DEFAULT_EDGES,
  gridResolution,
  rotationSpeed = 0.003,
  showSidePanels = true,
  className,
}: SkillGraph3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleRef } = useVisibility(containerRef);

  // Dynamic grid sizing: more clusters = bigger grid
  const baseNodeCount = useMemo(
    () => inputNodes.filter(n => (n.layer || 0) === 0).length,
    [inputNodes]
  );
  const effectiveGridRes = gridResolution || Math.max(10, Math.ceil(Math.sqrt(baseNodeCount) * 2.5));
  const effectiveSpread = Math.max(120, Math.min(400, baseNodeCount * 12));

  // Connectivity per node (for tendril generation + node sizing)
  const connectivity = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of inputEdges) {
      map.set(e.source, (map.get(e.source) || 0) + 1);
      map.set(e.target, (map.get(e.target) || 0) + 1);
    }
    return map;
  }, [inputEdges]);

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

  // Generate heightmap (regenerates when grid resolution changes)
  useEffect(() => {
    const state = stateRef.current;
    const res = effectiveGridRes;
    const map: number[][] = [];
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
  }, [effectiveGridRes]);

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

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const state = stateRef.current;
    const spread = effectiveSpread;
    const res = effectiveGridRes;

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

    // Node position calculator
    const getNodePos = (node: SkillNode3D, time: number): Vec3 => {
      if ((node.layer || 0) === 0) {
        const gx = (node.gridX ?? 0.5) - 0.5;
        const gz = (node.gridZ ?? 0.5) - 0.5;
        const mx = Math.min(res, Math.floor((node.gridX ?? 0.5) * res));
        const mz = Math.min(res, Math.floor((node.gridZ ?? 0.5) * res));
        const meshH = state.heightMap[mz]?.[mx] || 0;
        return {
          x: gx * spread * 2,
          y: meshH * 18 + 15,
          z: gz * spread * 2,
        };
      } else {
        const elevated = inputNodes.filter(n => (n.layer || 0) > 0);
        const idx = elevated.indexOf(node);
        const golden = 0.618033988749895;
        const angle = ((idx * golden) % 1) * Math.PI * 2;
        const r = spread * 0.4 + (node.layer || 1) * 30 + ((idx * golden * 7) % 1) * 30;
        const yBase = -90 - (node.layer || 1) * 50;
        const sway = Math.sin(time * 0.15 + idx * 1.7) * 3;
        return {
          x: Math.cos(angle) * r + sway,
          y: yBase + Math.sin(time * 0.2 + idx * 0.9) * 1.5,
          z: Math.sin(angle) * r,
        };
      }
    };

    // === CONNECTION ARC — strength is structural, animation is breath ===
    const drawArc3D = (
      from: Vec3, to: Vec3,
      w: number, h: number, camAngle: number,
      arcColor: string, strength: number,
      edgeIdx: number, time: number
    ) => {
      const segments = 16;
      const wrapAmount = strength;
      const basePhase = edgeIdx * 0.7;
      const pulse = 0.1 + 0.25 * Math.sin(time * 0.2 + basePhase);

      const swayMag = 45 + 135 * pulse;
      const zMag = 35 + 105 * pulse;
      const hMag = 40 + 120 * pulse;

      const lateralSway = Math.sin(time * 0.35 + basePhase + edgeIdx * 1.3) * swayMag * strength;

      const midX = (from.x + to.x) / 2 + lateralSway;
      const midZ = (from.z + to.z) / 2 + Math.cos(time * 0.28 + basePhase) * zMag * strength;
      const rawArcHeight = Math.min(from.y, to.y) - 30 - Math.abs(from.y - to.y) * 0.3
        - wrapAmount * 40 - Math.sin(time * 0.24 + basePhase) * 1.22 * hMag;
      // Never let arcs dip below the topology grid (y ≈ 15)
      // const arcHeight = Math.min(rawArcHeight, 10);
      const arcHeight = Math.min(rawArcHeight, 1.07);
      // const arcHeight = Math.min(from.y, to.y) - 30 - Math.abs(from.y - to.y) * 0.3 - wrapAmount * 40;

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

      const avgZ = points.reduce((s, p) => s + p.z, 0) / points.length;
      const depthAlpha = Math.max(0.15, Math.min(0.7, 450 / avgZ));

      // Glow pass — wider, fainter stroke for bloom effect (no shadowBlur)
      ctx.beginPath();
      let started = false;
      for (const p of points) {
        if (p.z <= 0) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 3 + strength * 3;
      ctx.globalAlpha = depthAlpha * (0.08 + strength * 0.06);
      ctx.stroke();

      // Core pass
      ctx.lineWidth = 0.8 + strength * 1.2;
      ctx.globalAlpha = depthAlpha * (0.4 + strength * 0.3);
      ctx.stroke();
    };

    // === MAIN RENDER LOOP ===
    const render = () => {
      const w = state.width;
      const h = height;
      state.frame++;
      if (!visibleRef.current) { animId = requestAnimationFrame(render); return; }
      if (!state.dragStart) state.cameraAngle += rotationSpeed * 0.7;
      const time = state.frame * 0.02;
      const camAngle = state.cameraAngle;

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

      // === SIDE PANELS ===
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
        const lpy = (h - panelTotalH) / 2;

        // Left panel
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
          ctx.fillRect(panelMargin, y, panelW * val, barH);
        }

        // Right panel
        const rpx = w - panelMargin - panelW;
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
          ctx.fillRect(rpx, y, panelW * val, barH);
        }
      }

      // === BLUE WIREFRAME MESH (scales with cluster count) ===
      const projGrid: Projected[][] = [];
      for (let z = 0; z <= res; z++) {
        projGrid[z] = [];
        for (let x = 0; x <= res; x++) {
          const nx = (x / res - 0.5) * spread * 2;
          const nz = (z / res - 0.5) * spread * 2;
          const baseH = state.heightMap[z]?.[x] || 0;
          const animH = baseH + Math.sin(x * 0.4 + time * 0.8) * Math.cos(z * 0.3 + time * 0.5) * 0.2;
          projGrid[z][x] = project({ x: nx, y: animH * 18 + 15, z: nz }, w, h, camAngle);
        }
      }

      // Mesh lines along X
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
      // Mesh lines along Z
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

      // Grid intersection numbers
      ctx.font = "7px 'Share Tech Mono', monospace";
      ctx.textAlign = 'center';
      for (let z = 0; z <= res; z += 3) {
        for (let x = 0; x <= res; x += 3) {
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

      // === DRAW CONNECTION ARCS (wrap/unwrap animation modulated by strength) ===
      for (let ei = 0; ei < inputEdges.length; ei++) {
        const edge = inputEdges[ei];
        const fromPos = nodePositions.get(edge.source);
        const toPos = nodePositions.get(edge.target);
        if (!fromPos || !toPos) continue;
        const arcColor = (edge.strength || 0.5) > 0.7 ? '#9C27B0' : '#FF5500';
        drawArc3D(
          fromPos, toPos, w, h, camAngle,
          arcColor, edge.strength || 0.5, ei, time
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
        const nodeColor = node.color || layerColors[node.layer || 0] || '#FFFFFF';
        const conn = connectivity.get(node.id) || 0;
        const connScale = 1 + Math.min(conn, 8) * 0.08;
        const r = isBase
          ? Math.max(2, 2.5 * proj.scale * connScale)
          : Math.max(3, 4.5 * proj.scale * connScale);

        ctx.fillStyle = nodeColor;

        // Outer glow (no shadowBlur)
        ctx.globalAlpha = depthAlpha * 0.08;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Mid glow
        ctx.globalAlpha = depthAlpha * 0.2;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = depthAlpha * 0.9;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (node.label) {
          ctx.globalAlpha = depthAlpha * 0.8;
          ctx.fillStyle = isBase ? '#FFFFFF' : nodeColor;
          ctx.font = isBase ? "7px 'Share Tech Mono', monospace" : "9px 'Share Tech Mono', monospace";
          ctx.textAlign = 'center';
          ctx.fillText(node.label, proj.x, proj.y - r - 3);
        }
      }

      // Grid scaling readout
      ctx.globalAlpha = 0.5;
      ctx.font = "8px 'Share Tech Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00CCFF';
      ctx.fillText(`CLUSTERS:${baseNodeCount}`, 6, h - 30);
      ctx.fillText(`GRID:${res}\u00D7${res}`, 6, h - 18);
      ctx.fillText(`SPREAD:${spread.toFixed(0)}`, 6, h - 6);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FF6600';
      ctx.fillText(`EDGES:${inputEdges.length}`, w - 6, h - 18);
      ctx.fillStyle = '#666';
      ctx.fillText(`FRAME:${state.frame}`, w - 6, h - 6);

      ctx.globalAlpha = 1;
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [inputNodes, inputEdges, effectiveGridRes, effectiveSpread, height, rotationSpeed, showSidePanels, project, connectivity, baseNodeCount]);

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

export const SkillGraph3D = memo(SkillGraph3DBase);
export default SkillGraph3D;
