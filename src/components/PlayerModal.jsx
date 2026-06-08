import { useState, useEffect } from 'react'
import { HiX, HiExternalLink, HiSwitchHorizontal, HiTranslate, HiRefresh, HiChevronDown } from 'react-icons/hi'
import { SOURCES, LANGUAGES, BLOCK_ADS } from '../constants/sources'

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
          lastWatched: Date.now()
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
        ? src.movieUrl(movie.id, lang)
        : src.movieUrl(movie.id)
    }
    return src.supportsLang
      ? src.tvUrl(movie.id, season, episode, lang)
      : src.tvUrl(movie.id, season, episode)
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
    <div className="player-fullscreen" style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 8px',
        paddingTop: 'max(6px, env(safe-area-inset-top))',
        background: 'rgba(9,9,11,0.98)',
        borderBottom: '1px solid var(--border-glass)',
        flexShrink: 0, flexWrap: 'wrap', rowGap: 4,
      }}>
        {/* Close Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 100px', minWidth: 0 }}>
          <button 
            onClick={onClose} 
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition)',
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
            <HiX size={12} />
            <span>Close</span>
          </button>
          
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isTV ? `${movie.title} · S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')}` : (movie.title || 'Now Playing')}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
          {isTV && (
            <>
              <select value={season}
                onChange={e => { const v = +e.target.value; setSeason(v); setEpisode(1); reload({ season: v, ep: 1 }) }}
                style={{
                  background: 'var(--bg-glass)', color: 'white',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 6, fontSize: 12, padding: '5px 6px', cursor: 'pointer',
                  minWidth: 0, minHeight: 32,
                }}>
                {(seasonList.length > 0 ? seasonList : Array.from({ length: 10 }, (_, i) => ({ number: i + 1 }))).map(s => (
                  <option key={s.number} value={s.number} style={{ background: '#1a1a2a' }}>S{s.number}</option>
                ))}
              </select>
              <select value={episode}
                onChange={e => { const v = +e.target.value; setEpisode(v); reload({ ep: v }) }}
                style={{
                  background: 'var(--bg-glass)', color: 'white',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 6, fontSize: 12, padding: '5px 6px', cursor: 'pointer',
                  minWidth: 0, minHeight: 32,
                }}>
                {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map(ep => (
                  <option key={ep} value={ep} style={{ background: '#1a1a2a' }}>E{ep}</option>
                ))}
              </select>
            </>
          )}

          {source.supportsLang && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowLang(v => !v)}
                className={`server-chip ${showLang ? 'active' : ''}`}>
                <HiTranslate size={11} />
                <span className="lang-label">{LANGUAGES.find(l => l.code === lang)?.label}</span>
                <HiChevronDown size={9} style={{ opacity: 0.5 }} />
              </button>
              {showLang && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 20,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 140,
                  boxShadow: 'var(--shadow-lg)',
                }}>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', padding: '6px 10px 2px', textTransform: 'uppercase' }}>Audio</p>
                  {LANGUAGES.map(l => (
                    <button key={l.code}
                      onClick={() => { setShowLang(false); reload({ lang: l.code }); setLang(l.code) }}
                      style={{
                        display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left',
                        fontSize: 11, fontWeight: lang === l.code ? 700 : 400,
                        color: lang === l.code ? 'white' : 'var(--text-secondary)',
                        background: lang === l.code ? 'var(--accent-soft)' : 'transparent',
                        borderBottom: '1px solid var(--border-glass)',
                      }}>{l.label}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => reload()} title="Reload" style={{
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
          }}>
            <HiRefresh size={14} />
          </button>
          <a href={embedUrl} target="_blank" rel="noopener noreferrer" title="Open" style={{
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
          }}>
            <HiExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Source chips bar */}
      <div className="source-scroll-wrap">
        <div className="source-scroll">
          <HiSwitchHorizontal size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: 4 }} />
          {SOURCES.map((s, i) => (
            <button key={i} onClick={() => { setSrcIdx(i); reload({ src: i }) }} title={s.desc}
              className={`server-chip ${srcIdx === i ? 'active' : ''}`}>
              {s.badge} {s.label}
            </button>
          ))}
        </div>
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
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none',
            opacity: loading ? 0 : 1, transition: 'opacity 0.35s ease',
          }}
        />
      </div>

      {/* Tip bar */}
      <div style={{
        padding: '5px 12px',
        paddingBottom: 'max(5px, env(safe-area-inset-bottom))',
        background: 'rgba(5,5,8,0.98)',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, gap: 10,
      }}>
        <p className="player-tip" style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'left', lineHeight: 1.4 }}>
          S1 Native · S2 Videasy · S3 WatchOut · S4 Indra · S5 Cinezo · S6 VidLink · S7 NHDAPI · S8 ScreenScape · S9 VidSrc
        </p>
        <p style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'right', fontWeight: 500 }} className="player-tip">
          Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>Esc</kbd> to exit player
        </p>
      </div>

    </div>
  )
}
