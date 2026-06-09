import { useRef, useCallback, useState, useEffect } from 'react'
import { HiChevronLeft, HiChevronRight, HiChevronRight as HiArrow } from 'react-icons/hi'
import MovieCard from './MovieCard'
import SeriesCard from './SeriesCard'

export default function CategoryRow({ title, movies, onPlay, onInfo, delay = 0, onSeeAll }) {
  const scrollRef = useRef(null)
  const [canScrollL, setCanScrollL] = useState(false)
  const [canScrollR, setCanScrollR] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollL(el.scrollLeft > 10)
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, movies])

  const scroll = useCallback((dir) => {
    scrollRef.current?.scrollBy({ left: dir * 640, behavior: 'smooth' })
  }, [])

  if (!movies?.length) return null

  return (
    <div className="row fade-in-up" style={{ animationDelay: `${delay}s` }}>
      {/* Row header with optional See All */}
      <div className="row-header container" style={{ padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="row-see-all"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent)',
              padding: '4px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            See All <HiArrow size={14} />
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        {/* Desktop scroll buttons */}
        {canScrollL && (
          <button className="row-btn" onClick={() => scroll(-1)} style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            zIndex: 5, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <HiChevronLeft size={20} />
          </button>
        )}
        {canScrollR && (
          <button className="row-btn" onClick={() => scroll(1)} style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            zIndex: 5, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <HiChevronRight size={20} />
          </button>
        )}

        <div className="row-scroll" ref={scrollRef}>
          <div style={{ minWidth: 10, flexShrink: 0 }} />
          {movies.map(movie => (
            movie.type === 'tv' ? (
              <SeriesCard key={movie.id} series={movie} onPlay={onPlay} onInfo={onInfo} />
            ) : (
              <MovieCard key={movie.id} movie={movie} onPlay={onPlay} onInfo={onInfo} />
            )
          ))}
          {/* See All card at end of row on mobile */}
          {onSeeAll && (
            <div
              onClick={onSeeAll}
              style={{
                flex: '0 0 auto',
                width: 'clamp(90px, 22vw, 120px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                border: '1px dashed var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                aspectRatio: '2/3',
                color: 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onTouchStart={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onTouchEnd={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
            >
              <span style={{ fontSize: 22 }}>→</span>
              <span style={{ textAlign: 'center', lineHeight: 1.3 }}>See All</span>
            </div>
          )}
          <div style={{ minWidth: 10, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  )
}
