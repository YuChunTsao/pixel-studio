import { useEditor } from '../context/EditorContext'
import type { Tool } from '../context/EditorContext'

const TABS: { id: Tool; label: string; icon: React.ReactNode }[] = [
  {
    id: 'crop',
    label: 'Crop',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 2 6 8 2 8" /><polyline points="18 22 18 16 22 16" />
        <line x1="6" y1="8" x2="22" y2="8" /><line x1="2" y1="16" x2="18" y2="16" />
      </svg>
    ),
  },
  {
    id: 'adjust',
    label: 'Adjust',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="8" cy="6" r="2" fill="currentColor" /><circle cx="16" cy="12" r="2" fill="currentColor" /><circle cx="10" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'filter',
    label: 'Filter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: 'text',
    label: 'Text',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    id: 'draw',
    label: 'Draw',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
]

export default function ToolTabs() {
  const { state, dispatch } = useEditor()

  return (
    <div style={styles.tabs}>
      {TABS.map((tab) => {
        const active = state.activeTool === tab.id
        return (
          <button
            key={tab.id}
            style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: tab.id })}
            aria-label={tab.label}
          >
            <span style={{ ...styles.icon, ...(active ? styles.iconActive : {}) }}>
              {tab.icon}
            </span>
            <span style={{ ...styles.label, ...(active ? styles.labelActive : {}) }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  tabs: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0 4px',
    borderBottom: '1px solid var(--border)',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    borderRadius: 10,
    transition: 'background 0.15s',
    minWidth: 52,
  },
  tabActive: {
    background: 'var(--accent-dim)',
  },
  icon: {
    color: 'var(--text-muted)',
    transition: 'color 0.15s, filter 0.15s',
  },
  iconActive: {
    color: 'var(--accent)',
    filter: 'drop-shadow(0 0 4px var(--accent-glow))',
  },
  label: {
    fontFamily: 'var(--font-display)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    transition: 'color 0.15s',
  },
  labelActive: {
    color: 'var(--accent)',
  },
}
