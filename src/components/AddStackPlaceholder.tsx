import { Plus } from 'lucide-react'
import { useStackableStore } from '../store/useStackableStore'

interface Props {
  spaceId: string
  visible?: boolean
}

export function AddStackPlaceholder({ spaceId, visible = true }: Props) {
  const openModal = useStackableStore((s) => s.openModal)
  return (
    <button
      disabled={!visible}
      onClick={() => openModal({ kind: 'stack-add', spaceId })}
      // Lines up with the top of the stacks' link lists (below their headers).
      className="flex h-fit w-full items-center justify-center gap-2 self-start rounded-xl border border-dashed border-line-strong bg-well px-4 py-3 text-sm text-muted hover:border-accent-line hover:bg-accent-soft hover:text-accent-text compact:py-2 wallpaper:bg-panel/60 wallpaper:backdrop-blur-md"
    >
      <Plus className="h-4 w-4" />
      Add empty Stack
    </button>
  )
}
