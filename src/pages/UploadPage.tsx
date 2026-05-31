import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataURL = e.target?.result as string
      navigate('/editor', { state: { dataURL } })
    }
    reader.readAsDataURL(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  return (
    <div style={styles.page}>
      <div style={styles.grain} />

      <div style={styles.header}>
        <div style={styles.logoGroup}>
          <div style={styles.logoMark} />
          <span style={styles.logoText}>PIXEL STUDIO</span>
        </div>
        <ThemeToggle />
      </div>

      <div style={styles.center}>
        <p style={styles.tagline}>Edit. Refine. Share.</p>

        <button
          style={{ ...styles.dropZone, ...(dragging ? styles.dropZoneDragging : {}) }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-label="Upload image"
        >
          <div style={styles.uploadIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span style={styles.dropLabel}>
            {dragging ? 'Drop it here' : 'Tap to upload'}
          </span>
          <span style={styles.dropSub}>or drag & drop a photo</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
      </div>

      <p style={styles.footer}>supports JPG, PNG, WEBP, HEIC</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 'calc(var(--safe-top) + 16px)',
    paddingBottom: 'calc(var(--safe-bottom) + 24px)',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'repeat',
    backgroundSize: '128px 128px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 16px 0',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 20,
    height: 20,
    background: 'var(--accent)',
    borderRadius: 5,
    transform: 'rotate(12deg)',
    boxShadow: '0 0 12px var(--accent-glow)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.18em',
    color: 'var(--text)',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: '0 32px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  },
  tagline: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  },
  dropZone: {
    width: '100%',
    maxWidth: 320,
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    border: '1.5px dashed var(--border-strong)',
    borderRadius: 20,
    background: 'var(--surface)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
    padding: 32,
  },
  dropZoneDragging: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-dim)',
    boxShadow: '0 0 0 4px var(--accent-glow), inset 0 0 40px var(--accent-dim)',
  },
  uploadIcon: {
    color: 'var(--accent)',
    opacity: 0.9,
  },
  dropLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 16,
    color: 'var(--text)',
  },
  dropSub: {
    fontFamily: 'var(--font-display)',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  footer: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-dim)',
    letterSpacing: '0.05em',
    position: 'relative',
    zIndex: 1,
  },
}
