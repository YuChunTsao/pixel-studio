import { createContext, useContext, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Canvas, FabricImage } from 'fabric'

export type Tool = 'crop' | 'adjust' | 'filter' | 'text' | 'draw'

export interface Adjustments {
  brightness: number
  contrast: number
  saturation: number
}

interface State {
  activeTool: Tool
  adjustments: Adjustments
  activeFilter: string | null
  originalImageDataURL: string | null
}

type Action =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_ADJUSTMENTS'; adjustments: Adjustments }
  | { type: 'SET_FILTER'; filter: string | null }
  | { type: 'SET_ORIGINAL'; dataURL: string }
  | { type: 'RESET' }

const initialState: State = {
  activeTool: 'adjust',
  adjustments: { brightness: 0, contrast: 0, saturation: 0 },
  activeFilter: null,
  originalImageDataURL: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool }
    case 'SET_ADJUSTMENTS':
      return { ...state, adjustments: action.adjustments }
    case 'SET_FILTER':
      return { ...state, activeFilter: action.filter }
    case 'SET_ORIGINAL':
      return { ...state, originalImageDataURL: action.dataURL }
    case 'RESET':
      return { ...state, adjustments: { brightness: 0, contrast: 0, saturation: 0 }, activeFilter: null }
    default:
      return state
  }
}

interface EditorContextValue {
  state: State
  dispatch: React.Dispatch<Action>
  canvasRef: React.RefObject<Canvas | null>
  imageRef: React.RefObject<FabricImage | null>
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const canvasRef = useRef<Canvas | null>(null)
  const imageRef = useRef<FabricImage | null>(null)

  return (
    <EditorContext.Provider value={{ state, dispatch, canvasRef, imageRef }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
