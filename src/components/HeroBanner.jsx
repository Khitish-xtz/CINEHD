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
        background: 'linear-gradient(to right, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.4) 50%, transparent 100%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 70%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 70% 30%, transparent 10%, rgba(5,5,8,0.15) 50%, rgba(5,5,8,0.85) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div
        key={current}
        style={{
          position: 'absolute', bottom: '12%', left: 0, right: 0, zIndex: 2,
          padding: '0 clamp(16px, 5vw, 80px)',
          maxWidth: 680,
          animation: 'fadeInUp 0.55s var(--ease) forwards',
        }}
      >
        <div style={{
          background: 'rgba(11, 11, 28, 0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: 'clamp(16px, 3.5vw, 32px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {movie.genres.slice(0, 3).map(g => (
                <span key={g.id || g} className="genre-tag" style={{ fontSize: 11, padding: '2px 10px' }}>
                  {g.name || g}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(22px, 4.5vw, 42px)',
            fontWeight: 800, letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: 12,
            textShadow: '0 2px 30px rgba(0,0,0,0.5)',
            color: 'var(--text-primary)',
          }}>
            {movie.title}
          </h1>

          {/* Overview */}
          <p style={{
            color: 'var(--text-secondary)', fontSize: 'clamp(13px, 1.1vw, 14.5px)',
            lineHeight: 1.6, maxWidth: 520, marginBottom: 20,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
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
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 2, zIndex: 3, alignItems: 'center',
      }}>
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', padding: 0,
              cursor: 'pointer',
            }}
          >
            <span style={{
              display: 'block', width: i === current ? 24 : 7, height: 7, borderRadius: 4,
              background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}
