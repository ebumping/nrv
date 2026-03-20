import React, { useRef, useEffect, useCallback } from 'react';

/**
 * HexGrid3D - Multi-matrix 3D hexagonal skill taxonomy
 *
 * Multiple hex matrices laid out side-by-side, each representing an agent's
 * skill taxonomy. Right-click drag pans horizontally across matrices.
 * Left-click drag orbits the camera. Some matrices share L2 categories
 * (same labels at same layers) but have different L3 skills — expressing
 * modularity where agents draw from the same pool differently.
 */

export interface HexCell3D {
  id: string;
  label?: string;
  layer: number;
  q: number; // axial coordinate
  r: number; // axial coordinate
  status?: 'active' | 'warning' | 'critical' | 'inactive';
  value?: number;
  group?: number; // which matrix this cell belongs to
  /** Cross-layer correlation strength (0-1). High values glow cyan — entry points / wikispace links */
  correlation?: number;
}

export interface HexGrid3DProps {
  height?: number;
  cells?: HexCell3D[];
  layers?: number;
  hexSize?: number;
  rotationSpeed?: number;
  showConnections?: boolean;
  /** Group names displayed above each matrix */
  groupNames?: string[];
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

  // 5 agent taxonomy groups — L0-L4 deep skill trees
  // Some share L0/L1 category labels (SOC, NET, OPS, PER, LNG) expressing modularity
  const groups = [
    { skills: [
      // L0 broad                          L1 core              L2 applied           L3 specialised       L4 apex
      'SOC', 'COM', 'PER', 'NET', 'LNG',  'POST', 'DM', 'CHAT', 'BIO', 'STYLE',  'EN', 'JP', 'LINK', 'FLRT', 'TONE',  'MEME', 'GRP', 'FEED', 'HIST',  'INFL', 'EMPTH', 'NARR',
    ]},
    { skills: [
      'HAK', 'CRY', 'NET', 'OPS', 'EVD',  'SCAN', 'ENC', 'VPN', 'TOR', 'EXPL',  'PRXY', 'BURN', 'SPOF', 'OSEC', 'HASH',  'CERT', 'KEY', 'WIPE', 'MASK',  'ZERO', 'PRIV', 'GHOST',
    ]},
    { skills: [
      'CRF', 'PER', 'VIS', 'LNG', 'SOC',  'BLOG', 'MEME', 'EDIT', 'IMG', 'GFX',  'BIO', 'FILT', 'POST', 'STYL', 'AI',  'TXT', 'COPY', 'TONE', 'NRTV',  'AURA', 'MYTH', 'ICON',
    ]},
    { skills: [
      'INT', 'RCN', 'SIG', 'TRK', 'OPS',  'OSNT', 'PROF', 'INTC', 'MNTR', 'LOG',  'ALRT', 'VULN', 'MAP', 'OSEC', 'SENT',  'SCRP', 'CORR', 'ANLS', 'RPT',  'PRED', 'FUSE', 'OMNI',
    ]},
    { skills: [
      'PST', 'SCH', 'ADT', 'EXC', 'C2',  'CRON', 'RETR', 'ALIV', 'RUN', 'CMD',  'SYNC', 'PIPE', 'EVLV', 'LERN', 'CTRL',  'FAIL', 'RCVR', 'DPND', 'AUTO',  'SELF', 'META', 'APEX',
    ]},
  ];

  let cellId = 0;
  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    let skillIdx = 0;
    // 5 layers: L0 wide base → L4 apex. Radius shrinks per layer.
    const layerRadii = [2, 2, 1, 1, 0];

    for (let layer = 0; layer < layerRadii.length; layer++) {
      const radius = layerRadii[layer];
      for (let q = -radius; q <= radius; q++) {
        for (let r = -radius; r <= radius; r++) {
          if (Math.abs(-q - r) > radius) continue;
          // Deterministic correlation — ~12% of cells are cross-layer entry points
          const hash = ((cellId * 2654435761) >>> 0) / 4294967296; // Knuth multiplicative hash → 0-1
          const isEntryPoint = hash < 0.12;
          const corrValue = isEntryPoint ? 0.6 + hash * 3.3 : 0; // 0.6–1.0 for entry points

          cells.push({
            id: `hex-${cellId}`,
            label: group.skills[skillIdx % group.skills.length],
            layer,
            q,
            r,
            group: g,
            status: cellId % 7 === 0 ? 'warning' : cellId % 13 === 0 ? 'critical' : cellId % 23 === 0 ? 'inactive' : 'active',
            value: 0.5 + ((cellId * 0.618) % 1) * 0.5,
            correlation: corrValue,
          });
          skillIdx++;
          cellId++;
        }
      }
    }
  }

  return cells;
}

const DEFAULT_GROUP_NAMES = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'];

export function HexGrid3D({
  height = 450,
  cells: inputCells,
  layers = 5,
  hexSize = 16,
  rotationSpeed = 0.004,
  showConnections = true,
  groupNames = DEFAULT_GROUP_NAMES,
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
    // Pan state (right-click drag)
    panOffsetX: number;
    panOffsetY: number;
    panDragStart: { x: number; y: number } | null;
    panOffsetXStart: number;
    panOffsetYStart: number;
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
    panOffsetX: 0,
    panOffsetY: 0,
    panDragStart: null,
    panOffsetXStart: 0,
    panOffsetYStart: 0,
  });

  useEffect(() => {
    stateRef.current.cells = inputCells || generateDefaultCells();
  }, [inputCells]);

  const project = useCallback((point: Vec3, w: number, h: number, camAngle: number): Projected => {
    const fov = 350;
    const camDist = 250 * stateRef.current.zoomLevel;
    const camTilt = stateRef.current.cameraTilt;

    // Apply pan before rotation
    const px = point.x - stateRef.current.panOffsetX;
    const py = point.y - stateRef.current.panOffsetY;

    const cosA = Math.cos(camAngle);
    const sinA = Math.sin(camAngle);
    const rx = px * cosA - point.z * sinA;
    const rz = px * sinA + point.z * cosA;

    const cosT = Math.cos(camTilt);
    const sinT = Math.sin(camTilt);
    const ry = py * cosT - rz * sinT;
    const rz2 = point.y * sinT + rz * cosT;

    const z = rz2 + camDist;
    const scale = fov / Math.max(z, 1);
    return { x: rx * scale + w / 2, y: ry * scale + h / 2, z, scale };
  }, []);

  // Convert hex axial coords to 3D position with group offset
  const hexTo3D = useCallback((q: number, r: number, layer: number, group: number = 0): Vec3 => {
    const size = hexSize;
    const groupSpacing = 180;
    const x = size * (3 / 2 * q) + group * groupSpacing;
    const z = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    const y = -layer * 55;
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
      // No autorotation — right-click drag to pan, left-click to orbit
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

      const breathScale = 1 + Math.sin(time * 0.6) * 0.04;

      // Determine unique groups
      const groupSet = new Set(cells.map(c => c.group ?? 0));
      const groupCount = groupSet.size;

      // Sort cells by projected depth
      const projected = cells.map(cell => {
        const pos = hexTo3D(cell.q, cell.r, cell.layer, cell.group ?? 0);
        const proj = project(pos, w, h, camAngle);
        return { cell, pos, proj };
      }).filter(c => c.proj.z > 0).sort((a, b) => b.proj.z - a.proj.z);

      // Draw inter-layer connections (within same group)
      if (showConnections) {
        const byCoord = new Map<string, typeof projected>();
        for (const item of projected) {
          const key = `${item.cell.group ?? 0},${item.cell.q},${item.cell.r}`;
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

      // Draw cross-group connections for shared labels (same label + layer across groups)
      if (showConnections && groupCount > 1) {
        const byLabel = new Map<string, typeof projected>();
        for (const item of projected) {
          if (!item.cell.label) continue;
          const key = `${item.cell.label},${item.cell.layer}`;
          const existing = byLabel.get(key);
          if (!existing) {
            byLabel.set(key, [item]);
          } else {
            existing.push(item);
          }
        }

        for (const [, items] of byLabel) {
          if (items.length < 2) continue;
          // Only connect across different groups
          const groups = new Set(items.map(i => i.cell.group ?? 0));
          if (groups.size < 2) continue;

          // Draw connections between first instances in different groups
          const byGroup = new Map<number, typeof projected[0]>();
          for (const item of items) {
            const g = item.cell.group ?? 0;
            if (!byGroup.has(g)) byGroup.set(g, item);
          }
          const groupItems = [...byGroup.values()];
          for (let i = 0; i < groupItems.length - 1; i++) {
            const a = groupItems[i];
            const b = groupItems[i + 1];
            const avgZ = (a.proj.z + b.proj.z) / 2;
            ctx.globalAlpha = Math.max(0.03, Math.min(0.12, 200 / avgZ));
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 0.3;
            ctx.setLineDash([1, 4]);
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
        const corr = cell.correlation || 0;
        const isCyanEntry = corr > 0.5;
        const baseColor = isCyanEntry ? '#00DDFF' : STATUS_COLORS[cell.status || 'active'];
        const pulse = cell.status === 'warning' || cell.status === 'critical'
          ? 1 + Math.sin(time * 2 + cell.q * 0.5 + cell.r * 0.7) * 0.15
          : isCyanEntry
            ? 1 + Math.sin(time * 1.2 + cell.q * 0.8 + cell.r * 1.1) * 0.08
            : 1;

        const layerAlpha = 1 - cell.layer * 0.15;

        // Cross-layer correlation glow — larger, softer hex behind the cell
        if (isCyanEntry) {
          const glowIntensity = corr * (0.7 + Math.sin(time * 0.8 + cell.q + cell.r * 1.3) * 0.3);
          drawHex3D(
            ctx, pos, hexSize * 1.4,
            w, h, camAngle,
            '#00DDFF', '#00DDFF',
            layerAlpha * glowIntensity * 0.15, breathScale
          );
        }

        drawHex3D(
          ctx, pos, hexSize * 0.85,
          w, h, camAngle,
          baseColor, baseColor,
          layerAlpha * pulse, breathScale
        );

        // Label
        if (cell.label && proj.scale > 0.5) {
          const depthAlpha = Math.max(0.15, Math.min(0.8, 350 / proj.z));
          ctx.globalAlpha = depthAlpha * layerAlpha * 0.85;
          ctx.fillStyle = isCyanEntry ? '#00DDFF' : baseColor;
          ctx.font = `${Math.max(5, Math.min(8, 7 * proj.scale))}px 'Share Tech Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(cell.label, proj.x, proj.y + 3);
        }
      }

      // Group labels above each matrix
      ctx.font = "9px 'Share Tech Mono', monospace";
      ctx.textAlign = 'center';
      for (let g = 0; g < groupNames.length && g < groupCount; g++) {
        const labelPos = hexTo3D(0, -3, 0, g);
        const lp = project(labelPos, w, h, camAngle);
        if (lp.z > 0) {
          const depthAlpha = Math.max(0.2, Math.min(0.7, 300 / lp.z));
          ctx.globalAlpha = depthAlpha;
          ctx.fillStyle = '#FF6600';
          ctx.fillText(`AGENT ${groupNames[g]}`, lp.x, lp.y - 8);
        }
      }

      // Layer labels per group
      ctx.font = "8px 'Share Tech Mono', monospace";
      ctx.textAlign = 'left';
      for (let g = 0; g < groupCount; g++) {
        for (let l = 0; l < layers; l++) {
          const lp = project(hexTo3D(-3, 0, l, g), w, h, camAngle);
          if (lp.z > 0 && lp.x > 0 && lp.x < w) {
            const depthAlpha = Math.max(0.2, Math.min(0.5, 300 / lp.z));
            ctx.globalAlpha = depthAlpha;
            ctx.fillStyle = '#00CCFF';
            ctx.fillText(`L${l}`, lp.x - 12, lp.y);
          }
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
      ctx.fillText(`SKILLS:${cells.length}`, w - 6, 14);
      ctx.fillText(`GROUPS:${groupCount}`, w - 6, 26);
      ctx.fillText(`LAYERS:${layers}`, w - 6, 38);

      // Pan hint
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.font = "7px 'Share Tech Mono', monospace";
      ctx.fillText('RIGHT-CLICK DRAG TO PAN', w / 2, h - 6);

      ctx.globalAlpha = 1;
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [height, hexSize, rotationSpeed, showConnections, layers, groupNames, project, hexTo3D, drawHex3D]);

  // Mouse: left-click orbit, right-click pan, scroll zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const state = stateRef.current;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        // Right-click: pan (horizontal + vertical)
        state.panDragStart = { x: e.clientX, y: e.clientY };
        state.panOffsetXStart = state.panOffsetX;
        state.panOffsetYStart = state.panOffsetY;
        el.style.cursor = 'move';
      } else {
        // Left-click: camera orbit
        state.dragStart = { x: e.clientX, y: e.clientY };
        state.dragAngleStart = state.cameraAngle;
        state.dragTiltStart = state.cameraTilt;
        el.style.cursor = 'grabbing';
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (state.panDragStart) {
        const dx = e.clientX - state.panDragStart.x;
        const dy = e.clientY - state.panDragStart.y;
        state.panOffsetX = state.panOffsetXStart - dx * 1.5;
        state.panOffsetY = state.panOffsetYStart - dy * 1.5;
      } else if (state.dragStart) {
        const dx = e.clientX - state.dragStart.x;
        const dy = e.clientY - state.dragStart.y;
        state.cameraAngle = state.dragAngleStart + dx * 0.005;
        state.cameraTilt = Math.max(0.1, Math.min(1.2, state.dragTiltStart + dy * 0.005));
      }
    };
    const onMouseUp = () => {
      state.dragStart = null;
      state.panDragStart = null;
      el.style.cursor = 'grab';
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.zoomLevel = Math.max(0.5, Math.min(3, state.zoomLevel + e.deltaY * 0.001));
    };

    el.addEventListener('contextmenu', onContextMenu);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.style.cursor = 'grab';

    return () => {
      el.removeEventListener('contextmenu', onContextMenu);
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
