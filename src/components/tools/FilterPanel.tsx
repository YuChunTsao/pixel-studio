import { useEditor } from '../../context/EditorContext'
import { filters } from 'fabric'

const PRESETS: { id: string; label: string; build: () => InstanceType<typeof filters.BaseFilter>[] }[] = [
  { id: 'none', label: 'Original', build: () => [] },
  { id: 'grayscale', label: 'B&W', build: () => [new filters.Grayscale()] },
  { id: 'sepia', label: 'Sepia', build: () => [new filters.Sepia()] },
  { id: 'vintage', label: 'Vintage', build: () => [new filters.Vintage()] },
  { id: 'kodachrome', label: 'Kodak', build: () => [new filters.Kodachrome()] },
  { id: 'brownie', label: 'Brownie', build: () => [new filters.Brownie()] },
  { id: 'polaroid', label: 'Polaroid', build: () => [new filters.Polaroid()] },
  { id: 'technicolor', label: 'Techni', build: () => [new filters.Technicolor()] },
  { id: 'invert', label: 'Invert', build: () => [new filters.Invert()] },
  { id: 'blur', label: 'Blur', build: () => [new filters.Blur({ blur: 0.1 })] },
]

export default function FilterPanel() {
  const { state, dispatch, imageRef, canvasRef } = useEditor()

  function applyFilter(preset: typeof PRESETS[number]) {
    dispatch({ type: 'SET_FILTER', filter: preset.id === 'none' ? null : preset.id })
    const img = imageRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    // Keep adjustment filters, replace preset filters
    const adjustFilters = (img.filters || []).filter(
      (f) => f instanceof filters.Brightness ||
             f instanceof filters.Contrast ||
             f instanceof filters.Saturation
    )
    img.filters = [...adjustFilters, ...preset.build()]
    img.applyFilters()
    canvas.renderAll()
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.grid}>
        {PRESETS.map((preset) => {
          const active = (state.activeFilter ?? 'none') === preset.id
          return (
            <button
              key={preset.id}
              style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
              onClick={() => applyFilter(preset)}
            >
              <div style={{ ...styles.dot, ...(active ? styles.dotActive : {}) }} />
              <span style={{ ...styles.chipLabel, ...(active ? styles.chipLabelActive : {}) }}>
                {preset.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', borderRadius: 20,
    background: 'var(--elevated)',
    border: '1px solid var(--border)',
    transition: 'border-color 0.15s, background 0.15s',
  },
  chipActive: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent)',
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'var(--text-dim)',
    transition: 'background 0.15s, box-shadow 0.15s',
  },
  dotActive: {
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent-glow)',
  },
  chipLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 12, fontWeight: 600,
    color: 'var(--text-muted)',
    transition: 'color 0.15s',
  },
  chipLabelActive: { color: 'var(--accent)' },
}
