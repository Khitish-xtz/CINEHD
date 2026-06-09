import { useState, useEffect } from 'react'
import { HiX, HiExternalLink, HiSwitchHorizontal, HiTranslate, HiRefresh, HiChevronDown, HiVideoCamera, HiFlag, HiVolumeUp, HiFilm, HiLightningBolt, HiGlobe, HiSparkles, HiStar, HiPlay } from 'react-icons/hi'
import { SOURCES, LANGUAGES } from '../constants/sources'

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

export default function PlayerModal({ movie, onClose }) {
  const isTV       = movie?.type === 'tv'
  const initSeason  = movie?.season  || 1
  const initEpisode = movie?.episode || 1

  const [srcIdx,   setSrcIdx]   = useState(0)
  const [lang,     setLang]     = useState('hi')
  const [loading,  setLoading]  = useState(true)
  const [showLang, setShowLang] = useState(false)
  const [season,   setSeason]   = useState(initSeason)
  const [episode,  setEpisode]  = useState(initEpisode)
  const [iframeKey, setIframeKey] = useState(0)
  const [fullMovie, setFullMovie] = useState(movie)
  const [showServerAlert, setShowServerAlert] = useState(false)
  const alertTimerRef = useRef(null)

  useEffect(() => {
    if (loading) {
      alertTimerRef.current = setTimeout(() => {
        setShowServerAlert(true)
      }, 3000)
      return () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current) }
    } else {
      setShowServerAlert(false)
    }
  }, [loading])

  useEffect(() => {
    if (!movie) return
    setFullMovie(movie)
    if (!movie.imdbId && !movie.imdb_id) {
      const type = movie.type || (isTV ? 'tv' : 'movie')
      fetch(`/api/${type}/${movie.id}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.imdbId) {
            setFullMovie(prev => ({ ...prev, imdbId: data.imdbId }))
          }
        })
        .catch(err => console.error("Error fetching imdbId:", err))
    }
  }, [movie])

  useEffect(() => {
    if (!movie) return
    try {
      const history = JSON.parse(localStorage.getItem('cinahd_history') || '[]')
      const filtered = history.filter(item => !(item.id === movie.id && item.type === movie.type))
      const updated = [
        {
          id: movie.id, title: movie.title, poster: movie.poster,
          rating: movie.rating, year: movie.year, type: movie.type || 'movie',
          ...(isTV ? { season, episode } : {}),
          lastWatched: Date.now(), progress: isTV ? 45 : 75,
          originalLanguage: movie.originalLanguage || movie.original_language
        },
        ...filtered
      ].slice(0, 10)
      localStorage.setItem('cinahd_history', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch (e) { console.error(e) }
  }, [movie, season, episode, isTV])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!movie) return null

  const getUrl = (src) => {
    if (!src || !src.movieUrl || !src.tvUrl) return ''
    if (!isTV) {
      return src.supportsLang
        ? src.movieUrl(fullMovie.id, lang, fullMovie.imdbId)
        : src.movieUrl(fullMovie.id, null, fullMovie.imdbId)
    }
    return src.supportsLang
      ? src.tvUrl(fullMovie.id, season, episode, lang, fullMovie.imdbId)
      : src.tvUrl(fullMovie.id, season, episode, null, fullMovie.imdbId)
  }

  const source = SOURCES[srcIdx] || SOURCES[0]
  const embedUrl = getUrl(source)

  const reload = (overrides = {}) => {
    setLoading(true)
    setIframeKey(k => k + 1)
    if (overrides.src    !== undefined) setSrcIdx(overrides.src)
    if (overrides.lang   !== undefined) setLang(overrides.lang)
    if (overrides.season !== undefined) setSeason(overrides.season)
    if (overrides.ep     !== undefined) setEpisode(overrides.ep)
  }

  const currentSeason = movie?.seasons?.find(s => s.number === season)
  const maxEpisodes   = currentSeason?.episodeCount || 99
  const seasonList    = movie?.seasons || []

  return (
    <div className="player-fullscreen modal-animate-slide" style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px',
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        background: 'rgba(9,9,11,0.98)',
        borderBottom: '1px solid var(--border-glass)',
        flexShrink: 0, flexWrap: 'wrap', rowGap: 6,
      }}>
        {/* Close Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 100px', minWidth: 0 }}>
          <button 
            onClick={onClose} 
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition)', minHeight: 36
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-soft)'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-glass)'
            }}
          >
            <HiX size={13} />
            <span>Close</span>
          </button>
          
          <span style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isTV ? `${movie.title} · S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')}` : (movie.title || 'Now Playing')}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
          {isTV && (
            <>
              <select value={season}
                onChange={e => { const v = +e.target.value; setSeason(v); setEpisode(1); reload({ season: v, ep: 1 }) }}
                style={{
                  background: 'var(--bg-glass)', color: 'white',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 8, fontSize: 12, padding: '6px 10px', cursor: 'pointer',
                  minWidth: 0, minHeight: 36, outline: 'none'
                }}>
                {(seasonList.length > 0 ? seasonList : Array.from({ length: 10 }, (_, i) => ({ number: i + 1 }))).map(s => (
                  <option key={s.number} value={s.number} style={{ background: '#181827' }}>S{s.number}</option>
                ))}
              </select>
              <select value={episode}
                onChange={e => { const v = +e.target.value; setEpisode(v); reload({ ep: v }) }}
                style={{
                  background: 'var(--bg-glass)', color: 'white',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 8, fontSize: 12, padding: '6px 10px', cursor: 'pointer',
                  minWidth: 0, minHeight: 36, outline: 'none'
                }}>
                {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map(ep => (
                  <option key={ep} value={ep} style={{ background: '#181827' }}>E{ep}</option>
                ))}
              </select>
            </>
          )}

          {source.supportsLang && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowLang(v => !v)}
                className={`server-chip ${showLang ? 'active' : ''}`}
                style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, minHeight: 36 }}
              >
                <HiTranslate size={13} />
                <span className="lang-label">{LANGUAGES.find(l => l.code === lang)?.label}</span>
                <HiChevronDown size={10} style={{ opacity: 0.5 }} />
              </button>
              {showLang && (
                <div className="lang-popover-menu" style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 320,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 150,
                  boxShadow: 'var(--shadow-lg)',
                }}>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>Audio Language</p>
                  {LANGUAGES.map(l => (
                    <button key={l.code}
                      onClick={() => { setShowLang(false); reload({ lang: l.code }); setLang(l.code) }}
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
                      {lang === l.code && <span style={{ color: 'var(--accent)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => reload()} title="Reload Player" style={{
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)', cursor: 'pointer'
          }}>
            <HiRefresh size={15} />
          </button>
          <a href={embedUrl} target="_blank" rel="noopener noreferrer" title="Open Stream Externally" style={{
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
          }}>
            <HiExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Redesigned Server Selector Cards */}
      <div className="server-grid-container" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(9,9,11,0.5)', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {SOURCES.map((s, i) => {
          const isActive = srcIdx === i
          const isAdFree = ['Cinezo', 'NHDAPI', 'WatchOut', 'Indra'].includes(s.label)
          let pulseColor = 'green'
          if (s.label === 'VidSrc' || s.label === 'Vidsrc.to') pulseColor = 'orange'
          else if (s.label === 'Videasy') pulseColor = 'blue'
          
          return (
            <button
              key={i}
              onClick={() => { setSrcIdx(i); reload({ src: i }) }}
              className={`server-card-btn ${isActive ? 'active' : ''}`}
              title={s.desc}
              style={{ minWidth: 130, padding: '8px 12px' }}
            >
              <div className="server-card-title-row">
                <span className="server-card-name" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {renderServerIcon(s.badge)} {s.label}
                </span>
                <div className={`status-dot-pulse ${pulseColor}`} />
              </div>
              <span className="server-card-desc" style={{ fontSize: 9 }}>{s.desc}</span>
              {isAdFree && (
                <div style={{ marginTop: 4 }}>
                  <span className="ad-free-badge" style={{ fontSize: 7, padding: '1px 3px' }}>
                    <HiSparkles size={7} style={{ color: '#fbbf24', marginRight: 2 }} />
                    Ad-Free
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Player */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}
        onClick={() => showLang && setShowLang(false)}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#000', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.75s linear infinite',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading {source.label}...</p>
          </div>
        )}
        <iframe
          key={`${movie.id}-${srcIdx}-${lang}-${season}-${episode}-${iframeKey}`}
          src={getUrl(source)}
          title={movie.title}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          {...(source.sandbox ? { sandbox: source.sandbox } : {})}
          onLoad={() => setLoading(false)}
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none',
            opacity: loading ? 0 : 1, transition: 'opacity 0.35s ease',
          }}
        />
      </div>

      {showServerAlert && loading && (
        <div style={{
          margin: '0 12px 10px',
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
              Server is taking too long to load. Try another server?
            </span>
          </div>
          <button
            onClick={() => {
              const nextIdx = (srcIdx + 1) % SOURCES.length;
              setSrcIdx(nextIdx);
              reload({ src: nextIdx });
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

      {/* Tip bar */}
      <div style={{
        padding: '8px 12px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        background: 'rgba(5,5,8,0.98)',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, gap: 10,
      }}>
        <p className="player-tip" style={{ fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'left', lineHeight: 1.4 }}>
          S1 Native · S2 Videasy · S3 WatchOut · S4 Indra · S5 Cinezo · S6 VidLink · S7 NHDAPI · S8 ScreenScape · S9 VidSrc
        </p>
        <p style={{ fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'right', fontWeight: 500 }} className="player-tip">
          Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>Esc</kbd> to close
        </p>
      </div>

    </div>
  )
}
