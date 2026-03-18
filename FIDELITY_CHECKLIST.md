# NERV UI Visual Fidelity Checklist

Track progress toward faithful replication of Evangelion UI.

## COLOR PALETTE ✓

| Requirement | Status | Notes |
|------------|--------|-------|
| NO DUSTY AMBER | ✓ | Red/Black/White with green/cyan accents only |
| NERV_RED #FF0000 | ✓ | Used for accents, alerts, branding |
| NERV_CRIMSON #DC143C | ✓ | Headers, warnings |
| NERV_GREEN #00FF41 | ✓ | Status OK, sync ratio |
| NERV_CYAN #00FFFF | ✓ | Pattern Blue, data |
| NERV_ORANGE #FF6A00 | ✓ | MAGI Caspar, warnings |
| Deep blacks #000000/#0A0A0A | ✓ | Background, panels |

## TYPOGRAPHY

| Requirement | Status | Notes |
|------------|--------|-------|
| M+ 2m font for Japanese | ✓ | Loaded from Google Fonts |
| Monospace for English | ✓ | Courier New everywhere |
| Japanese labels | ✓ | 同期率, パターン青, 心理図 etc. |

## GEOMETRY

| Requirement | Status | Notes |
|------------|--------|-------|
| Flat-top hexagons | ✓ | Pointy sides, flat top/bottom |
| Chamfered corners 45° | ✓ | NO border-radius |
| 8px chamfer size | ✓ | Consistent across panels |

## CRT EFFECTS

| Requirement | Status | Notes |
|------------|--------|-------|
| Scanlines | ✓ | 4px pattern with 50% opacity |
| Phosphor glow | ✓ | SVG filter feGaussianBlur |
| Vignette | ✓ | Radial gradient overlay |
| Moving scan line | ✓ | Animated vertical bar (HTML) |
| Animate pulse | ✓ | Target lock, status dots |

## COMPONENTS

| Component | nrv/ React | skill_graph Python | Notes |
|-----------|:----------:|:------------------:|-------|
| Header with logo | ✓ | ✓ | NERV branding with corner cuts |
| Pattern indicator | ✓ | ✓ | BLUE/ORANGE/RED bar |
| Sync ratio display | ✓ | ✓ | Large percentage with segmented bar |
| Psychograph waves | ✓ | ✓ | 6-channel animated EEG |
| MAGI decision | ✓ | ✓ | 3 nodes voting with connections |
| Stat grids | ✓ | ✓ | Dense 2-col data cells |
| Hex skill cluster | ✓ | ✓ | 13-cell honeycomb layout |
| Tactical map | ✓ | ✓ | Perspective grid with terrain |
| Target lock | ✓ | ✓ | Rotating hex reticle |
| Status grid | ✓ | ✓ | Color-coded border strips |
| Data footer | ✓ | ✓ | Scrolling stream |
| Full dashboard | ✓ | ✓ | 1200x800 complete layout |

## DENSITY

| Requirement | Status | Notes |
|------------|--------|-------|
| Maximum data density | ✓ | 6+ stat grids on screen |
| No wasted space | ✓ | Tight padding, full viewport |
| Dual-language labels | ✓ | English + Japanese on all items |

## REMAINING GAPS

| Gap | Priority | Status |
|-----|:--------:|--------|
| Live data integration | Medium | Static demos only |
| Audio cues | Low | No sound effects |
| Wave animation smooth | Medium | CSS/SVG animations OK |
| Export to PNG | Low | SVG only for now |

## FILES

**React/TypeScript:**
- `~/git/nrv/src/components/NERVPanel.tsx` - Core components
- `~/git/nrv/src/components/NERVAdvanced.tsx` - Psychograph, TacticalMap, HexTarget
- `~/git/nrv/src/components/NERVDashboard.tsx` - Full dashboard layout
- `~/git/nrv/src/components/index.ts` - Exports

**HTML Demos:**
- `~/git/nrv/demo/nerv-demo.html` - Initial demo
- `~/git/nrv/demo/nerv_dense.html` - Maximum density demo

**Python:**
- `~/git/skill_graph/skill_graph/viz/nerv_components.py` - 36KB component library
- `~/git/skill_graph/skill_graph/viz/nerv_dashboard.py` - Dashboard generator

**Output:**
- `python3 nerv_components.py > output.svg` - Generate 47KB SVG

**Reference:**
- `~/git/nrv/ui_reference/` - 6 reference frames from NGE
- `~/git/nrv/DESIGN_SPEC.md` - Design specification

## RECURRING TRACKING

Cron jobs active:
- Sundays 18:00 - "EVA Components Progress Check"
- Every 8 hours - "NERV UI Development Push"

## CHANGELOG

### 2026-03-17
- ✓ Added Psychograph with 6-channel animated waves (sine, spike, anomalous)
- ✓ Added TacticalMap with perspective grid and terrain contours
- ✓ Added HexTarget with rotating hexagonal reticle and crosshair
- ✓ Added StatusGrid with color-coded border strips
- ✓ Added SyncRatioLarge with segmented progress bar
- ✓ Created NERVAdvanced.tsx for React advanced components
- ✓ Created NERVDashboard.tsx for full dashboard layout
- ✓ Updated nerv_components.py to 36KB with all components
- ✓ Created nerv_dashboard.py for programmatic generation
- ✓ Both React and Python now feature COMPLETE component parity

### 2026-03-16
- Initial fidelity checklist
- Color palette finalized
- CRT effects implemented
- Core components built

Last updated: 2026-03-17
