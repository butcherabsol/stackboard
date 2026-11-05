import { useEffect, useState } from 'react'
import { faviconUrl, monogram, peekFavicon, resolveFavicon, type ResolvedIcon } from '../lib/favicon'

interface Props {
  /** Leading emoji from the title; wins over the favicon. */
  emoji: string | null
  /** Display title, for the monogram letter. */
  title: string
  url: string
  size?: number
}

export function BookmarkIcon({ emoji, title, url, size = 16 }: Props) {
  if (emoji) {
    return (
      <span className="flex shrink-0 items-center justify-center leading-none" style={{ width: size, height: size, fontSize: size * 0.8 }}>
        {emoji}
      </span>
    )
  }
  const src = faviconUrl(url, size > 16 ? 64 : 32)
  // Keyed by src so an edited URL starts a fresh check.
  return <Favicon key={src} src={src} title={title} url={url} size={size} />
}

function Favicon({ src, title, url, size }: { src: string; title: string; url: string; size: number }) {
  const [icon, setIcon] = useState<ResolvedIcon | undefined>(() => peekFavicon(src))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (icon) return
    let live = true
    void resolveFavicon(src).then((r) => live && setIcon(r))
    return () => {
      live = false
    }
  }, [src, icon])

  // Until resolved, hold the space so the title doesn't shift; a site with no icon never
  // flashes Chrome's grey globe on its way to the monogram.
  if (!icon) return <span aria-hidden className="shrink-0" style={{ width: size, height: size }} />

  if (icon.generic || failed) {
    const m = monogram(title, url)
    return (
      <span
        aria-hidden
        className="flex shrink-0 select-none items-center justify-center rounded-[4px] font-bold leading-none"
        style={{ width: size, height: size, fontSize: size * 0.625, backgroundColor: `var(--sb-tint-${m.tint}-bg)`, color: `var(--sb-tint-${m.tint}-fg)` }}
      >
        {m.letter}
      </span>
    )
  }

  return (
    <img
      src={icon.src}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 rounded-sm ${icon.glyph ? `glyph-${icon.glyph}` : ''}`}
      onError={() => setFailed(true)}
    />
  )
}
