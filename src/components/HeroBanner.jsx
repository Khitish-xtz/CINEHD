import { useState, useEffect, useCallback, useRef } from 'react'
import { HiPlay, HiInformationCircle, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export default function HeroBanner({ movies, onPlay, onInfo }) {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef(null)
  const touchStartX = useRef(0)

  const next = useCallback(() => {
    if (!movies?.length) return
    setCurrent(p => (p + 1) % movies.length)
  }, [movies?.length])

  const prev = useCallback(() => {
    if (!movies?.length) return
    setCurrent(p => (p - 1 + movies.length) % movies.length)
  }, [movies?.length])

  const goTo = useCallback((idx) => {
    setCurrent(idx)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(next, 6000)
  }, [next])

  useEffect(() => {
    if (!movies?.length) return
    intervalRef.current = setInterval(next, 6000)
    return () => clearInterval(intervalRef.current)
  }, [movies?.length, next])

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  if (!movies?.length) return null

  const movie = movies[current]

  return (
    <div
      className="hero-banner"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrops */}
      {movies.map((m, i) => (
        <div key={m.id} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 1s ease',
          transform: i === current ? 'scale(1.05)' : 'scale(1)',
          transitionProperty: 'opacity, transform',
          transitionDuration: i === current ? '1s, 7s' : '1s, 0s',
          pointerEvents: i === current ? 'auto' : 'none',
        }}>
          {m.backdrop ? (
            <img src={m.backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)' }} />
          )}
        </div>
      ))}

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(5,5,8,0.96) 0%, rgba(5,5,8,0.5) 55%, rgba(5,5,8,0.1) 100%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(5,5,8,0.6) 50%, transparent 100%)',
        zIndex: 1,
      }} />
      {/* Extra mobile gradient — stronger bottom fade */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--bg-primary) 8%, transparent 55%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div
        key={current}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
          padding: 'clamp(14px, 4vw, 60px) clamp(16px, 5vw, 80px) clamp(38px, 6vw, 64px)',
          maxWidth: 700,
          animation: 'fadeInUp 0.55s var(--ease) forwards',
        }}
      >
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {movie.rating && (
            <span style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: 'rgba(229,9,20,0.2)', color: '#ff6b6b',
              border: '1px solid rgba(229,9,20,0.35)',
            }}>
              ★ {movie.rating}
            </span>
          )}
          {movie.year && (
            <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{movie.year}</span>
          )}
          {movie.type === 'tv' && (
            <span style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              background: 'rgba(59,130,246,0.25)', color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.35)',
              letterSpacing: '0.5px',
            }}>TV SERIES</span>
          )}
        </div>

        {/* Genre tags */}
        {movie.genres?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {movie.genres.slice(0, 3).map(g => (
              <span key={g.id || g} className="genre-tag" style={{ fontSize: 11, padding: '2px 10px' }}>
                {g.name || g}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(20px, 5vw, 42px)',
          fontWeight: 800, letterSpacing: '-0.03em',
          lineHeight: 1.1, marginBottom: 10,
          textShadow: '0 2px 30px rgba(0,0,0,0.6)',
          color: 'var(--text-primary)',
        }}>
          {movie.title}
        </h1>

        {/* Overview — hidden on very small screens */}
        <p style={{
          color: 'var(--text-secondary)', fontSize: 'clamp(12px, 1.1vw, 14px)',
          lineHeight: 1.6, maxWidth: 520, marginBottom: 18,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }} className="hero-overview">
          {movie.overview}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => onInfo(movie)}>
            <HiPlay size={18} style={{ marginLeft: 1 }} /> Watch Now
          </button>
          <button className="btn-secondary" onClick={() => onInfo(movie)}>
            <HiInformationCircle size={18} /> More Info
          </button>
        </div>
      </div>

      {/* Nav arrows (desktop) */}
      <button
        onClick={prev}
        className="hero-arrow"
        style={{ left: 16 }}
      >
        <HiChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="hero-arrow"
        style={{ right: 16 }}
      >
        <HiChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', padding: 0,
              cursor: 'pointer',
            }}
          >
            <span style={{
              display: 'block', width: i === current ? 16 : 5, height: 5, borderRadius: 3,
              background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}
