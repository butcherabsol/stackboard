import { create } from 'zustand'

type DisplayMode = 'board' | 'list'
const KEY = 'wired:display-mode'
const SIZE_KEY = 'wired:tile-size'
function readSize(): number {
  try { const value = Number(localStorage.getItem(SIZE_KEY)); return value >= 48 && value <= 128 ? value : 96 } catch { return 96 }
}
function readMode(): DisplayMode {
  try { return localStorage.getItem(KEY) === 'list' ? 'list' : 'board' } catch { return 'board' }
}
export const useDisplayMode = create<{ mode: DisplayMode; size: number; toggle: () => void; setSize: (size: number) => void }>((set, get) => ({
  mode: readMode(),
  size: readSize(),
  setSize: (size) => {
    const safe = Math.max(48, Math.min(128, size))
    set({ size: safe })
    try { localStorage.setItem(SIZE_KEY, String(safe)) } catch { /* Keep the current size for this session. */ }
  },
  toggle: () => {
    const mode = get().mode === 'board' ? 'list' : 'board'
    set({ mode })
    try { localStorage.setItem(KEY, mode) } catch { /* Keep the current view for this session. */ }
  },
}))
window.addEventListener('storage', (event) => {
  if (event.key === KEY) useDisplayMode.setState({ mode: readMode() })
  if (event.key === SIZE_KEY) useDisplayMode.setState({ size: readSize() })
})
