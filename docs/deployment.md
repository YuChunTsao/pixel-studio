# Deployment Guide

## Prerequisites

- Node.js 20+
- A GitHub account
- A Telegram bot (created via BotFather)

## Step 1 — Create a GitHub Repository

1. Go to GitHub → New repository
2. Name it (e.g. `pixel-studio`) — this becomes part of your URL
3. Keep it public (GitHub Pages requires public repos on free plans)

## Step 2 — Update the Base Path

In `vite.config.ts`, change `base` to match your repo name exactly:

```ts
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',  // ← must match GitHub repo name
})
```

## Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

## Step 4 — Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Branch: `gh-pages` / folder: `/ (root)`
4. Click **Save**

The first deploy is triggered automatically by the GitHub Actions workflow (`.github/workflows/deploy.yml`) when you push to `main`. Subsequent pushes also trigger it automatically.

To deploy manually without pushing:
```bash
npm run deploy
```

Your app will be live at: `https://<username>.github.io/<repo-name>/`

## Step 5 — Register with BotFather

1. Open Telegram → search for **@BotFather**
2. Send `/mybots` → select your bot
3. Go to **Bot Settings → Menu Button → Edit menu button URL**
4. Paste your GitHub Pages URL: `https://<username>.github.io/<repo-name>/`
5. Set button text (e.g. "Open Editor")

Alternatively, use `/newapp` to register as a full Mini App with an icon and description.

## Step 6 — Test in Telegram

1. Open Telegram on mobile
2. Go to your bot's chat
3. Tap the **Menu** button (bottom-left of the text input)
4. The app should open full-screen with your Telegram theme colors applied

**What to verify:**
- App expands to fill the entire screen (viewport.expand() working)
- Telegram theme colors match the UI (bindCssVars() working)
- Upload a photo → edit → Save downloads the file to your device
- All 5 tools (Crop, Adjust, Filter, Text, Draw) function correctly

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| White screen / 404 after deploy | `base` in vite.config.ts doesn't match repo name | Update `base` and redeploy |
| GitHub Actions fails | Missing gh-pages branch or permissions | Check Actions tab for error; ensure workflow has `contents: write` permission |
| App doesn't expand in Telegram | SDK init failed silently | Check browser console in Telegram's DevTools (shake device or long-press settings) |
| Filters not applying | Wrong Fabric v7 import | Confirm `import { filters } from 'fabric'` (not `fabric.Image.filters`) |
