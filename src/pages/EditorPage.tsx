import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import TopBar from '../components/TopBar'
import CanvasArea from '../components/CanvasArea'
import BottomDrawer from '../components/BottomDrawer'

export default function EditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dataURL = (location.state as { dataURL?: string })?.dataURL

  useEffect(() => {
    if (!dataURL) navigate('/', { replace: true })
  }, [dataURL, navigate])

  if (!dataURL) return null

  return (
    <div style={styles.page}>
      <TopBar />
      <CanvasArea imageDataURL={dataURL} />
      <BottomDrawer />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
}
