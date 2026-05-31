# CLAUDE.md — Pixel Studio

Telegram Mini App for image editing. Pure frontend — React 19 + TypeScript + Fabric.js 7 + @telegram-apps/sdk 3. Hosted on GitHub Pages via gh-pages. No backend.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173/pixel-studio/
npm run build    # tsc -b && vite build → dist/
npm run deploy   # build + push to gh-pages branch (GitHub Actions also auto-deploys on push to main)
```

## File Map

```
src/main.tsx                   SDK init inside try/catch (fallback for running outside Telegram)
src/App.tsx                    EditorProvider wraps HashRouter; routes: / → UploadPage, /editor → EditorPage
src/context/EditorContext.tsx  useReducer(activeTool, adjustments, activeFilter, originalImageDataURL)
                               canvasRef: RefObject<Canvas|null>  ← Fabric canvas (NOT React state)
                               imageRef:  RefObject<FabricImage|null> ← base image (NOT React state)
src/pages/UploadPage.tsx       FileReader.readAsDataURL → navigate('/editor', { state: { dataURL } })
src/pages/EditorPage.tsx       Reads location.state.dataURL; redirects to / if missing
src/components/CanvasArea.tsx  new Canvas(...); FabricImage.fromURL(url) [async]; scale-to-fit; stores in imageRef
src/components/TopBar.tsx      showExport state; Save button → setShowExport(true); renders ExportDialog
src/components/ExportDialog.tsx  Props: { isOpen, onClose, canvasRef, imageRef }
                               Preset sizes + custom W×H + aspect lock + PNG/JPEG + quality slider
                               Download: reads imageRef bounding rect to crop canvas borders, draws to offscreen canvas at target W×H
src/components/BottomDrawer.tsx  bottom sheet; collapsed=80px, expanded=260px; renders active ToolPanel
src/components/ToolTabs.tsx    5 buttons → dispatch({ type:'SET_TOOL', tool })
src/components/tools/AdjustPanel.tsx   Brightness/Contrast/Saturation; filters non-adjust filters out, keeps preset filters
src/components/tools/FilterPanel.tsx   10 presets; filters out preset filters, keeps adjust filters
src/components/tools/TextPanel.tsx     new IText(...); new Shadow({blur,offsetX,offsetY,color}) — NOT a CSS string
src/components/tools/CropPanel.tsx     fabric.Rect overlay; confirm → offscreen HTMLCanvasElement → new FabricImage replaces imageRef
src/components/tools/DrawPanel.tsx     canvas.isDrawingMode=true on mount; eraser = white PencilBrush at width*3
```

## Critical API Gotchas

### Fabric.js v7

- `FabricImage.fromURL(url, options?)` is **fully async** — returns a Promise, no callback form
- Filters are in the `filters.*` namespace: `import { filters } from 'fabric'` → `new filters.Brightness({brightness})`
- Available filter classes: `Brightness`, `Contrast`, `Saturation`, `Grayscale`, `Sepia`, `Vintage`, `Kodachrome`, `Brownie`, `Polaroid`, `Technicolor`, `Invert`, `Blur`
- `Shadow` must be a constructed object: `new Shadow({ blur: 8, offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.6)' })` — passing a CSS string throws a type error
- `canvas.getActiveObject()` returns `FabricObject | null` — narrow with `instanceof IText` before calling text methods

### @telegram-apps/sdk v3

```ts
import { init, miniApp, viewport, themeParams } from '@telegram-apps/sdk'
init()
miniApp.mountSync()       // not miniApp.mount()
themeParams.mountSync()
miniApp.bindCssVars()     // injects --tg-* CSS vars
themeParams.bindCssVars()
miniApp.ready()
if (viewport.expand.isAvailable()) viewport.expand()
```

### TypeScript

- `tsconfig.app.json` sets `"verbatimModuleSyntax": true` — **all type-only imports must use `import type { ... }`**
- Runtime values (classes, functions) use regular `import { ... }`

### Routing & Build

- `HashRouter` is required — GitHub Pages serves a single `index.html`; `BrowserRouter` would 404 on hard refresh
- `vite.config.ts` `base: '/pixel-studio/'` must match the GitHub repo name exactly

## Filter Layering Rule

AdjustPanel and FilterPanel cooperate to avoid clobbering each other:

```ts
// AdjustPanel: keep preset filters, replace adjust filters
const others = (img.filters ?? []).filter(
  f => !(f instanceof filters.Brightness) && !(f instanceof filters.Contrast) && !(f instanceof filters.Saturation)
)
img.filters = [...adjustFilters, ...others]

// FilterPanel: keep adjust filters, replace preset filters
const adjustFilters = (img.filters ?? []).filter(
  f => f instanceof filters.Brightness || f instanceof filters.Contrast || f instanceof filters.Saturation
)
img.filters = [...adjustFilters, ...presetFilters]

img.applyFilters()
canvas.renderAll()
```

## Design Tokens (src/index.css)

```css
--bg: #0c0c0e          /* page background */
--surface: #131315     /* cards, bars */
--elevated: #1c1c1f    /* inputs, buttons */
--accent: #e8a832      /* amber/gold — primary CTA */
--accent-dim: rgba(232,168,50,0.12)
--accent-glow: rgba(232,168,50,0.25)
--text: #f0ebe4
--text-muted: #7a7570
--border: rgba(255,255,255,0.07)
--border-strong: rgba(255,255,255,0.14)
--font-display: 'Syne', sans-serif
--font-mono: 'Space Mono', monospace
--top-bar-h: 56px
--drawer-collapsed-h: 80px
--drawer-expanded-h: 260px
--safe-top: env(safe-area-inset-top, 0px)
--safe-bottom: env(safe-area-inset-bottom, 0px)
```
