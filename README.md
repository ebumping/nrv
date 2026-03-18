# NRV Components

A futuristic HUD/LCARS-style React component library for building sci-fi themed interfaces.

Inspired by:
- Star Trek LCARS (Library Computer Access and Retrieval System)
- Military tactical HUD displays
- Retro-futuristic wireframe aesthetics

## Installation

```bash
npm install @nrv/components
```

## Quick Start

```tsx
import {
  HUDContainer,
  TacticalPanel,
  DataReadout,
  PillButton,
  HUDButton,
  Heading,
  Flex,
} from '@nrv/components';
import '@nrv/components/styles.css';

function App() {
  return (
    <HUDContainer fullscreen showGrid>
      <TacticalPanel title="TELEMETRY">
        <DataReadout label="VELOCITY" value={847.3} unit="KTS" />
        <DataReadout label="HEADING" value="127°" />
      </TacticalPanel>
      
      <HUDButton variant="primary">ENGAGE</HUDButton>
      <PillButton color="orange">AUTO</PillButton>
    </HUDContainer>
  );
}
```

## Components

### Layout

- `HUDContainer` - Full-screen container with optional grid and scanlines
- `LCARSLayout` - Star Trek-style layout with header/sidebar/footer
- `Flex` / `Grid` - Layout primitives
- `Card` - Content container with HUD or LCARS styling
- `Spacer` / `Divider` - Spacing utilities

### LCARS Components

- `Elbow` - The signature L-shaped frame element
- `Bar` - Horizontal colored bar
- `BarStack` - Stack of bars for navigation

### HUD Components

- `TacticalPanel` - Bordered panel with corner accents
- `DataReadout` - Numeric data display with status colors
- `Crosshair` - Reticle markers (plus, cross, target)
- `StatusIndicator` - Status dot with label
- `Waveform` - Oscilloscope-style line graph
- `HUDProgress` - Progress bar with glow effect
- `Terrain` - Canvas-based wireframe terrain visualization
- `Marker` - Map markers (diamond, circle, triangle)
- `Coordinates` - Latitude/longitude display

### Buttons

- `PillButton` - LCARS-style rounded pill button
- `HUDButton` - Tactical bordered button
- `IconButton` - Button with icon only
- `ButtonGroup` - Horizontal or vertical button container

### Typography

- `Text` - Generic text with variants
- `Label` - Small uppercase label
- `Heading` - H1-H4 headings
- `DataDisplay` - Label + value with unit
- `Code` - Inline monospace code
- `Blink` - Blinking text effect

### Effects

- `Scanlines` - CRT scanline overlay
- `GridBackground` - Subtle grid pattern

## Theming

The library uses CSS custom properties for theming. Override these in your CSS:

```css
:root {
  --nrv-hud-green: #7CBA6B;
  --nrv-hud-red: #D32F2F;
  --nrv-hud-cyan: #00BCD4;
  --nrv-lcars-orange: #FF9900;
  --nrv-lcars-purple: #996699;
  /* ... more variables */
}
```

Or use the theme object directly:

```tsx
import { colors, typography } from '@nrv/components';

const style = {
  color: colors.hud.green,
  fontFamily: typography.fonts.mono,
};
```

## Demo

```bash
cd demo
npm install
npm run dev
```

Open http://localhost:3000 to see all components in action.

## Design Tokens

### Colors

**HUD Palette:**
- `hud.green` - Primary data color
- `hud.red` - Alert/critical
- `hud.amber` - Warning
- `hud.cyan` - Secondary accent
- `hud.white` - Text
- `hud.whiteDim` - Muted text

**LCARS Palette:**
- `lcars.orange` - Primary
- `lcars.gold` - Secondary
- `lcars.purple` - Tertiary
- `lcars.salmon` - Accent
- `lcars.blue` - Info
- `lcars.tan` - Neutral

### Typography

- `mono` - JetBrains Mono (data, code)
- `condensed` - Roboto Condensed (LCARS text)
- `display` - Orbitron (headings)
- `body` - Inter (body text)

## License

MIT
