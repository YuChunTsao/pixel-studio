# Pixel Studio

A Telegram Mini App for editing images — crop, adjust, filter, add text, and draw — then download the result to share in Telegram. Purely frontend, no backend required.

## Features

- **Crop** — Free, 1:1, 4:3, and 16:9 aspect ratios with a draggable overlay
- **Adjust** — Brightness, contrast, and saturation sliders with live preview
- **Filters** — 10 presets: Original, B&W, Sepia, Vintage, Kodak, Brownie, Polaroid, Technicolor, Invert, Blur
- **Text** — Add IText overlays; set font size, color (8 swatches), bold, italic; drag to reposition
- **Draw** — Freehand pencil brush; choose size and color; eraser; clear all strokes

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool |
| Fabric.js | 7 | Canvas manipulation, filters, IText, drawing |
| @telegram-apps/sdk | 3 | Theme CSS vars, viewport expand, miniApp.ready() |
| react-router-dom | 7 | HashRouter for GitHub Pages compatibility |
| gh-pages | — | Deploy to GitHub Pages |

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:5173/pixel-studio/
```

Other commands:

```bash
npm run build    # type check + Vite bundle → dist/
npm run lint     # ESLint
npm run preview  # serve dist/ locally
npm run deploy   # build + push to gh-pages branch
```

## Deployment to GitHub Pages

1. Create a GitHub repo (e.g. `pixel-studio`)
2. Update `base` in `vite.config.ts` to match your repo name:
   ```ts
   base: '/your-repo-name/',
   ```
3. Push to `main` — GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys automatically
4. Enable Pages in repo **Settings → Pages → Source: gh-pages branch**
5. Your app is live at `https://<username>.github.io/<repo-name>/`

## Telegram Registration

1. Open BotFather → `/mybots` → select your bot
2. **Bot Settings → Menu Button → Edit menu button URL**
3. Paste your GitHub Pages URL
4. Open Telegram on mobile → tap the Menu button → app loads full-screen

## Project Structure

```
src/
├── main.tsx                        SDK init (try/catch for outside-Telegram), renders App
├── App.tsx                         EditorProvider + HashRouter + two routes
├── index.css                       Design tokens (CSS vars), range input styles
├── context/
│   └── EditorContext.tsx           useReducer state; canvasRef/imageRef as plain refs
├── pages/
│   ├── UploadPage.tsx              Drag-and-drop + file picker → navigate to /editor
│   └── EditorPage.tsx              Layout wrapper; redirects to / if no image in state
└── components/
    ├── TopBar.tsx                  App header; Save button opens ExportDialog
    ├── ExportDialog.tsx            Export size / format dialog; offscreen canvas download
    ├── CanvasArea.tsx              Fabric Canvas init; image fitted to container
    ├── BottomDrawer.tsx            Collapsed (80px) / expanded (260px) bottom sheet
    ├── ToolTabs.tsx                5 icon tabs dispatching SET_TOOL
    └── tools/
        ├── CropPanel.tsx           Rect overlay → offscreen canvas → new FabricImage
        ├── AdjustPanel.tsx         Brightness/Contrast/Saturation; preserves preset filters
        ├── FilterPanel.tsx         10 presets; preserves adjust filters
        ├── TextPanel.tsx           IText add/update with Shadow object
        └── DrawPanel.tsx           PencilBrush; eraser = white brush at 3× size
```

See [docs/architecture.md](docs/architecture.md) for the full component tree and state design.  
See [docs/deployment.md](docs/deployment.md) for the step-by-step deployment guide.

## License

MIT
