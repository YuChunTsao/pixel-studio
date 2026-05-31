import { useEffect, useState } from 'react'
import { PencilBrush } from 'fabric'
import { useEditor } from '../../context/EditorContext'

const COLORS = ['#ffffff', '#e8a832', '#e8503a', '#52c93f', '#4a9eff', '#c084fc', '#ff6b9d', '#000000']

export default function DrawPanel() {
  const { canvasRef } = useEditor()
  const [brushSize, setBrushSize] = useState(6)
  const [brushColor, setBrushColor] = useState('#ffffff')
  const [eraser, setEraser] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = true

    const brush = new PencilBrush(canvas)
    brush.width = brushSize
    brush.color = eraser ? '#000000' : brushColor
    canvas.freeDrawingBrush = brush

    return () => {
      const c = canvasRef.current
      if (c) c.isDrawingMode = false
    }
  }, [])

  function applyBrush(size: number, color: string, isEraser: boolean) {
    const canvas = canvasRef.current
    if (!canvas || !canvas.freeDrawingBrush) return
    canvas.freeDrawingBrush.width = size
    canvas.freeDrawingBrush.color = isEraser ? '#000000' : color
  }

  function handleSize(v: number) {
    setBrushSize(v)
    applyBrush(v, brushColor, eraser)
  }

  function handleColor(c: string) {
    setBrushColor(c)
    setEraser(false)
    applyBrush(brushSize, c, false)
  }

  function handleEraser() {
    const next = !eraser
    setEraser(next)
    applyBrush(brushSize * (next ? 3 : 1), brushColor, next)
  }

  function handleClear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const objects = canvas.getObjects().filter((o) => o.type === 'path')
    objects.forEach((o) => canvas.remove(o))
    canvas.renderAll()
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        <div style={styles.sliderWrap}>
          <span style={styles.label}>Brush Size</span>
          <span style={styles.value}>{brushSize}px</span>
          <input
            type="range" min={2} max={48} step={1} value={brushSize}
            onChange={(e) => handleSize(parseInt(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--accent) ${((brushSize - 2) / 46) * 100}%, var(--elevated) ${((brushSize - 2) / 46) * 100}%)` }}
          />
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.actionBtn, ...(eraser ? styles.actionBtnActive : {}) }}
            onClick={handleEraser}
            title="Eraser"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 20H7L3 16l10-10 7 7z" /><line x1="6" y1="14" x2="14" y2="6" />
            </svg>
          </button>
          <button style={styles.actionBtn} onClick={handleClear} title="Clear all drawings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <div style={styles.colorRow}>
        {COLORS.map((c) => (
          <button
            key={c}
            style={{
              ...styles.swatch,
              background: c,
              outline: !eraser && brushColor === c ? '2px solid var(--accent)' : 'none',
              outlineOffset: 2,
            }}
            onClick={() => handleColor(c)}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', alignItems: 'flex-end', gap: 12 },
  sliderWrap: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  value: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', alignSelf: 'flex-end' },
  actions: { display: 'flex', gap: 6, paddingBottom: 2 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--elevated)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', transition: 'all 0.15s',
  },
  actionBtnActive: {
    background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)',
  },
  colorRow: { display: 'flex', gap: 8 },
  swatch: {
    width: 26, height: 26, borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer', transition: 'outline-offset 0.1s', flexShrink: 0,
  },
}
