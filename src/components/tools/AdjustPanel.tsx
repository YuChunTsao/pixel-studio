import { useEditor } from '../../context/EditorContext'
import type { Adjustments } from '../../context/EditorContext'
import { filters } from 'fabric'

const SLIDERS: { key: keyof Adjustments; label: string; min: number; max: number; step: number }[] = [
  { key: 'brightness', label: 'Brightness', min: -1, max: 1, step: 0.01 },
  { key: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.01 },
  { key: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.01 },
]

export default function AdjustPanel() {
  const { state, dispatch, imageRef, canvasRef } = useEditor()

  function handleChange(key: keyof Adjustments, value: number) {
    const next = { ...state.adjustments, [key]: value }
    dispatch({ type: 'SET_ADJUSTMENTS', adjustments: next })

    const img = imageRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const adjustFilters = [
      new filters.Brightness({ brightness: next.brightness }),
      new filters.Contrast({ contrast: next.contrast }),
      new filters.Saturation({ saturation: next.saturation }),
    ]

    // Preserve non-adjust filters (e.g. preset filters already applied)
    const others = (img.filters || []).filter(
      (f) => !(f instanceof filters.Brightness) &&
             !(f instanceof filters.Contrast) &&
             !(f instanceof filters.Saturation)
    )
    img.filters = [...adjustFilters, ...others]
    img.applyFilters()
    canvas.renderAll()
  }

  function handleReset() {
    dispatch({ type: 'SET_ADJUSTMENTS', adjustments: { brightness: 0, contrast: 0, saturation: 0 } })
    const img = imageRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    img.filters = (img.filters || []).filter(
      (f) => !(f instanceof filters.Brightness) &&
             !(f instanceof filters.Contrast) &&
             !(f instanceof filters.Saturation)
    )
    img.applyFilters()
    canvas.renderAll()
  }

  return (
    <div style={styles.wrap}>
      {SLIDERS.map(({ key, label, min, max, step }) => {
        const val = state.adjustments[key]
        const pct = Math.round(((val - min) / (max - min)) * 100)
        return (
          <div key={key} style={styles.row}>
            <div style={styles.labelRow}>
              <span style={styles.label}>{label}</span>
              <span style={styles.value}>{val > 0 ? '+' : ''}{Math.round(val * 100)}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--accent) ${pct}%, var(--elevated) ${pct}%)`,
              }}
            />
          </div>
        )
      })}
      <button style={styles.reset} onClick={handleReset}>Reset</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', flexDirection: 'column', gap: 8 },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  value: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', minWidth: 28, textAlign: 'right' },
  reset: { alignSelf: 'flex-end', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', padding: '4px 10px', borderRadius: 6, background: 'var(--elevated)', marginTop: 2 },
}
