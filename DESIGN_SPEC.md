# NERV UI DESIGN SPECIFICATION
## Neon Genesis Evangelion - Authentic Interface Design Language

Based on detailed analysis of NERV HQ interfaces from the TV series and Rebuild films.

---

## 1. COLOR PALETTE - TRUE EVA (NOT DUSTY AMBER)

The Eva aesthetic is HIGH CONTRAST: BLACK / WHITE / RED with green/cyan accents.
NO DUSTY AMBER - that's generic sci-fi.

### Primary Colors (Sharp, Industrial)

| Name | Hex | Usage |
|------|-----|-------|
| **NERV_RED** | `#FF0000` | Primary accent, alerts, NERV branding |
| **NERV_CRIMSON** | `#DC143C` | Warnings, danger states |
| **NERV_CRIMSON_DARK** | `#8B0000` | Dark red backgrounds, panel headers |
| **NERV_BLOOD** | `#660000` | Severe alerts, deep danger |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| **NERV_WHITE** | `#FFFFFF` | Primary text, sharp contrast |
| **NERV_OFF_WHITE** | `#E8E8E8` | Secondary text |
| **NERV_TEXT** | `#CCCCCC` | Normal text |
| **NERV_TEXT_DIM** | `#666666` | Labels, dimmed text |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **NERV_GREEN** | `#00FF41` | Status OK, positive, sync ratio |
| **NERV_CYAN** | `#00FFFF` | Pattern Blue, data, MAGI Balthasar |
| **NERV_ORANGE** | `#FF6600` | MAGI Caspar, warnings |
| **NERV_YELLOW** | `#FFFF00` | Caution, highlights |

### Background Colors (Deep Black)

| Name | Hex | Usage |
|------|-----|-------|
| **NERV_BLACK** | `#000000` | True black background |
| **NERV_PANEL** | `#0A0A0A` | Panel backgrounds |
| **NERV_BORDER** | `#1A1A1A` | Subtle borders |
| **NERV_BORDER_BRIGHT** | `#333333` | Visible borders |

### MAGI Node Colors

| Node | Hex | Meaning |
|------|-----|---------|
| **CASPAR** | `#FF8C00` | Logic/Reasoning (Mother as woman) |
| **MELCHIOR** | `#39FF14` | Science/Analysis (Mother as scientist) |
| **BALTHASAR** | `#00CED1` | Emotion/Humanity (Mother as mother) |

### Alert Levels

| Level | Hex | Usage |
|-------|-----|-------|
| **NORMAL** | `#39FF14` | All systems nominal |
| **CAUTION** | `#FFD700` | Elevated awareness |
| **WARNING** | `#FF8C00` | Potential issue |
| **DANGER** | `#FF4500` | Serious problem |
| **CRITICAL** | `#DC143C` | Immediate attention |
| **EMERGENCY** | `#FF0000` | Maximum alert |

---

## 2. TYPOGRAPHY

### Primary Fonts

- **English**: `Courier New`, `Consolas`, `monospace`
- **Japanese**: `MS Gothic`, `M+ 2m`, `monospace`
- **Numbers**: Fixed-width monospace

### Text Treatments

```css
/* Standard readout text */
.nerv-text {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #FF8C00;
    text-shadow: 0 0 4px currentColor;
}

/* Large values (sync ratio, percentages) */
.nerv-value {
    font-size: 24px;
    font-weight: bold;
    text-shadow: 
        0 0 5px currentColor,
        0 0 10px currentColor,
        0 0 20px currentColor;
}

/* Japanese labels */
.nerv-label-ja {
    font-family: 'MS Gothic', 'M+ 2m', monospace;
    font-size: 10px;
    color: #39FF14;
    letter-spacing: 0.1em;
}
```

### Text Hierarchy

1. **Section Headers**: 14px, uppercase, letter-spacing: 3px, amber
2. **Labels**: 10px, uppercase, letter-spacing: 1px, amber-dim
3. **Values**: 18-24px, bold, with glow effect
4. **Data Streams**: 8-9px, monospace, scrolling

---

## 3. LAYOUT PATTERNS

### Hexagonal Grid System

NERV uses **flat-top hexagons** (pointy sides) in honeycomb arrangements:

```
  ⬡⬡⬡⬡⬡
 ⬡⬡⬡⬡⬡⬡
⬡⬡⬡⬡⬡⬡⬡
 ⬡⬡⬡⬡⬡⬡
  ⬡⬡⬡⬡⬡
```

Hexagon geometry (flat-top):
- Angle offset: -30° (first point at upper-right)
- Size ratio: width = size * 2, height = size * √3
- Spacing: horizontal = size * 1.5, vertical = size * √3

### Panel Composition

```
┌─────────────────────────────────┐  <- Angled corners (45°)
│▓▓▓▓▓▓ SECTION TITLE ▓▓▓▓▓▓▓▓▓▓▓│  <- Crimson header bar
├─────────────────────────────────┤  <- Amber divider
│                                 │
│  [DATA CELL]  [DATA CELL]       │  <- Grid layout
│  [DATA CELL]  [DATA CELL]       │
│                                 │
│  ───────────────────────        │  <- Separator
│  STATUS: ACTIVE                 │
│                                 │
└─────────────────────────────────┘
```

### Angular Geometry

- **No rounded corners** - all angles are 90° or 45°
- **Chamfered corners** - 45° cuts on panel corners
- **Diagonal lines** - used for separators and borders
- **Triangular indicators** - arrows and pointers

---

## 4. UI ELEMENT TYPES

### MAGI Decision Display

Three circular nodes connected by lines:
- Shows consensus/rejection state
- Nodes pulse when processing
- Connection lines show data flow
- Result displayed below (賛成/反対/棄権)

### Sync Ratio Display

Large percentage value with:
- Circular gauge background
- Segment indicators around perimeter
- Color based on value (green < 100%, amber < 200%, red > 200%)
- Warning text for abnormal readings

### Status Readout Panel

Grid of labeled values:
```
┌─────────────┬─────────────┐
│ DEPTH: 847m │ TEMP: 28.4° │
├─────────────┼─────────────┤
│ PRESS: ATM  │ O2: 21.4%   │
└─────────────┴─────────────┘
```

### Hexagonal Target Display

- Central hexagon with targeting reticle
- Surrounding hexagons for related data
- Radial text labels
- Distance/range indicators

### Map Display

- Wireframe terrain
- Grid overlay
- Moving blips/tracks
- Zone boundaries (angular polygons)

### Alert Banner

- Full-width banner
- Flashing background (red/black)
- Large alert text (Japanese + English)
- Threat level indicator

---

## 5. VISUAL EFFECTS

### CRT Scanlines

```css
.scanlines {
    background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.15) 0px,
        rgba(0, 0, 0, 0.15) 1px,
        transparent 1px,
        transparent 2px
    );
}
```

### Phosphor Glow

```css
.glow {
    text-shadow:
        0 0 4px currentColor,
        0 0 8px currentColor,
        0 0 16px currentColor;
}
```

### Screen Vignette

```css
.vignette {
    box-shadow: inset 0 0 150px rgba(0, 0, 0, 0.7);
}
```

### Flicker Animation

```css
@keyframes flicker {
    0% { opacity: 0.97; }
    5% { opacity: 1; }
    10% { opacity: 0.98; }
    15% { opacity: 1; }
    100% { opacity: 0.99; }
}
```

### Blink Animation (Alerts)

```css
@keyframes alert-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
}
```

---

## 6. ANIMATION PATTERNS

### Data Stream

Text/data scrolling horizontally:
- Right-to-left at constant speed
- Random data characters (numbers, symbols)
- Fades at edges

### Pulse Glow

Elements breathing:
- 2-second cycle
- Glow intensity varies 50%-100%
- Synchronized across related elements

### Entrance Sequence

```
1. Screen static/noise (0.3s)
2. Text appears character by character
3. Panels slide in from edges
4. Data populates with flash
5. System ready indicator
```

### Alert Flash

```
1. Background turns red
2. Text appears
3. Flashes at 2Hz
4. Continues until acknowledged
```

---

## 7. JAPANESE UI TEXT

Common NERV interface terms:

| Japanese | Romaji | English |
|----------|--------|---------|
| 状態 | joutai | STATUS |
| 警告 | keikoku | WARNING |
| 危険 | kiken | DANGER |
| 正常 | seijou | NORMAL |
| 異常 | ijou | ABNORMAL |
| 同期率 | doukiritsu | SYNC RATIO |
| 賛成 | sansei | APPROVE |
| 反対 | hantai | OPPOSE |
| 棄権 | kiken | ABSTAIN |
| 起動 | kidou | STARTUP/ACTIVATE |
| 停止 | teishi | STOP |
| 緊急 | kinkyuu | EMERGENCY |
| 深度 | shindo | DEPTH |
| 温度 | ondo | TEMPERATURE |

---

## 8. COMPONENT ARCHITECTURE

### SVG-Based Components

All visual elements should be SVG for:
- Crisp rendering at any scale
- Authentic CRT appearance
- Filter effects (glow, blur)
- Animation support

### Filter Definitions

```xml
<defs>
    <!-- Phosphor glow -->
    <filter id="phosphor-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
    
    <!-- CRT scanlines -->
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
    </pattern>
    
    <!-- Vignette -->
    <radialGradient id="vignette">
        <stop offset="60%" stop-color="transparent"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.7)"/>
    </radialGradient>
</defs>
```

---

## 9. SKILL_GRAPH MAPPING

### Skill → Eva Unit Status

| Skill Property | NERV Equivalent |
|----------------|-----------------|
| Skill ID | UNIT ID (EVA-01, etc.) |
| Status | 同期率 (SYNC RATIO) |
| Capabilities | 装備 (EQUIPMENT) |
| Dependencies | リンク (LINKS) |
| Confidence | 信頼度 (RELIABILITY) |

### Claim → MAGI Decision

| Claim Property | NERV Equivalent |
|----------------|-----------------|
| Claim ID | 判定番号 (DECISION NO.) |
| Validation | MAGI VOTE (3 nodes) |
| Sources | データ参照 (DATA REF) |
| Status | 賛成/反対/棄権 |

### SkillChain → Command Sequence

| Chain Property | NERV Equivalent |
|----------------|-----------------|
| Chain ID | 作戦番号 (OPERATION NO.) |
| Steps | フェーズ (PHASES) |
| Progress | 進捗率 (PROGRESS %) |
| Status | 実行状態 (EXEC STATUS) |

---

## 10. IMPLEMENTATION NOTES

1. **No CSS approximations** - Use SVG for all graphical elements
2. **True phosphor colors** - Not generic greens/ambers
3. **Proper hex geometry** - Flat-top hexagons, correct spacing
4. **Japanese authenticity** - Proper character rendering
5. **CRT fidelity** - Scanlines, bloom, vignette as filters
6. **Animation timing** - Match the tense, urgent feel of the anime
7. **Information density** - NERV displays are dense; don't over-simplify
8. **No rounded corners** - Angular geometry only
