import { useEffect, useRef, useState } from 'react'
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Download, Check } from 'lucide-react'
import type { Space } from '../lib/types'
import { StackColumn } from './StackColumn'
import { AddStackPlaceholder } from './AddStackPlaceholder'
import { OpenTabsButton } from './OpenTabsButton'
import { exportBackup } from '../lib/bookmarks'
import { downloadJson } from '../lib/tabs'
import { useDisplayMode } from '../store/useDisplayMode'

interface Props {
  space: Space
}

export function SpaceView({ space }: Props) {
  const [copied, setCopied] = useState(false)
  const mode = useDisplayMode((s) => s.mode)
  const tileSize = useDisplayMode((s) => s.size)
  const [atBottom, setAtBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const checkBottom = () => {
    const el = scrollRef.current
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight <= 2)
  }
  useEffect(() => {
    const observer = new ResizeObserver(checkBottom)
    if (scrollRef.current) observer.observe(scrollRef.current)
    if (contentRef.current) observer.observe(contentRef.current)
    checkBottom()
    return () => observer.disconnect()
  }, [space.id, mode, tileSize, space.stacks])

  const onExport = async () => {
    const backup = await exportBackup()
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(`stackboard-backup-${date}.json`, backup)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 px-8 py-5 compact:px-6 compact:py-3.5">
        <div className="on-wallpaper flex min-w-0 items-center gap-2.5">
          <span className="text-2xl leading-none">{space.emoji}</span>
          <h1 className="truncate text-2xl font-bold text-strong">{space.name}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onExport}
            title="Download a JSON backup of every space"
            className="flex items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1.5 text-sm text-fg hover:border-line-strong hover:bg-hover"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-accent-text" />
                Exported
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Export
              </>
            )}
          </button>
          <OpenTabsButton space={space} />
        </div>
      </header>

      {/* 0.5.0: stacks wrap into rows that use the whole width (they used to be one row of fixed
          260px columns that scrolled sideways and left the bottom of the screen empty). */}
      <div ref={scrollRef} onScroll={checkBottom} className="no-scrollbar flex-1 overflow-y-auto px-8 pb-8 compact:px-6 compact:pb-6">
        <div ref={contentRef}>
        <SortableContext items={space.stacks.map((s) => `st:${s.id}`)} strategy={mode === 'list' ? verticalListSortingStrategy : rectSortingStrategy}>
          <div
            data-stack-grid
            style={mode === 'list' ? { maxWidth: 8 * tileSize + 162 } : undefined}
            className={mode === 'list' ? 'mx-auto grid w-full grid-cols-1 items-start gap-2' : 'grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] items-start gap-x-6 gap-y-7 compact:grid-cols-[repeat(auto-fill,minmax(212px,1fr))] compact:gap-x-4 compact:gap-y-5 wallpaper:gap-y-6 compact:wallpaper:gap-y-4'}
          >
            {space.stacks.map((stack) => (
              <StackColumn key={stack.id} stack={stack} tile={mode === 'list'} />
            ))}
          </div>
        </SortableContext>
        <div className={`add-stack-reveal ${atBottom ? 'is-visible' : ''} ${mode === 'list' ? 'mx-auto mt-2 w-full' : 'mt-7 grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-x-6 compact:mt-5 compact:grid-cols-[repeat(auto-fill,minmax(212px,1fr))] compact:gap-x-4 wallpaper:mt-6 compact:wallpaper:mt-4'}`} style={mode === 'list' ? { maxWidth: 8 * tileSize + 162 } : undefined} aria-hidden={!atBottom}>
          <AddStackPlaceholder spaceId={space.id} visible={atBottom} />
        </div>
        </div>
      </div>
    </div>
  )
}
