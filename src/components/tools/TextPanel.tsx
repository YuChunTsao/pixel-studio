import { useState } from 'react'
import { IText, Shadow } from 'fabric'
import { useEditor } from '../../context/EditorContext'

const COLORS = ['#ffffff', '#f0ebe4', '#e8a832', '#e8503a', '#52c93f', '#4a9eff', '#c084fc', '#000000']

export default function TextPanel() {
  const { canvasRef } = useEditor()
  const [fontSize, setFontSize] = useState(32)
  const [color, setColor] = useState('#ffffff')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)

  function addText() {
    const canvas = canvasRef.current
    if (!canvas) return

    const text = new IText('Double-tap to edit', {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontSize,
      fill: color,
      fontFamily: 'Syne, sans-serif',
      fontWeight: bold ? '700' : '400',
      fontStyle: italic ? 'italic' : 'normal',
      selectable: true,
      evented: true,
      shadow: new Shadow({ blur: 8, offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.6)' }),
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  function updateSelected(props: Partial<{ fontSize: number; fill: string; fontWeight: string; fontStyle: string }>) {
    const canvas = canvasRef.current
    const obj = canvas?.getActiveObject()
    if (!obj || !(obj instanceof IText)) return
    obj.set(props as Parameters<typeof obj.set>[0])
    canvas!.renderAll()
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        <div style={styles.sliderWrap}>
          <span style={styles.label}>Size</span>
          <span style={styles.value}>{fontSize}px</span>
          <input
            type="range" min={12} max={120} step={2} value={fontSize}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              setFontSize(v)
              updateSelected({ fontSize: v })
            }}
            style={{ background: `linear-gradient(to right, var(--accent) ${((fontSize - 12) / 108) * 100}%, var(--elevated) ${((fontSize - 12) / 108) * 100}%)` }}
          />
        </div>

        <div style={styles.toggles}>
          <button
            style={{ ...styles.toggle, ...(bold ? styles.toggleActive : {}) }}
            onClick={() => { const v = !bold; setBold(v); updateSelected({ fontWeight: v ? '700' : '400' }) }}
          >B</button>
          <button
            style={{ ...styles.toggle, ...(italic ? styles.toggleActive : {}), fontStyle: 'italic' }}
            onClick={() => { const v = !italic; setItalic(v); updateSelected({ fontStyle: v ? 'italic' : 'normal' }) }}
          >I</button>
        </div>
      </div>

      <div style={styles.colorRow}>
        {COLORS.map((c) => (
          <button
            key={c}
            style={{
              ...styles.swatch,
              background: c,
              outline: color === c ? '2px solid var(--accent)' : 'none',
              outlineOffset: 2,
            }}
            onClick={() => { setColor(c); updateSelected({ fill: c }) }}
            aria-label={c}
          />
        ))}
      </div>

      <button style={styles.addBtn} onClick={addText}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Text
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', alignItems: 'flex-end', gap: 12 },
  sliderWrap: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  value: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', alignSelf: 'flex-end' },
  toggles: { display: 'flex', gap: 6, paddingBottom: 2 },
  toggle: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--elevated)', border: '1px solid var(--border)',
    fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700,
    color: 'var(--text-muted)', transition: 'all 0.15s',
  },
  toggleActive: {
    background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)',
  },
  colorRow: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  swatch: {
    width: 26, height: 26, borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer', transition: 'outline-offset 0.1s',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '10px 0', borderRadius: 12,
    background: 'var(--accent)', color: '#1a0e00',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
    boxShadow: '0 0 14px var(--accent-glow)',
    width: '100%',
  },
}
