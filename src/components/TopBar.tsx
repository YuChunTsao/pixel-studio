import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor } from '../context/EditorContext'
import ExportDialog from './ExportDialog'
import ThemeToggle from './ThemeToggle'

export default function TopBar() {
  const navigate = useNavigate()
  const { canvasRef, imageRef, dispatch } = useEditor()
  const [showExport, setShowExport] = useState(false)

  function handleBack() {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  return (
    <>
      <div style={styles.bar}>
        <button style={styles.backBtn} onClick={handleBack} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={styles.titleWrap}>
          <div style={styles.logoMark} />
          <span style={styles.title}>PIXEL STUDIO</span>
        </div>

        <div style={styles.rightGroup}>
        <ThemeToggle />
        <button style={styles.saveBtn} onClick={() => setShowExport(true)} aria-label="Export image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Save
        </button>
        </div>
      </div>

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        canvasRef={canvasRef}
        imageRef={imageRef}
      />
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    height: 'var(--top-bar-h)',
    paddingTop: 'var(--safe-top)',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--safe-top) 16px 0',
    flexShrink: 0,
    position: 'relative',
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    borderRadius: 10,
    transition: 'color 0.15s, background 0.15s',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  logoMark: {
    width: 14,
    height: 14,
    background: 'var(--accent)',
    borderRadius: 3,
    transform: 'rotate(12deg)',
    boxShadow: '0 0 8px var(--accent-glow)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.15em',
    color: 'var(--text)',
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: 'var(--accent)',
    color: '#1a0e00',
    borderRadius: 10,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.02em',
    boxShadow: '0 0 12px var(--accent-glow)',
    transition: 'opacity 0.15s, box-shadow 0.15s',
  },
}
