# Architecture

## Component Tree

```
App (EditorProvider)
├── HashRouter
│   ├── / → UploadPage
│   │         └── drag-and-drop zone + hidden <input type="file">
│   └── /editor → EditorPage
│                 ├── TopBar          (fixed top, 56px + safe-area)
│                 │     └── ExportDialog  (bottom sheet overlay; shown when Save clicked)
│                 ├── CanvasArea      (flex-grow, fills remaining height)
│                 └── BottomDrawer    (fixed bottom, 80px collapsed / 260px expanded)
│                       ├── ToolTabs (Crop | Adjust | Filter | Text | Draw)
│                       └── ToolPanel (switches on activeTool)
│                             ├── CropPanel
│                             ├── AdjustPanel
│                             ├── FilterPanel
│                             ├── TextPanel
│                             └── DrawPanel
```

## State Management

**useReducer** (in EditorContext) holds serialisable UI state:

| Field | Type | Purpose |
|---|---|---|
| `activeTool` | `'crop'\|'adjust'\|'filter'\|'text'\|'draw'` | Which tool panel is shown |
| `adjustments` | `{brightness, contrast, saturation}` | Slider values for AdjustPanel |
| `activeFilter` | `string \| null` | Name of the active preset |
| `originalImageDataURL` | `string \| null` | Set once on image load |

**useRef** (also in EditorContext) holds mutable, non-serialisable objects:

| Ref | Type | Why not state |
|---|---|---|
| `canvasRef` | `Canvas \| null` | Fabric Canvas mutates itself; React re-renders would destroy it |
| `imageRef` | `FabricImage \| null` | Direct object reference needed for filter mutations |

Putting the Fabric canvas in React state would cause it to be torn down and recreated on every render. Refs are the correct pattern for imperative third-party APIs.

## Filter Cooperation Pattern

AdjustPanel and FilterPanel each apply a different category of filter. They must not clobber each other's work.

The pattern is: **read → partition → rebuild → apply**

```
img.filters = [adjustFilters..., presetFilters...]
```

- **AdjustPanel** filters out Brightness/Contrast/Saturation, appends new ones, keeps the rest (presets)
- **FilterPanel** filters out everything that is NOT Brightness/Contrast/Saturation, appends presets, keeps the adjust group

Both end with `img.applyFilters(); canvas.renderAll()`.

## Routing

`HashRouter` is used instead of `BrowserRouter` because GitHub Pages serves a single static `index.html`. With `BrowserRouter`, navigating to `/editor` and refreshing would return a 404 from the server. Hash routing (`/#/editor`) keeps all routing client-side and works on any static host.

Image data is passed between routes via `navigate('/editor', { state: { dataURL } })`. The state lives in the browser's history entry — it survives a React re-render but is lost on a hard refresh, which is intentional (user must re-upload).

## Canvas Sizing

CanvasArea renders a `<div>` that fills all available space between TopBar and BottomDrawer (flexbox column, `flex: 1`). On mount, `offsetWidth`/`offsetHeight` of that div are read and passed to `new Canvas(el, { width, height })`.

The image is then scaled uniformly to fit:
```ts
const scale = Math.min(width / img.width!, height / img.height!)
img.set({ scaleX: scale, scaleY: scale, left: width/2, top: height/2, originX: 'center', originY: 'center' })
```

A `ResizeObserver` (or window resize listener) would be needed to handle orientation changes — not currently implemented; reopening the editor after rotation requires returning to UploadPage.

## Export Flow

Clicking **Save** in TopBar sets `showExport = true`, which renders `<ExportDialog>` as a bottom sheet overlay.

On open, `ExportDialog` initialises `width`/`height` from the actual image pixel dimensions (`imageRef.current.width/height`), not the Fabric canvas display size (which includes letterboxed borders).

**Download steps:**
1. Temporarily clear `canvas.backgroundColor`, call `canvas.toDataURL({ format: 'png', multiplier: 1 })` to get a full-resolution lossless PNG of the canvas content.
2. Read `imageRef.current.getBoundingRect()` to get the pixel bounds of the image within the canvas.
3. Crop to that bounding rect using an intermediate `HTMLCanvasElement` — this removes the black letterboxed borders.
4. Draw the cropped image onto a second offscreen canvas sized to the user-specified `width × height` — this handles both proportional and stretched exports.
5. Call `offscreen.toDataURL(mime, quality)` and trigger `<a download>.click()`.

**Aspect ratio lock:** When locked, editing W auto-computes H (and vice versa) using the ratio captured when the dialog opened. Presets always override both W and H regardless of lock state.
