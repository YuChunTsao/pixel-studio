import { useEditor } from '../context/EditorContext'
import ToolTabs from './ToolTabs'
import CropPanel from './tools/CropPanel'
import AdjustPanel from './tools/AdjustPanel'
import FilterPanel from './tools/FilterPanel'
import TextPanel from './tools/TextPanel'
import DrawPanel from './tools/DrawPanel'

export default function BottomDrawer() {
  const { state } = useEditor()

  const panels = {
    crop: <CropPanel />,
    adjust: <AdjustPanel />,
    filter: <FilterPanel />,
    text: <TextPanel />,
    draw: <DrawPanel />,
  }

  return (
    <div style={styles.drawer}>
      <div style={styles.handle} />
      <ToolTabs />
      <div style={styles.panel}>
        {panels[state.activeTool]}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  drawer: {
    flexShrink: 0,
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    paddingBottom: 'var(--safe-bottom)',
    display: 'flex',
    flexDirection: 'column',
  },
  handle: {
    width: 36,
    height: 4,
    background: 'var(--elevated)',
    borderRadius: 2,
    margin: '10px auto 6px',
  },
  panel: {
    padding: '16px 20px 12px',
    minHeight: 140,
  },
}
