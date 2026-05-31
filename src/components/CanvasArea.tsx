import { useEffect, useRef } from 'react'
import { Canvas, FabricImage } from 'fabric'
import { useEditor } from '../context/EditorContext'

interface Props {
  imageDataURL: string
}

export default function CanvasArea({ imageDataURL }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elRef = useRef<HTMLCanvasElement>(null)
  const { canvasRef, imageRef, dispatch } = useEditor()

  useEffect(() => {
    if (!containerRef.current || !elRef.current) return

    const { clientWidth, clientHeight } = containerRef.current

    const fc = new Canvas(elRef.current, {
      width: clientWidth,
      height: clientHeight,
      selection: false,
      backgroundColor: '#000',
    })
    canvasRef.current = fc

    FabricImage.fromURL(imageDataURL, { crossOrigin: 'anonymous' }).then((img) => {
      const scale = Math.min(clientWidth / img.width!, clientHeight / img.height!)
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        left: clientWidth / 2,
        top: clientHeight / 2,
      })
      fc.add(img)
      fc.renderAll()
      imageRef.current = img
      dispatch({ type: 'SET_ORIGINAL', dataURL: imageDataURL })
    })

    return () => {
      fc.dispose()
      canvasRef.current = null
      imageRef.current = null
    }
  }, [imageDataURL])

  return (
    <div ref={containerRef} style={styles.container}>
      <canvas ref={elRef} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
