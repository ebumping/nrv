import { useRef, useEffect, useCallback } from 'react';

/**
 * HoloGlobe - 3D wireframe globe/sphere display
 *
 * Rotating wireframe sphere with latitude/longitude grid lines,
 * data points on the surface, and surrounding readout elements.
 * Inspired by NERV global monitoring displays.
 */

export interface GlobeMarker {
  id: string;
  /** Latitude in degrees (-90 to 90) */
  lat: number;
  /** Longitude in degrees (-180 to 180) */
  lon: number;
  label?: string;
  color?: string;
  size?: number;
  pulse?: boolean;
}

export interface HoloGlobeProps {
  /** Component height */
  height?: number;
  /** Globe radius in pixels */
  radius?: number;
  /** Wireframe color */
  wireColor?: string;
  /** Rotation speed */
  rotationSpeed?: number;
  /** Surface markers */
  markers?: GlobeMarker[];
  /** Number of latitude lines */
  latLines?: number;
  /** Number of longitude lines */
  lonLines?: number;
  /** Show atmosphere glow */
  showGlow?: boolean;
  /** Show equator highlight */
  showEquator?: boolean;
  className?: string;
}

interface Vec3 { x: number; y: number; z: number; }
interface Projected { x: number; y: number; z: number; visible: boolean; }

const DEFAULT_MARKERS: GlobeMarker[] = [
  { id: 'nerv-hq', lat: 35.6, lon: 139.7, label: 'NERV-HQ', color: '#FF6600', pulse: true },
  { id: 'nerv-02', lat: 48.8, lon: 2.3, label: 'NERV-02', color: '#00CCFF' },
  { id: 'nerv-03', lat: 40.7, lon: -74, label: 'NERV-03', color: '#00CCFF' },
  { id: 'target', lat: -15, lon: 100, label: 'PATTERN BLUE', color: '#DC143C', pulse: true, size: 5 },
  { id: 'nerv-04', lat: 55.7, lon: 37.6, label: 'NERV-04', color: '#00FF66' },
  { id: 'relay-1', lat: -33.8, lon: 151.2, label: 'RELAY', color: '#FFAA00' },
];

export function HoloGlobe({
  height = 300,
  radius: inputRadius,
  wireColor = '#FF8800',
  rotationSpeed = 0.005,
  markers = DEFAULT_MARKERS,
  latLines = 12,
  lonLines = 18,
  showGlow = true,
  showEquator = true,
  className,
}: HoloGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    rotY: number;
    tilt: number;
    frame: number;
    width: number;
    dragStart: { x: number; y: number } | null;
    dragAngleStart: number;
    dragTiltStart: number;
    zoomLevel: number;
  }>({
    rotY: 0,
    tilt: 0.2,
    frame: 0,
    width: 400,
    dragStart: null,
    dragAngleStart: 0,
    dragTiltStart: 0,
    zoomLevel: 1,
  });

  // Convert lat/lon to 3D point on unit sphere
  const latLonTo3D = useCallback((lat: number, lon: number, r: number): Vec3 => {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    return {
      x: r * Math.cos(latRad) * Math.sin(lonRad),
      y: -r * Math.sin(latRad),
      z: r * Math.cos(latRad) * Math.cos(lonRad),
    };
  }, []);

  // Project 3D point with Y rotation
  const projectPoint = useCallback((point: Vec3, w: number, h: number, rotY: number): Projected => {
    const cosA = Math.cos(rotY);
    const sinA = Math.sin(rotY);
    const rx = point.x * cosA - point.z * sinA;
    const rz = point.x * sinA + point.z * cosA;

    // Tilt
    const tilt = stateRef.current.tilt;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const ry = point.y * cosT - rz * sinT;
    const rz2 = point.y * sinT + rz * cosT;

    const zoom = stateRef.current.zoomLevel;
    return {
      x: rx / zoom + w / 2,
      y: ry / zoom + h / 2,
      z: rz2,
      visible: rz2 < 0, // Front-facing
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

    const render = () => {
      const w = state.width;
      const h = height;
      const r = inputRadius || Math.min(w, h) * 0.35;
      state.frame++;
      if (!state.dragStart) state.rotY += rotationSpeed;
      const rotY = state.rotY;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // Atmosphere glow
      if (showGlow) {
        const gradient = ctx.createRadialGradient(w / 2, h / 2, r * 0.8, w / 2, h / 2, r * 1.4);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `${wireColor}08`);
        gradient.addColorStop(0.8, `${wireColor}15`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // === DRAW LONGITUDE LINES ===
      for (let i = 0; i < lonLines; i++) {
        const lon = (i / lonLines) * 360 - 180;
        const segments = 60;
        for (let j = 0; j < segments; j++) {
          const lat1 = (j / segments) * 180 - 90;
          const lat2 = ((j + 1) / segments) * 180 - 90;
          const p1 = latLonTo3D(lat1, lon, r);
          const p2 = latLonTo3D(lat2, lon, r);
          const proj1 = projectPoint(p1, w, h, rotY);
          const proj2 = projectPoint(p2, w, h, rotY);

          const alpha = (proj1.visible && proj2.visible) ? 0.5 :
                        (!proj1.visible && !proj2.visible) ? 0.1 : 0.2;
          const lw = (proj1.visible && proj2.visible) ? 0.8 : 0.3;

          ctx.beginPath();
          ctx.moveTo(proj1.x, proj1.y);
          ctx.lineTo(proj2.x, proj2.y);
          ctx.strokeStyle = wireColor;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = lw;
          ctx.stroke();
        }
      }

      // === DRAW LATITUDE LINES ===
      for (let i = 1; i < latLines; i++) {
        const lat = (i / latLines) * 180 - 90;
        const segments = 72;
        for (let j = 0; j < segments; j++) {
          const lon1 = (j / segments) * 360 - 180;
          const lon2 = ((j + 1) / segments) * 360 - 180;
          const p1 = latLonTo3D(lat, lon1, r);
          const p2 = latLonTo3D(lat, lon2, r);
          const proj1 = projectPoint(p1, w, h, rotY);
          const proj2 = projectPoint(p2, w, h, rotY);

          const alpha = (proj1.visible && proj2.visible) ? 0.5 :
                        (!proj1.visible && !proj2.visible) ? 0.08 : 0.2;
          const lw = (proj1.visible && proj2.visible) ? 0.8 : 0.3;

          ctx.beginPath();
          ctx.moveTo(proj1.x, proj1.y);
          ctx.lineTo(proj2.x, proj2.y);
          ctx.strokeStyle = wireColor;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = lw;
          ctx.stroke();
        }
      }

      // === EQUATOR HIGHLIGHT ===
      if (showEquator) {
        const segments = 72;
        for (let j = 0; j < segments; j++) {
          const lon1 = (j / segments) * 360 - 180;
          const lon2 = ((j + 1) / segments) * 360 - 180;
          const p1 = latLonTo3D(0, lon1, r);
          const p2 = latLonTo3D(0, lon2, r);
          const proj1 = projectPoint(p1, w, h, rotY);
          const proj2 = projectPoint(p2, w, h, rotY);

          const alpha = (proj1.visible && proj2.visible) ? 0.8 :
                        (!proj1.visible && !proj2.visible) ? 0.15 : 0.35;
          const lw = (proj1.visible && proj2.visible) ? 1.5 : 0.5;

          ctx.beginPath();
          ctx.moveTo(proj1.x, proj1.y);
          ctx.lineTo(proj2.x, proj2.y);
          ctx.strokeStyle = '#FFAA00';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = lw;
          ctx.stroke();
        }
      }

      // === DRAW MARKERS ===
      for (const marker of markers) {
        const p3d = latLonTo3D(marker.lat, marker.lon, r);
        const proj = projectPoint(p3d, w, h, rotY);

        if (!proj.visible) continue; // Only show front-facing markers

        const mColor = marker.color || wireColor;
        const mSize = marker.size || 3;

        // Pulse ring
        if (marker.pulse) {
          const pulse = 1 + 0.5 * Math.sin(state.frame * 0.08);
          ctx.globalAlpha = 0.15 * pulse;
          ctx.fillStyle = mColor;
          ctx.shadowColor = mColor;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, mSize * 4 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = mColor;
        ctx.shadowColor = mColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, mSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = 0.9;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, mSize, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (marker.label) {
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = mColor;
          ctx.shadowBlur = 2;
          ctx.font = "9px 'Share Tech Mono', monospace";
          ctx.textAlign = 'left';
          ctx.fillText(marker.label, proj.x + mSize + 5, proj.y + 3);

          // Leader line
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = mColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(proj.x + mSize, proj.y);
          ctx.lineTo(proj.x + mSize + 4, proj.y);
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;

      // === CORNER DATA READOUTS ===
      ctx.globalAlpha = 0.6;
      ctx.font = "9px 'Share Tech Mono', monospace";

      // Top left
      ctx.fillStyle = wireColor;
      ctx.textAlign = 'left';
      ctx.fillText('GLOBAL MONITOR', 8, 14);
      ctx.fillStyle = '#666';
      ctx.fillText('全球監視', 8, 26);

      // Top right
      ctx.textAlign = 'right';
      ctx.fillStyle = '#00FF66';
      const rotDeg = Math.floor((state.rotY * 180 / Math.PI) % 360);
      ctx.fillText(`ROT: ${rotDeg}°`, w - 8, 14);
      ctx.fillStyle = wireColor;
      ctx.fillText(`MRK: ${markers.length}`, w - 8, 26);

      // Bottom readouts
      ctx.textAlign = 'left';
      ctx.fillStyle = '#666';
      ctx.fillText('COVERAGE: 94.7%', 8, h - 8);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#00CCFF';
      ctx.fillText('LINK: ACTIVE', w - 8, h - 8);

      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [height, inputRadius, wireColor, rotationSpeed, markers, latLines, lonLines, showGlow, showEquator, latLonTo3D, projectPoint]);

  // Mouse drag-to-orbit and scroll-to-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const state = stateRef.current;

    const onMouseDown = (e: MouseEvent) => {
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.dragAngleStart = state.rotY;
      state.dragTiltStart = state.tilt;
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!state.dragStart) return;
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      state.rotY = state.dragAngleStart + dx * 0.005;
      state.tilt = Math.max(-0.5, Math.min(1.0, state.dragTiltStart + dy * 0.005));
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

export default HoloGlobe;
