import { HashRouter, Routes, Route } from 'react-router-dom'
import { EditorProvider } from './context/EditorContext'
import UploadPage from './pages/UploadPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  return (
    <EditorProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </HashRouter>
    </EditorProvider>
  )
}
