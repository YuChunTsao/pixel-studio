import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import type { Canvas, FabricImage } from 'fabric'

type Format = 'png' | 'jpeg'

const PRESETS = [
  { label: 'Original', w: 0, h: 0 },
  { label: '512 × 512', w: 512, h: 512 },
  { label: '1024 × 1024', w: 1024, h: 1024 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  canvasRef: RefObject<Canvas | null>
  imageRef: RefObject<FabricImage | null>
}

export default function ExportDialog({ isOpen, onClose, canvasRef, imageRef }: Props) {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [canvasW, setCanvasW] = useState(0)
  const [canvasH, setCanvasH] = useState(0)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [format, setFormat] = useState<Format>('png')
  const [quality, setQuality] = useState(90)
  const [locked, setLocked] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const img = imageRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const w = img ? Math.round(img.width ?? 0) : Math.round(canvas.width ?? 0)
    const h = img ? Math.round(img.height ?? 0) : Math.round(canvas.height ?? 0)
    setWidth(w)
    setHeight(h)
    setCanvasW(w)
    setCanvasH(h)
    setAspectRatio(h > 0 ? w / h : 1)
    setLocked(true)
  }, [isOpen, canvasRef, imageRef])

  function handleWidthChange(val: number) {
    setWidth(val)
    if (locked && val > 0 && aspectRatio > 0) setHeight(Math.round(val / aspectRatio))
  }

  function handleHeightChange(val: number) {
    setHeight(val)
    if (locked && val > 0 && aspectRatio > 0) setWidth(Math.round(val * aspectRatio))
  }

  function handlePreset(w: number, h: number) {
    setWidth(w === 0 ? canvasW : w)
    setHeight(h === 0 ? canvasH : h)
  }

  function toggleLock() {
    const next = !locked
    setLocked(next)
    if (next && width > 0 && aspectRatio > 0) {
      setHeight(Math.round(width / aspectRatio))
    }
  }

  async function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas || width <= 0 || height <= 0 || isDownloading) return

    setIsDownloading(true)
    try {
      const fabricImg = imageRef.current
      const bounds = fabricImg ? fabricImg.getBoundingRect() : null

      const savedBg = canvas.backgroundColor
      canvas.backgroundColor = ''
      canvas.renderAll()
      const fullDataURL = canvas.toDataURL({ format: 'png', multiplier: 1 })
      canvas.backgroundColor = savedBg
      canvas.renderAll()
      const fullImg = new Image()
      await new Promise<void>((resolve, reject) => {
        fullImg.onload = () => resolve()
        fullImg.onerror = () => reject(new Error('Export failed: could not decode canvas'))
        fullImg.src = fullDataURL
      })

      // Crop to image region, removing black canvas borders
      const cl = bounds ? Math.round(bounds.left)   : 0
      const ct = bounds ? Math.round(bounds.top)    : 0
      const cw = bounds ? Math.round(bounds.width)  : canvas.width!
      const ch = bounds ? Math.round(bounds.height) : canvas.height!
      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = cw
      cropCanvas.height = ch
      cropCanvas.getContext('2d')!.drawImage(fullImg, cl, ct, cw, ch, 0, 0, cw, ch)

      const offscreen = document.createElement('canvas')
      offscreen.width = width
      offscreen.height = height
      const ctx = offscreen.getContext('2d')
      if (!ctx) throw new Error('Could not get 2D context')
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }
      ctx.drawImage(cropCanvas, 0, 0, width, height)

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png'
      const q = format === 'jpeg' ? quality / 100 : undefined
      const outputURL = offscreen.toDataURL(mime, q)

      const a = document.createElement('a')
      a.href = outputURL
      a.download = `pixel-studio-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`
      a.click()
      onClose()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  function isPresetActive(p: { w: number; h: number }) {
    const pw = p.w === 0 ? canvasW : p.w
    const ph = p.h === 0 ? canvasH : p.h
    return width === pw && height === ph
  }

  if (!isOpen) return null

  const downloadDisabled = !width || !height || isDownloading

  return (
    <>
      <div style={styles.backdrop} onClick={isDownloading ? undefined : onClose} />
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <div style={styles.title}>EXPORT IMAGE</div>

        <div style={styles.sectionLabel}>PRESET SIZES</div>
        <div style={styles.presetRow}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              style={{ ...styles.presetBtn, ...(isPresetActive(p) ? styles.presetBtnActive : {}) }}
              onClick={() => handlePreset(p.w, p.h)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={styles.sectionLabel}>CUSTOM SIZE</div>
        <div style={styles.sizeRow}>
          <div style={styles.inputWrap}>
            <div style={styles.inputLabel}>WIDTH (px)</div>
            <input
              style={{ ...styles.input, ...(locked ? styles.inputLocked : {}) }}
              type="number"
              min={1}
              value={width || ''}
              onChange={e => handleWidthChange(Number(e.target.value))}
            />
          </div>
          <button
            style={{ ...styles.lockBtn, ...(locked ? styles.lockBtnActive : {}) }}
            onClick={toggleLock}
            aria-label={locked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {locked ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </svg>
            )}
          </button>
          <div style={styles.inputWrap}>
            <div style={styles.inputLabel}>HEIGHT (px)</div>
            <input
              style={{ ...styles.input, ...(locked ? styles.inputLocked : {}) }}
              type="number"
              min={1}
              value={height || ''}
              onChange={e => handleHeightChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={styles.sectionLabel}>FORMAT</div>
        <div style={styles.formatRow}>
          <button
            style={{ ...styles.fmtBtn, ...(format === 'png' ? styles.fmtBtnActive : {}) }}
            onClick={() => setFormat('png')}
          >
            PNG
          </button>
          <button
            style={{ ...styles.fmtBtn, ...(format === 'jpeg' ? styles.fmtBtnActive : {}) }}
            onClick={() => setFormat('jpeg')}
          >
            JPEG
          </button>
        </div>

        {format === 'jpeg' && (
          <div style={styles.qualityWrap}>
            <span style={styles.qualityLabel}>Quality</span>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.qualityValue}>{quality}%</span>
          </div>
        )}

        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Current size</span>
            <span style={styles.infoValue}>{canvasW} × {canvasH} px</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Output size</span>
            <span style={styles.infoValueAccent}>{width || '—'} × {height || '—'} px</span>
          </div>
        </div>

        <button
          style={{ ...styles.downloadBtn, ...(downloadDisabled ? styles.downloadBtnDisabled : {}) }}
          onClick={handleDownload}
          disabled={downloadDisabled}
        >
          ↓ Download {format.toUpperCase()}
        </button>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  sheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    padding: '12px 20px',
    paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    maxHeight: '92vh',
    overflowY: 'auto',
  },
  handle: {
    width: 40,
    height: 4,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    margin: '0 auto',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.12em',
    color: 'var(--text)',
  },
  sectionLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: -6,
  },
  presetRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetBtn: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--elevated)',
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    transition: 'all 0.15s',
  },
  presetBtnActive: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  sizeRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  inputLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 9,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
  input: {
    background: 'var(--elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 0',
    fontSize: 14,
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
    width: '100%',
  },
  inputLocked: {
    borderColor: 'rgba(232,168,50,0.4)',
  },
  lockBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--text-muted)',
    transition: 'all 0.15s',
  },
  lockBtnActive: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  formatRow: {
    display: 'flex',
    gap: 8,
  },
  fmtBtn: {
    flex: 1,
    padding: '9px 0',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--elevated)',
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-muted)',
    transition: 'all 0.15s',
  },
  fmtBtnActive: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  qualityWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  qualityLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
  },
  slider: {
    flex: 1,
    accentColor: 'var(--accent)',
  },
  qualityValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--accent)',
    minWidth: 32,
    textAlign: 'right' as const,
  },
  infoBox: {
    background: 'var(--surface)',   // was '#131315'
    borderRadius: 8,
    padding: '10px 14px',
    border: '1px solid var(--border)',  // was rgba(255,255,255,0.05)
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  infoValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text)',
  },
  infoValueAccent: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--accent)',
  },
  downloadBtn: {
    width: '100%',
    padding: '13px 0',
    borderRadius: 12,
    background: 'var(--accent)',
    color: '#1a0e00',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: '0.03em',
    boxShadow: '0 0 16px var(--accent-glow)',
    transition: 'opacity 0.15s',
  },
  downloadBtnDisabled: {
    opacity: 0.4,
    boxShadow: 'none',
    cursor: 'not-allowed' as const,
  },
}
