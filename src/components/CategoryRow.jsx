import { useRef, useCallback, useState, useEffect } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import MovieCard from './MovieCard'
import SeriesCard from './SeriesCard'

export default function CategoryRow({ title, movies, onPlay, onInfo, delay = 0 }) {
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
      <div className="row-header container" style={{ padding: '0 14px' }}>
        <h2 className="section-title">{title}</h2>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="row-scroll" ref={scrollRef}>
          <div style={{ minWidth: 10, flexShrink: 0 }} />
          {movies.map(movie => (
            movie.type === 'tv' ? (
              <SeriesCard key={movie.id} series={movie} onPlay={onPlay} onInfo={onInfo} />
            ) : (
              <MovieCard key={movie.id} movie={movie} onPlay={onPlay} onInfo={onInfo} />
            )
          ))}
          <div style={{ minWidth: 10, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  )
}
