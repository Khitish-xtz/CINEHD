import { useState, useEffect, useRef, useCallback } from 'react'
import { HiStar, HiCalendar, HiClock, HiUser, HiChevronLeft, HiSwitchHorizontal, HiTranslate, HiChevronDown, HiPlus, HiCheck, HiPlay, HiShare } from 'react-icons/hi'
import MovieCard from './MovieCard'
import { SOURCES, LANGUAGES } from '../constants/sources'
import TrailerModal from './TrailerModal'

export default function MovieDetail({ movieId, onClose, onPlay, onInfo }) {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [srcIdx, setSrcIdx] = useState(0)
  const [lang, setLang] = useState('hi')
  const [showLang, setShowLang] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [inWatchlist, setInWatchlist] = useState(false)

  const [showTrailer, setShowTrailer] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const loadTimerRef = useRef(null)

  const source = SOURCES[srcIdx] || SOURCES[0]

  const getUrl = (src) => {
    return src.supportsLang
      ? src.movieUrl(movieId, lang)
      : src.movieUrl(movieId)
  }
  const embedUrl = getUrl(source)

  const dismissLoading = useCallback(() => {
    if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null }
    setPlayerLoading(false)
  }, [])

  useEffect(() => {
    if (playerLoading) {
      loadTimerRef.current = setTimeout(() => setPlayerLoading(false), 6000)
      return () => { if (loadTimerRef.current) clearTimeout(loadTimerRef.current) }
    }
  }, [playerLoading])

  useEffect(() => {
    if (!movie) return
    try {
      const wl = JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]')
      setInWatchlist(wl.some(item => item.id === movie.id && item.type === 'movie'))
    } catch { setInWatchlist(false) }
  }, [movie])

  const toggleWatchlist = () => {
    if (!movie) return
    try {
      const wl = JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]')
      let updated = inWatchlist
        ? wl.filter(item => !(item.id === movie.id && item.type === 'movie'))
        : [...wl, { id: movie.id, title: movie.title, poster: movie.poster, rating: movie.rating, year: movie.year, type: 'movie' }]
      localStorage.setItem('cinahd_watchlist', JSON.stringify(updated))
      setInWatchlist(!inWatchlist)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (!movie) return
    try {
      const h = JSON.parse(localStorage.getItem('cinahd_history') || '[]')
      const f = h.filter(item => !(item.id === movie.id && item.type === 'movie'))
      const updated = [
        { id: movie.id, title: movie.title, poster: movie.poster, rating: movie.rating, year: movie.year, type: 'movie', lastWatched: Date.now() },
        ...f
      ].slice(0, 10)
      localStorage.setItem('cinahd_history', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch (e) { console.error(e) }
  }, [movie])

  useEffect(() => {
    if (!movieId) return
    setLoading(true); setError(null); setMovie(null)
    fetch(`/api/movie/${movieId}`)
      .then(r => { if (!r.ok) throw new Error(`Server error (${r.status})`); return r.json() })
      .then(d => { if (d.error) throw new Error(d.error); setMovie(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [movieId])

  useEffect(() => {
    setPlayerLoading(true)
    setIframeKey(k => k + 1)
  }, [srcIdx, lang, movieId])

  useEffect(() => {
    const close = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!movieId) return null

  const shareMovie = () => {
    const url = `${window.location.origin}?movie=${movieId}`
    if (navigator.share) {
      navigator.share({ title: movie?.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2000)
      })
    }
  }

  return (
    <div className="detail-scroll" style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Back bar */}
      <div className="detail-backbar" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            flexShrink: 0, transition: 'all 0.15s ease',
            minHeight: 44,
          }}
        >
          <HiChevronLeft size={16} /> Back
        </button>
        <span style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {movie?.title || 'Loading...'}
        </span>
      </div>

      {/* Player */}
      <div className="player-wrapper">
        {playerLoading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#000', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.08)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.75s linear infinite',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading {source.label}...</p>
          </div>
        )}
        <iframe
          key={`${movieId}-${srcIdx}-${lang}-${iframeKey}`}
          src={embedUrl}
          title={movie?.title || 'Player'}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          {...(source.sandbox ? { sandbox: source.sandbox } : {})}
          onLoad={dismissLoading}
          onError={dismissLoading}
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none',
            opacity: playerLoading ? 0 : 1, transition: 'opacity 0.35s ease',
          }}
        />
      </div>

      {/* Source chips */}
      <div className="player-controls-bar" style={{
        padding: '8px 12px',
        background: 'rgba(9,9,11,0.95)', borderBottom: '1px solid var(--border-glass)',
      }}>
        <HiSwitchHorizontal size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 2, flexShrink: 0 }}>SERVER</span>
        {SOURCES.map((s, i) => (
          <button
            key={i}
            onClick={() => { setSrcIdx(i); setPlayerLoading(true) }}
            title={s.desc}
            className={`server-chip ${srcIdx === i ? 'active' : ''}`}
          >
            {s.badge} {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {source.supportsLang && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowLang(v => !v)}
              className={`server-chip ${showLang ? 'active' : ''}`}
            >
              <HiTranslate size={12} />
              {LANGUAGES.find(l => l.code === lang)?.label}
              <HiChevronDown size={10} style={{ opacity: 0.5 }} />
            </button>
            {showLang && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 20,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 150,
                boxShadow: 'var(--shadow-lg)',
              }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', padding: '7px 12px 3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Audio Language
                </p>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setShowLang(false); setLang(l.code) }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 12px',
                      textAlign: 'left', fontSize: 12, fontWeight: lang === l.code ? 700 : 400,
                      color: lang === l.code ? 'white' : 'var(--text-secondary)',
                      background: lang === l.code ? 'var(--accent-soft)' : 'transparent',
                      borderBottom: '1px solid var(--border-glass)',
                    }}
                  >{l.label}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showLang && <div style={{ position: 'fixed', inset: 0, zIndex: 15 }} onClick={() => setShowLang(false)} />}

      {/* Content */}
      {loading && (
        <div style={{ padding: '60px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2.5px solid var(--border-glass)', borderTopColor: 'var(--accent)',
            margin: '0 auto 14px', animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: 13 }}>Loading details...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '60px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 14, marginBottom: 4, color: 'var(--accent)' }}>Failed to load</p>
          <p style={{ fontSize: 12 }}>{error}</p>
        </div>
      )}

      {!loading && !error && movie && (
        <div className="detail-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 60px' }}>
          {/* Info row */}
          <div className="detail-info-row">
            {movie.poster && (
              <img
                className="detail-poster"
                src={movie.poster}
                alt={movie.title}
              />
            )}
            <div className="detail-info-text" style={{ flex: 1, minWidth: 200 }}>
              <h2 className="detail-title" style={{
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800,
                marginBottom: 6, lineHeight: 1.15, letterSpacing: '-0.02em',
              }}>{movie.title}</h2>

              {movie.tagline && (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic', marginBottom: 10 }}>"{movie.tagline}"</p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                {movie.rating && <span className="info-badge"><HiStar color="#f5c518" size={14} /> {movie.rating}</span>}
                {movie.year && <span className="info-badge"><HiCalendar size={14} /> {movie.year}</span>}
                {movie.runtime > 0 && <span className="info-badge"><HiClock size={14} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              </div>

              {movie.genres?.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                  {movie.genres.map(g => (
                    <span key={g.id || g} className="genre-tag">{g.name || g}</span>
                  ))}
                </div>
              )}

              <div className="action-btns" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                <button
                  onClick={toggleWatchlist}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10,
                    background: inWatchlist ? 'var(--bg-glass)' : 'rgba(229,9,20,0.9)',
                    border: inWatchlist ? '1px solid var(--border-glass)' : 'none',
                    color: 'white', fontWeight: 600, fontSize: 13,
                    minHeight: 44,
                  }}
                >
                  {inWatchlist ? <><HiCheck size={15} /> In My List</> : <><HiPlus size={15} /> Add to My List</>}
                </button>
                {movie.trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 16px', borderRadius: 10,
                      background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
                      minHeight: 44,
                    }}
                  >
                    <HiPlay size={15} /> Trailer
                  </button>
                )}
                <button
                  onClick={shareMovie}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10,
                    background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                    color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
                    minHeight: 44,
                  }}
                >
                  <HiShare size={15} /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Overview */}
          {movie.overview && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overview</h3>
              <p className="detail-overview">{movie.overview}</p>
            </div>
          )}

          {/* Director */}
          {movie.director && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <HiUser size={13} />
              <span style={{ color: 'var(--text-muted)' }}>Director:</span>
              <span>{movie.director}</span>
            </div>
          )}

          {/* Cast */}
          {movie.cast?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cast</h3>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                {movie.cast.map(person => (
                  <div key={person.id} style={{ flex: '0 0 auto', width: 82, textAlign: 'center' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                      margin: '0 auto 6px', background: 'var(--bg-card)',
                      border: '2px solid var(--border-glass)',
                    }}>
                      {person.profile ? (
                        <img src={person.profile} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-muted)' }}><HiUser /></div>
                      )}
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar */}
          {movie.similar?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>More Like This</h3>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {movie.similar.map(m => (
                  <MovieCard
                    key={m.id} movie={m} onPlay={onPlay}
                    onInfo={onInfo ? (mv) => { onClose(); setTimeout(() => onInfo(mv), 100) } : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showTrailer && movie.trailer && (
        <TrailerModal videoKey={movie.trailer} title={movie.title} onClose={() => setShowTrailer(false)} />
      )}

      {/* Share toast */}
      {shareToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
          color: 'white', zIndex: 500, boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease',
        }}>
          Link copied to clipboard!
        </div>
      )}

    </div>
  )
}
