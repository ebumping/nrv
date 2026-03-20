import { useRef, useEffect, useCallback } from 'react';

/**
 * Topology3D - 3D force-directed network graph
 *
 * Canvas-based rotating 3D topology visualization.
 * Nodes float in 3D space connected by glowing edges.
 * Auto-rotating camera with depth-based rendering.
 */

export interface Topology3DNode {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  z?: number;
  color?: string;
  size?: number;
  pulse?: boolean;
}

export interface Topology3DEdge {
  source: string;
  target: string;
  strength?: number;
}

export interface Topology3DProps {
  width?: number | string;
  height?: number;
  nodes?: Topology3DNode[];
  edges?: Topology3DEdge[];
  color?: string;
  gridColor?: string;
  rotationSpeed?: number;
  showGrid?: boolean;
  interactive?: boolean;
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

interface SimNode extends Vec3 {
  id: string;
  label?: string;
  color: string;
  size: number;
  pulse: boolean;
  vx: number;
  vy: number;
  vz: number;
}

const DEFAULT_NODES: Topology3DNode[] = [
  { id: 'n1', label: 'A1', color: '#00CCFF', pulse: true },
  { id: 'n2', label: 'A2', color: '#00CCFF' },
  { id: 'n3', label: 'A3', color: '#00FF66', pulse: true },
  { id: 'n4', label: 'A4', color: '#00CCFF' },
  { id: 'n5', label: 'A5', color: '#FF6600' },
  { id: 'n6', label: 'A6', color: '#00CCFF', pulse: true },
  { id: 'n7', label: 'A7', color: '#FF00CC' },
];

const DEFAULT_EDGES: Topology3DEdge[] = [
  { source: 'n1', target: 'n2', strength: 0.8 },
  { source: 'n1', target: 'n3', strength: 0.6 },
  { source: 'n2', target: 'n4', strength: 0.7 },
  { source: 'n3', target: 'n5', strength: 0.5 },
  { source: 'n4', target: 'n6', strength: 0.6 },
  { source: 'n5', target: 'n7', strength: 0.4 },
  { source: 'n6', target: 'n1', strength: 0.3 },
  { source: 'n3', target: 'n6', strength: 0.5 },
  { source: 'n2', target: 'n5', strength: 0.4 },
  { source: 'n7', target: 'n4', strength: 0.3 },
];

export function Topology3D({
  height = 300,
  nodes: inputNodes = DEFAULT_NODES,
  edges: inputEdges = DEFAULT_EDGES,
  color = '#00CCFF',
  gridColor = '#00CCFF',
  rotationSpeed = 0.003,
  showGrid = true,
  className,
}: Topology3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    simNodes: SimNode[];
    cameraAngle: number;
    cameraTilt: number;
    frame: number;
    width: number;
    dragStart: { x: number; y: number } | null;
    dragAngleStart: number;
    dragTiltStart: number;
    zoomLevel: number;
  }>({
    simNodes: [],
    cameraAngle: -0.8,
    cameraTilt: 0.5,
    frame: 0,
    width: 600,
    dragStart: null,
    dragAngleStart: 0,
    dragTiltStart: 0,
    zoomLevel: 1,
  });

  // 3D projection
  const project = useCallback((point: Vec3, w: number, h: number, camAngle: number, camTilt: number): Projected => {
    const fov = 400;
    const camDist = 300 * stateRef.current.zoomLevel;

    // Rotate around Y axis (camera orbit)
    const cosA = Math.cos(camAngle);
    const sinA = Math.sin(camAngle);
    let rx = point.x * cosA - point.z * sinA;
    let rz = point.x * sinA + point.z * cosA;
    let ry = point.y;

    // Tilt around X axis
    const cosT = Math.cos(camTilt);
    const sinT = Math.sin(camTilt);
    const ry2 = ry * cosT - rz * sinT;
    const rz2 = ry * sinT + rz * cosT;

    // Move camera back
    const z = rz2 + camDist;
    const scale = fov / Math.max(z, 1);

    return {
      x: rx * scale + w / 2,
      y: ry2 * scale + h / 2,
      z,
      scale,
    };
  }, []);

  // Initialize simulation nodes
  useEffect(() => {
    const state = stateRef.current;
    const spread = 140;

    state.simNodes = inputNodes.map((node, i) => {
      const angle = (i / inputNodes.length) * Math.PI * 2;
      // Deterministic radius using golden ratio for even distribution
      const golden = 0.618033988749895;
      const r = spread * (0.5 + (((i * golden) % 1) * 0.4));
      // Distribute Y positions evenly with slight variation
      const ySpread = ((i % 3) - 1) * spread * 0.25 + ((i * golden * 17) % 1 - 0.5) * spread * 0.15;

      return {
        id: node.id,
        label: node.label,
        color: node.color || color,
        size: node.size || 4,
        pulse: node.pulse || false,
        x: node.x ?? Math.cos(angle) * r,
        y: node.y ?? ySpread,
        z: node.z ?? Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        vz: 0,
      };
    });
  }, [inputNodes, color]);

  // Main render loop
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

    // Build edge lookup
    const edgeMap = new Map<string, number>();
    for (const n of state.simNodes) edgeMap.set(n.id, state.simNodes.indexOf(n));

    const render = () => {
      const w = state.width;
      const h = height;
      state.frame++;
      const time = state.frame * 0.016;
      // No auto-rotation — agents drift in latent vectorspace, camera is user-controlled

      // Force simulation: strong settle for first 200 frames, then gentle latent-space drift
      {
        const settling = state.frame < 200;
        const dt = settling ? 0.3 : 0.15;
        const repulsion = settling ? 4000 : 800;
        const attraction = settling ? 0.003 : 0.0008;
        const damping = settling ? 0.85 : 0.96;
        const centering = settling ? 0.001 : 0.0004;

        for (let i = 0; i < state.simNodes.length; i++) {
          const a = state.simNodes[i];
          // Latent-space drift: gentle per-node oscillation after settling
          if (!settling) {
            const phase = i * 2.39996; // golden angle
            a.vx += Math.sin(time * 0.12 + phase) * 0.04;
            a.vy += Math.cos(time * 0.09 + phase * 1.3) * 0.03;
            a.vz += Math.sin(time * 0.11 + phase * 0.7) * 0.04;
          }
          for (let j = i + 1; j < state.simNodes.length; j++) {
            const b = state.simNodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = a.z - b.z;
            const dist2 = dx * dx + dy * dy + dz * dz + 1;
            const force = repulsion / dist2;
            const dist = Math.sqrt(dist2);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            const fz = (dz / dist) * force;
            a.vx += fx * dt;
            a.vy += fy * dt;
            a.vz += fz * dt;
            b.vx -= fx * dt;
            b.vy -= fy * dt;
            b.vz -= fz * dt;
          }
          a.vx -= a.x * centering;
          a.vy -= a.y * centering;
          a.vz -= a.z * centering;
        }

        for (const edge of inputEdges) {
          const ai = edgeMap.get(edge.source);
          const bi = edgeMap.get(edge.target);
          if (ai === undefined || bi === undefined) continue;
          const a = state.simNodes[ai];
          const b = state.simNodes[bi];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
          const targetDist = 80;
          const force = (dist - targetDist) * attraction * (edge.strength || 0.5);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;
          a.vx += fx;
          a.vy += fy;
          a.vz += fz;
          b.vx -= fx;
          b.vy -= fy;
          b.vz -= fz;
        }

        for (const n of state.simNodes) {
          n.vx *= damping;
          n.vy *= damping;
          n.vz *= damping;
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          n.z += n.vz * dt;
        }
      }

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const camAngle = state.cameraAngle;
      const camTilt = state.cameraTilt;

      // Draw grid plane
      if (showGrid) {
        const gridY = 80;
        const gridSz = 250;
        const gridStep = 35;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.6;

        for (let i = -gridSz; i <= gridSz; i += gridStep) {
          // Lines along X
          const p1 = project({ x: i, y: gridY, z: -gridSz }, w, h, camAngle, camTilt);
          const p2 = project({ x: i, y: gridY, z: gridSz }, w, h, camAngle, camTilt);
          if (p1.z > 0 && p2.z > 0) {
            ctx.globalAlpha = 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Lines along Z
          const p3 = project({ x: -gridSz, y: gridY, z: i }, w, h, camAngle, camTilt);
          const p4 = project({ x: gridSz, y: gridY, z: i }, w, h, camAngle, camTilt);
          if (p3.z > 0 && p4.z > 0) {
            ctx.globalAlpha = 0.22;
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
          }
        }
      }

      // Project all nodes for depth sorting
      const projected = state.simNodes.map((n, i) => ({
        idx: i,
        node: n,
        proj: project(n, w, h, camAngle, camTilt),
      }));

      // Sort by depth (far to near)
      projected.sort((a, b) => b.proj.z - a.proj.z);

      // Draw edges — double-stroke for glow without shadowBlur
      for (const edge of inputEdges) {
        const ai = edgeMap.get(edge.source);
        const bi = edgeMap.get(edge.target);
        if (ai === undefined || bi === undefined) continue;
        const a = state.simNodes[ai];
        const b = state.simNodes[bi];
        const pa = project(a, w, h, camAngle, camTilt);
        const pb = project(b, w, h, camAngle, camTilt);
        if (pa.z <= 0 || pb.z <= 0) continue;

        const avgZ = (pa.z + pb.z) / 2;
        const strength = edge.strength || 0.5;
        const depthAlpha = Math.max(0.05, Math.min(0.6, 400 / avgZ)) * strength;

        // Outer glow pass (wide, transparent)
        ctx.globalAlpha = depthAlpha * 0.25;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 3 + strength * 2;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();

        // Core line
        ctx.globalAlpha = depthAlpha;
        ctx.lineWidth = 0.8 + strength * 0.6;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Draw nodes — multi-pass glow without shadowBlur
      for (const item of projected) {
        const { node, proj } = item;
        if (proj.z <= 0) continue;

        const depthAlpha = Math.max(0.3, Math.min(1, 500 / proj.z));
        const baseRadius = node.size * proj.scale;
        const r = Math.max(2, Math.min(12, baseRadius));

        const pulseScale = node.pulse
          ? 1 + 0.3 * Math.sin(state.frame * 0.08 + item.idx)
          : 1;

        ctx.fillStyle = node.color;

        // Outer glow (wide, faint)
        ctx.globalAlpha = depthAlpha * 0.08 * pulseScale;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 3.5 * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Mid glow
        ctx.globalAlpha = depthAlpha * 0.15 * pulseScale;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 2.2 * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.globalAlpha = depthAlpha * 0.35;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = depthAlpha * 0.95;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.globalAlpha = depthAlpha * 0.8;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (node.label && r > 3) {
          ctx.globalAlpha = depthAlpha * 0.9;
          ctx.fillStyle = '#FF6600';
          ctx.font = `${Math.max(8, Math.min(11, r * 1.5))}px 'Share Tech Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(node.label, proj.x, proj.y - r - 5);
        }
      }

      // Draw vertical lines from nodes to grid
      if (showGrid) {
        for (const item of projected) {
          const { node, proj } = item;
          if (proj.z <= 0) continue;
          const gridProj = project({ x: node.x, y: 80, z: node.z }, w, h, camAngle, camTilt);
          if (gridProj.z <= 0) continue;
          const depthAlpha = Math.max(0.08, Math.min(0.25, 300 / proj.z));
          ctx.globalAlpha = depthAlpha;
          ctx.strokeStyle = node.color;
          ctx.setLineDash([2, 4]);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(proj.x, proj.y);
          ctx.lineTo(gridProj.x, gridProj.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Corner readouts
      ctx.fillStyle = '#00FF66';
      ctx.font = "10px 'Share Tech Mono', monospace";
      ctx.globalAlpha = 0.7;
      ctx.textAlign = 'left';
      ctx.fillText(`+ ${String(state.simNodes.length).padStart(8, '0')}`, 8, 14);
      ctx.fillText(`- ${String(inputEdges.length).padStart(8, '0')}`, 8, h - 8);
      ctx.textAlign = 'right';
      ctx.fillText(`${String(Math.floor(state.cameraAngle * 57.3) % 360).padStart(8, '0')}`, w - 8, 14);
      ctx.fillText(`+ ${String(state.frame).padStart(8, '0')}`, w - 8, h - 8);
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [inputNodes, inputEdges, height, color, gridColor, rotationSpeed, showGrid, project]);

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

export default Topology3D;
