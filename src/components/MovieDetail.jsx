import { useState, useEffect, useRef, useCallback } from 'react'
import { HiStar, HiCalendar, HiClock, HiUser, HiChevronLeft, HiSwitchHorizontal, HiTranslate, HiChevronDown, HiPlus, HiCheck, HiPlay, HiShare, HiVideoCamera, HiFlag, HiVolumeUp, HiFilm, HiLightningBolt, HiGlobe, HiRefresh, HiSparkles } from 'react-icons/hi'
import MovieCard from './MovieCard'
import { SOURCES, LANGUAGES } from '../constants/sources'
import TrailerModal from './TrailerModal'

const renderServerIcon = (badge, size = 14) => {
  switch (badge) {
    case 'video': return <HiVideoCamera size={size} />
    case 'india': return <HiFlag size={size} style={{ color: '#ff9933' }} />
    case 'audio': return <HiVolumeUp size={size} />
    case 'movie': return <HiFilm size={size} />
    case 'rocket': return <HiLightningBolt size={size} style={{ color: '#f59e0b' }} />
    case 'theater': return <HiFilm size={size} />
    case 'play': return <HiPlay size={size} />
    case 'globe': return <HiGlobe size={size} />
    case 'refresh': return <HiRefresh size={size} />
    case 'bolt': return <HiLightningBolt size={size} style={{ color: '#fbbf24' }} />
    case 'star': return <HiStar size={size} style={{ color: '#f5c518' }} />
    case 'diamond': return <HiStar size={size} />
    case 'film': return <HiFilm size={size} />
    case 'sparkles': return <HiStar size={size} style={{ color: '#fbbf24' }} />
    default: return <HiFilm size={size} />
  }
}

export default function MovieDetail({ movieId, onClose, onPlay, onInfo, onPersonClick, autoPlay }) {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [srcIdx, setSrcIdx] = useState(0)
  const [lang, setLang] = useState('hi')
  const [showLang, setShowLang] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay || false)

  const [showTrailer, setShowTrailer] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const [showServerAlert, setShowServerAlert] = useState(false)
  const loadTimerRef = useRef(null)
  const alertTimerRef = useRef(null)

  const source = SOURCES[srcIdx] || SOURCES[0]

  const getUrl = (src) => {
    return src.supportsLang
      ? src.movieUrl(movieId, lang, movie?.imdbId)
      : src.movieUrl(movieId, null, movie?.imdbId)
  }
  const embedUrl = getUrl(source)

  const dismissLoading = useCallback(() => {
    if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null }
    if (alertTimerRef.current) { clearTimeout(alertTimerRef.current); alertTimerRef.current = null }
    setPlayerLoading(false)
    setShowServerAlert(false)
  }, [])

  useEffect(() => {
    if (playerLoading && isPlaying) {
      loadTimerRef.current = setTimeout(() => setPlayerLoading(false), 6000)
      return () => { if (loadTimerRef.current) clearTimeout(loadTimerRef.current) }
    }
  }, [playerLoading, isPlaying])

  useEffect(() => {
    if (playerLoading && isPlaying) {
      alertTimerRef.current = setTimeout(() => {
        setShowServerAlert(true)
      }, 3000)
      return () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current) }
    } else {
      setShowServerAlert(false)
    }
  }, [playerLoading, isPlaying])

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

  // Save progress when playing
  useEffect(() => {
    if (!movie || !isPlaying) return
    try {
      const h = JSON.parse(localStorage.getItem('cinahd_history') || '[]')
      const f = h.filter(item => !(item.id === movie.id && item.type === 'movie'))
      // Save simulated progress of 60% when they start streaming
      const updated = [
        { 
          id: movie.id, title: movie.title, poster: movie.poster, 
          rating: movie.rating, year: movie.year, type: 'movie', 
          lastWatched: Date.now(), progress: 60,
          originalLanguage: movie.originalLanguage
        },
        ...f
      ].slice(0, 10)
      localStorage.setItem('cinahd_history', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch (e) { console.error(e) }
  }, [movie, isPlaying])

  useEffect(() => {
    if (!movieId) return
    setLoading(true); setError(null); setMovie(null); setIsPlaying(false)
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
    <div className="detail-scroll modal-animate-slide" style={{ background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* Blurred backdrop banner */}
      {!loading && !error && movie && movie.backdrop && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '55vh',
          backgroundImage: `url(${movie.backdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.15,
          filter: 'blur(36px)',
          pointerEvents: 'none',
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
        }} />
      )}

      {/* Back bar */}
      <div className="detail-backbar" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)',
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

        {isPlaying && (
          <button 
            onClick={() => setIsPlaying(false)}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 8, background: 'rgba(229,9,20,0.2)',
              border: '1px solid rgba(229,9,20,0.3)', color: '#ff4d4d', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s', minHeight: 32
            }}
          >
            ✕ Close Player
          </button>
        )}
      </div>

      {/* Player Frame or Cinematic Backdrop */}
      <div className="player-wrapper" style={{ zIndex: 2 }}>
        {!isPlaying && movie ? (
          /* Cinematic Hero Banner with Play Button */
          <div 
            className="detail-hero-banner"
            style={{ backgroundImage: movie.backdrop ? `url(${movie.backdrop})` : 'none' }}
          >
            <div className="detail-hero-vignette" />
            <button 
              className="play-btn-glow"
              onClick={() => setIsPlaying(true)}
              title="Play Movie"
            >
              <HiPlay size={36} color="white" />
            </button>
          </div>
        ) : (
          /* Active Embed Iframe Player */
          <>
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
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none',
                opacity: playerLoading ? 0 : 1, transition: 'opacity 0.35s ease',
              }}
            />
          </>
        )}
      </div>

      {/* Redesigned Premium Server Selector Cards */}
      {isPlaying && (
        <>
          {showServerAlert && playerLoading && (
            <div style={{
              margin: '12px 14px 0',
              padding: '10px 14px',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              animation: 'fadeIn 0.25s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiLightningBolt style={{ color: 'var(--accent)' }} size={16} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Server taking too long to load? Try switching servers.
                </span>
              </div>
              <button
                onClick={() => {
                  const nextIdx = (srcIdx + 1) % SOURCES.length;
                  setSrcIdx(nextIdx);
                  setPlayerLoading(true);
                  setShowServerAlert(false);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Switch Server
              </button>
            </div>
          )}

          <div className="server-grid-container" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(9,9,11,0.5)' }}>
            {SOURCES.map((s, i) => {
              const isActive = srcIdx === i
              const isAdFree = ['Cinezo', 'NHDAPI', 'WatchOut', 'Indra'].includes(s.label)
              let pulseColor = 'green'
              if (s.label.toLowerCase().includes('vidsrc') || s.label.toLowerCase().includes('vsrc')) pulseColor = 'orange'
              else if (s.label === 'Videasy') pulseColor = 'blue'
              
              return (
                <button
                  key={i}
                  onClick={() => { setSrcIdx(i); setPlayerLoading(true) }}
                  className={`server-card-btn ${isActive ? 'active' : ''}`}
                  title={s.desc}
                >
                  <div className="server-card-title-row">
                    <span className="server-card-name">{s.badge} {s.label}</span>
                    <div className={`status-dot-pulse ${pulseColor}`} />
                  </div>
                  <span className="server-card-desc">{s.desc}</span>
                  {isAdFree && (
                    <div style={{ marginTop: 6 }}>
                      <span className="ad-free-badge">
                        <HiSparkles size={10} style={{ color: '#fbbf24', marginRight: 4 }} />
                        Ad-Free
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Language Selector Popover Bar */}
          {source.supportsLang && (
            <div style={{ padding: '8px 14px', background: 'rgba(5,5,8,0.7)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setShowLang(v => !v)}
                  className={`server-chip ${showLang ? 'active' : ''}`}
                  style={{ padding: '6px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <HiTranslate size={14} />
                  {LANGUAGES.find(l => l.code === lang)?.label}
                  <HiChevronDown size={11} style={{ opacity: 0.5 }} />
                </button>
                {showLang && (
                  <div className="lang-popover-menu" style={{
                    position: 'absolute', top: '110%', right: 0, zIndex: 20,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 155,
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Audio Language
                    </p>
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setShowLang(false); setLang(l.code) }}
                        style={{
                          display: 'flex', width: '100%', padding: '10px 12px',
                          alignItems: 'center', justifyContent: 'space-between',
                          textAlign: 'left', fontSize: 12, fontWeight: lang === l.code ? 700 : 400,
                          color: lang === l.code ? 'white' : 'var(--text-secondary)',
                          background: lang === l.code ? 'var(--accent-soft)' : 'transparent',
                          borderBottom: '1px solid var(--border-glass)',
                        }}
                      >
                        <span>{l.label}</span>
                        {lang === l.code && <span style={{ color: 'var(--accent)', fontWeight: 800 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {showLang && <div style={{ position: 'fixed', inset: 0, zIndex: 15 }} onClick={() => setShowLang(false)} />}
        </>
      )}

      {/* Content Section */}
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
        <div className="detail-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 60px', position: 'relative', zIndex: 2 }}>
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

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                {/* Circular Rating Progress Meter */}
                {movie.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="rating-circle-container">
                      <svg className="rating-circle-svg" viewBox="0 0 36 36">
                        <circle className="rating-circle-bg" cx="18" cy="18" r="16" />
                        <circle 
                          className="rating-circle-progress" 
                          cx="18" cy="18" r="16" 
                          strokeDasharray="100, 100"
                          strokeDashoffset={100 - (parseFloat(movie.rating) * 10)} 
                        />
                      </svg>
                      <div className="rating-circle-text">{movie.rating}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>TMDB Score</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  {movie.year && <span className="info-badge"><HiCalendar size={14} /> {movie.year}</span>}
                  {movie.runtime > 0 && <span className="info-badge"><HiClock size={14} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
                </div>
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
                  onClick={() => setIsPlaying(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 10,
                    background: 'var(--accent-gradient)',
                    color: 'white', fontWeight: 700, fontSize: 13,
                    minHeight: 44, border: 'none', cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <HiPlay size={16} /> Play Now
                </button>
                <button
                  onClick={toggleWatchlist}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10,
                    background: inWatchlist ? 'var(--bg-glass)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-glass)',
                    color: 'white', fontWeight: 600, fontSize: 13,
                    minHeight: 44, cursor: 'pointer'
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
                      minHeight: 44, cursor: 'pointer'
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
                    minHeight: 44, cursor: 'pointer'
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
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <HiUser size={13} />
              <span style={{ color: 'var(--text-muted)' }}>Director:</span>
              <span>{movie.director}</span>
            </div>
          )}

          {/* Cast with filmography trigger */}
          {movie.cast?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cast</h3>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                {movie.cast.map(person => (
                  <div 
                    key={person.id} 
                    onClick={() => onPersonClick?.(person.id)}
                    className="cast-avatar-glowing"
                    style={{ flex: '0 0 auto', width: 82, textAlign: 'center', cursor: 'pointer' }}
                  >
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

          {/* TMDB Reviews Section */}
          {movie.reviews?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audience Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {movie.reviews.slice(0, 3).map(rev => (
                  <div key={rev.id} className="review-item">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{rev.author}</span>
                      {rev.rating && (
                        <span style={{ fontSize: 11, color: '#f5c518', fontWeight: 700 }}>★ {rev.rating}/10</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rev.content}
                    </p>
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
