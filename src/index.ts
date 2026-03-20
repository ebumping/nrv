// NRV Component Library
// Futuristic HUD/LCARS-style React components

// Theme
export { theme, colors, typography, spacing, radii, shadows, animation } from './theme/tokens';
export type { Theme } from './theme/tokens';
export { ThemeProvider, useTheme, generateCSSVariables } from './theme/ThemeProvider';

// LCARS Components
export { Elbow, Bar, BarStack } from './components/Elbow';
export type { ElbowVariant, ElbowColor } from './components/Elbow';

// HUD Components
export { 
  DataReadout, 
  Crosshair, 
  StatusIndicator, 
  Waveform, 
  HUDProgress 
} from './components/HUD';

// Tactical Components
export { 
  TacticalPanel, 
  Scanlines, 
  GridBackground, 
  Terrain, 
  Marker, 
  Coordinates 
} from './components/Tactical';

// Button Components
export { 
  PillButton, 
  HUDButton, 
  IconButton, 
  ButtonGroup 
} from './components/Buttons';

// Layout Components
export { 
  HUDContainer, 
  LCARSLayout, 
  Flex, 
  Grid, 
  Spacer, 
  Divider, 
  Card 
} from './components/Layout';

// Typography Components
export { 
  Text, 
  Label, 
  Heading, 
  DataDisplay, 
  Blink, 
  Code 
} from './components/Typography';

// ═══════════════════════════════════════════════════════════════════════════
// NERV AUTHENTIC COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Core HUD Primitives
export { HUDFrame } from './components/HUDFrame';
export type { HUDFrameProps } from './components/HUDFrame';

export { WaveformMonitor } from './components/WaveformMonitor';
export type { WaveformMonitorProps } from './components/WaveformMonitor';

export { ContourMap } from './components/ContourMap';
export type { ContourMapProps, ContourNode } from './components/ContourMap';

export { 
  HexagonalCluster,
  generateHexGrid,
  generateHexRadial,
} from './components/HexagonalCluster';
export type { 
  HexagonalClusterProps, 
  HexData, 
  HexCluster 
} from './components/HexagonalCluster';

// NERV Panel Components
export { 
  NERVPanel, 
  StatusReadout, 
  SyncRatio, 
  MAGIDecision, 
  AlertBanner as NERVAlertBanner, 
  DataStream, 
  NERVColors 
} from './components/NERVPanel';

// Advanced NERV Components
export {
  Psychograph,
  HexSkillCluster,
  TacticalMap,
  HexTarget,
  PatternIndicator,
  StatusGrid,
  SyncRatioLarge
} from './components/NERVAdvanced';

export { NERVDashboard } from './components/NERVDashboard';

// Alert System
export {
  AlertContext,
  AlertProvider,
  AlertBanner,
  AlertPanel,
  EmergencyOverlay,
  ContaminationGauge,
} from './components/NERVAlert';
export type { AlertLevel } from './components/NERVAlert';

// Radar Display
export {
  RadarDisplay,
  RadarScope,
  SonarDisplay,
} from './components/RadarDisplay';
export type { RadarTarget } from './components/RadarDisplay';

// Effects
export {
  CRTEffectsCSS,
  NERVEntrance,
  StaticNoise,
  BootSequence,
  DataStream as DataStreamTicker,
  CRTOverlay,
} from './components/Effects';

// Hexagonal Display
export { 
  HexagonalTarget, 
  PatternIndicator as PatternBar 
} from './components/HexagonalDisplay';

// Wireframe Display
export {
  WireframeTerrain,
  RadarSweep,
  ZoneBoundary
} from './components/WireframeDisplay';

// 3D Visualizations
export { Topology3D } from './components/Topology3D';
export type { Topology3DProps, Topology3DNode, Topology3DEdge } from './components/Topology3D';

export { Terrain3D } from './components/Terrain3D';
export type { Terrain3DProps, TerrainBlip } from './components/Terrain3D';

export { SkillGraph3D } from './components/SkillGraph3D';
export type { SkillGraph3DProps, SkillNode3D, SkillEdge3D } from './components/SkillGraph3D';

export { HoloGlobe } from './components/HoloGlobe';
export type { HoloGlobeProps, GlobeMarker } from './components/HoloGlobe';

export { HexGrid3D } from './components/HexGrid3D';
export type { HexGrid3DProps, HexCell3D } from './components/HexGrid3D';

export { TacticalDisplay } from './components/TacticalDisplay';
export type { TacticalDisplayProps, TacticalUnit } from './components/TacticalDisplay';

// Hexagonal Skill Matrix
export { HexagonalSkillMatrix, MiniHexGrid, HexProgressRing } from './components/HexagonalSkillMatrix';
export type { HexagonalSkillMatrixProps, SkillNode as HexSkillNode, MiniHexGridProps, HexProgressRingProps } from './components/HexagonalSkillMatrix';
