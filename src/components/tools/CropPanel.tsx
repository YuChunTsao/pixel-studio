import { useState, useEffect, useRef } from 'react'
import { Rect, Circle, FabricImage } from 'fabric'
import { useEditor } from '../../context/EditorContext'

type RatioValue = number | null | 'circle'

const RATIOS: { label: string; value: RatioValue }[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: 'Cirlce', value: 'circle' },
]

export default function CropPanel() {
  const { canvasRef, imageRef, dispatch } = useEditor()
  const [ratio, setRatio] = useState<RatioValue>(null)
  const [cropRect, setCropRect] = useState<Rect | null>(null)
  const [active, setActive] = useState(false)

  // Ref mirrors cropRect state so canvas operations always use the latest value
  // even when called from stale closures (e.g. mount useEffect in React StrictMode).
  const cropRectRef = useRef<Rect | null>(null)

  function setCrop(r: Rect | null) {
    cropRectRef.current = r
    setCropRect(r)
  }

  useEffect(() => {
    startCrop(null)
    return () => {
      const canvas = canvasRef.current
      if (canvas && cropRectRef.current) {
        canvas.remove(cropRectRef.current)
        canvas.renderAll()
      }
      cropRectRef.current = null
    }
  }, [])

  function startCrop(r: RatioValue) {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    setRatio(r)
    setActive(true)

    // Always read from ref — safe against stale closures
    if (cropRectRef.current) canvas.remove(cropRectRef.current)

    // Fabric.js v7 defaults originX/Y to 'center', so left/top = center point.
    // img.left/top are already the image center (set with originX/Y:'center').
    const iw = img.width!  * (img.scaleX ?? 1)
    const ih = img.height! * (img.scaleY ?? 1)

    if (r === 'circle') {
      const radius = Math.min(iw, ih) * 0.4
      const circle = new Circle({
        left: img.left!,
        top: img.top!,
        radius,
        fill: 'rgba(255,255,255,0.08)',
        stroke: '#ffffff',
        strokeWidth: 2,
        hasRotatingPoint: false,
        lockRotation: true,
        lockUniScaling: true,
        selectable: true,
        evented: true,
        cornerColor: '#ffffff',
        cornerSize: 12,
        transparentCorners: false,
      })
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
      setCrop(circle as unknown as Rect)
      return
    }

    let rw = iw * 0.8
    let rh = ih * 0.8
    if (r !== null) {
      if (rw / r > ih * 0.8) rw = rh * r
      else rh = rw / r
    }

    const rect = new Rect({
      left: img.left!,
      top: img.top!,
      width: rw,
      height: rh,
      fill: 'rgba(255,255,255,0.08)',
      stroke: '#ffffff',
      strokeWidth: 2,
      hasRotatingPoint: false,
      lockRotation: true,
      selectable: true,
      evented: true,
      cornerColor: '#ffffff',
      cornerSize: 12,
      transparentCorners: false,
    })

    if (r !== null) {
      rect.set({ lockUniScaling: true })
    }

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    setCrop(rect)
  }

  async function confirmCrop() {
    const canvas = canvasRef.current
    const img = imageRef.current
    const overlay = cropRectRef.current
    if (!canvas || !img || !overlay) return

    const rect = overlay.getBoundingRect()

    // Image bounds from direct properties (originX/Y: 'center' invariant)
    const imgW = img.width!  * (img.scaleX ?? 1)
    const imgH = img.height! * (img.scaleY ?? 1)
    const imgL = img.left!   - imgW / 2
    const imgT = img.top!    - imgH / 2

    // Clamp crop to image boundaries (canvas coords)
    const overlapL = Math.max(rect.left,               imgL)
    const overlapT = Math.max(rect.top,                imgT)
    const overlapR = Math.min(rect.left + rect.width,  imgL + imgW)
    const overlapB = Math.min(rect.top  + rect.height, imgT + imgH)

    // Convert to source-image pixel coords
    const srcX = (overlapL - imgL) / (img.scaleX ?? 1)
    const srcY = (overlapT - imgT) / (img.scaleY ?? 1)
    const srcW = (overlapR - overlapL) / (img.scaleX ?? 1)
    const srcH = (overlapB - overlapT) / (img.scaleY ?? 1)

    // Offscreen canvas = visual crop size in canvas/CSS pixels
    const outW = Math.round(overlapR - overlapL)
    const outH = Math.round(overlapB - overlapT)

    // Draw cropped region onto a native canvas
    const offscreen = document.createElement('canvas')
    const outSize = ratio === 'circle' ? Math.round(Math.min(outW, outH)) : outW
    offscreen.width  = ratio === 'circle' ? outSize : outW
    offscreen.height = ratio === 'circle' ? outSize : outH
    const ctx = offscreen.getContext('2d')!

    if (ratio === 'circle') {
      ctx.beginPath()
      ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2)
      ctx.clip()
    }

    const imgEl = img.getElement() as HTMLImageElement
    ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, offscreen.width, offscreen.height)

    const newDataURL = offscreen.toDataURL('image/png')

    // Remove old image and overlay
    canvas.remove(img)
    canvas.remove(overlay)

    // Load cropped image
    const newImg = await FabricImage.fromURL(newDataURL)
    const cw = canvas.width!
    const ch = canvas.height!
    const scale = Math.min(cw / newImg.width!, ch / newImg.height!)
    newImg.set({
      scaleX: scale, scaleY: scale,
      selectable: false, evented: false,
      originX: 'center', originY: 'center',
      left: cw / 2, top: ch / 2,
    })

    canvas.add(newImg)
    canvas.sendObjectToBack(newImg)
    canvas.renderAll()

    imageRef.current = newImg
    dispatch({ type: 'SET_ORIGINAL', dataURL: newDataURL })
    setCrop(null)
    setActive(false)
  }

  function cancelCrop() {
    const canvas = canvasRef.current
    const overlay = cropRectRef.current
    if (!canvas || !overlay) return
    canvas.remove(overlay)
    canvas.renderAll()
    setCrop(null)
    setActive(false)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.ratioRow}>
        {RATIOS.map((r) => (
          <button
            key={r.label}
            style={{ ...styles.ratioBtn, ...(ratio === r.value && active ? styles.ratioBtnActive : {}) }}
            onClick={() => startCrop(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {active && (
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={cancelCrop}>Cancel</button>
          <button style={styles.confirmBtn} onClick={confirmCrop}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Apply Crop
          </button>
        </div>
      )}

      {!active && (
        <p style={styles.hint}>Select an aspect ratio to begin cropping</p>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  ratioRow: { display: 'flex', gap: 8 },
  ratioBtn: {
    flex: 1, padding: '10px 0',
    borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--elevated)',
    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
    color: 'var(--text-muted)', transition: 'all 0.15s',
  },
  ratioBtnActive: {
    background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)',
  },
  actions: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, padding: '10px 0', borderRadius: 12,
    background: 'var(--elevated)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
    color: 'var(--text-muted)',
  },
  confirmBtn: {
    flex: 2, padding: '10px 0', borderRadius: 12,
    background: 'var(--accent)', color: '#1a0e00',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
    boxShadow: '0 0 14px var(--accent-glow)',
  },
  hint: {
    fontFamily: 'var(--font-display)', fontSize: 12,
    color: 'var(--text-dim)', textAlign: 'center' as const,
  },
}
