import { useState, useEffect, useRef, useCallback } from 'react'
import { HiPlay, HiStar, HiCalendar, HiChevronDown, HiChevronUp, HiChevronLeft, HiSwitchHorizontal, HiTranslate, HiPlus, HiCheck, HiShare } from 'react-icons/hi'
import SeriesCard from './SeriesCard'
import { SOURCES, LANGUAGES } from '../constants/sources'
import TrailerModal from './TrailerModal'

export default function SeriesDetail({ seriesId, onClose, onPlay, onInfo }) {
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSeason, setActiveSeason] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [epLoading, setEpLoading] = useState(false)
  const [expandedEp, setExpandedEp] = useState(null)

  const [srcIdx, setSrcIdx] = useState(0)
  const [lang, setLang] = useState('hi')
  const [showLang, setShowLang] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [currentEp, setCurrentEp] = useState(1)
  const [inWatchlist, setInWatchlist] = useState(false)

  const [showTrailer, setShowTrailer] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const [autoNext, setAutoNext] = useState(true)
  const loadTimerRef = useRef(null)

  const source = SOURCES[srcIdx] || SOURCES[0]

  const getUrl = (src) => {
    if (!src || !src.tvUrl) return ''
    return src.supportsLang
      ? src.tvUrl(seriesId, activeSeason, currentEp, lang)
      : src.tvUrl(seriesId, activeSeason, currentEp)
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
    if (!show) return
    try {
      const wl = JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]')
      setInWatchlist(wl.some(item => item.id === show.id && item.type === 'tv'))
    } catch { setInWatchlist(false) }
  }, [show])

  const toggleWatchlist = () => {
    if (!show) return
    try {
      const wl = JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]')
      let updated = inWatchlist
        ? wl.filter(item => !(item.id === show.id && item.type === 'tv'))
        : [...wl, { id: show.id, title: show.title, poster: show.poster, rating: show.rating, year: show.year, type: 'tv' }]
      localStorage.setItem('cinahd_watchlist', JSON.stringify(updated))
      setInWatchlist(!inWatchlist)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (!show) return
    try {
      const h = JSON.parse(localStorage.getItem('cinahd_history') || '[]')
      const f = h.filter(item => !(item.id === show.id && item.type === 'tv'))
      const updated = [
        { id: show.id, title: show.title, poster: show.poster, rating: show.rating, year: show.year, type: 'tv', season: activeSeason, episode: currentEp, lastWatched: Date.now() },
        ...f
      ].slice(0, 10)
      localStorage.setItem('cinahd_history', JSON.stringify(updated))
      window.dispatchEvent(new Event('storage'))
    } catch (e) { console.error(e) }
  }, [show, activeSeason, currentEp])

  useEffect(() => {
    if (!seriesId) return
    setLoading(true); setError(null); setShow(null)
    fetch(`/api/tv/${seriesId}`)
      .then(r => { if (!r.ok) throw new Error(`Server error (${r.status})`); return r.json() })
      .then(d => { if (d.error) throw new Error(d.error); setShow(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [seriesId])

  useEffect(() => {
    if (!show) return
    try {
      const h = JSON.parse(localStorage.getItem('cinahd_history') || '[]')
      const entry = h.find(item => item.id === show.id && item.type === 'tv')
      if (entry) {
        if (entry.season) setActiveSeason(entry.season)
        if (entry.episode) setCurrentEp(entry.episode)
      }
    } catch (e) { console.error(e) }
  }, [show])

  useEffect(() => {
    if (!seriesId || !show) return
    setEpLoading(true)
    fetch(`/api/tv/${seriesId}/season/${activeSeason}`)
      .then(r => r.json())
      .then(d => { setEpisodes(d.episodes || []); setEpLoading(false) })
      .catch(() => { setEpisodes([]); setEpLoading(false) })
  }, [seriesId, activeSeason, show])

  useEffect(() => {
    setPlayerLoading(true)
    setIframeKey(k => k + 1)
  }, [srcIdx, lang, seriesId, activeSeason, currentEp])



  useEffect(() => {
    const close = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!seriesId) return null

  const playEpisode = (ep) => { setCurrentEp(ep.number); setPlayerLoading(true) }

  const nextEpisode = () => {
    const maxEps = show?.seasons?.find(s => s.number === activeSeason)?.episodeCount || episodes.length
    if (currentEp < maxEps) {
      setCurrentEp(currentEp + 1)
      setPlayerLoading(true)
    } else {
      // Try next season
      const currentSeasonIdx = show?.seasons?.findIndex(s => s.number === activeSeason)
      if (currentSeasonIdx >= 0 && currentSeasonIdx < show.seasons.length - 1) {
        const nextSeason = show.seasons[currentSeasonIdx + 1]
        setActiveSeason(nextSeason.number)
        setCurrentEp(1)
        setPlayerLoading(true)
      }
    }
  }

  const shareSeries = () => {
    const url = `${window.location.origin}?tv=${seriesId}`
    if (navigator.share) {
      navigator.share({ title: show?.title, url }).catch(() => {})
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
        padding: '10px 16px',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '8px 14px', borderRadius: 10,
          background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, flexShrink: 0,
          minHeight: 44,
        }}>
          <HiChevronLeft size={16} /> Back
        </button>
        <span style={{
          fontSize: 13, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{show?.title || 'Loading...'}</span>
      </div>

      {/* Player */}
      <div className="player-wrapper">
        {playerLoading && (
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
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              Loading {source.label} · S{String(activeSeason).padStart(2,'0')}E{String(currentEp).padStart(2,'0')}...
            </p>
          </div>
        )}
        <iframe
          key={`${seriesId}-${srcIdx}-${lang}-${activeSeason}-${currentEp}-${iframeKey}`}
          src={embedUrl}
          title={show?.title || 'Player'}
          allowFullScreen allow="autoplay; encrypted-media; fullscreen"
          {...(source.sandbox ? { sandbox: source.sandbox } : {})}
          onLoad={dismissLoading}
          onError={dismissLoading} referrerPolicy="no-referrer"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none',
            opacity: playerLoading ? 0 : 1, transition: 'opacity 0.35s ease',
          }}
        />
        {!playerLoading && (
          <div style={{
            position: 'absolute', top: 10, left: 10, zIndex: 3,
            padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
            background: 'rgba(0,0,0,0.75)', color: 'white', backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
          }}>
            S{String(activeSeason).padStart(2,'0')} · E{String(currentEp).padStart(2,'0')}
          </div>
        )}
      </div>

      {/* Source + Language + Season/Episode controls */}
      <div className="player-controls-bar" style={{
        padding: '8px 12px',
        background: 'rgba(9,9,11,0.95)', borderBottom: '1px solid var(--border-glass)',
      }}>
        <HiSwitchHorizontal size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 2, flexShrink: 0 }}>SERVER</span>
        {SOURCES.map((s, i) => (
          <button key={i} onClick={() => { setSrcIdx(i); setPlayerLoading(true) }} title={s.desc}
            className={`server-chip ${srcIdx === i ? 'active' : ''}`}>
            {s.badge} {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {source.supportsLang && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowLang(v => !v)} className={`server-chip ${showLang ? 'active' : ''}`}>
              <HiTranslate size={12} /> {LANGUAGES.find(l => l.code === lang)?.label}
              <HiChevronDown size={10} style={{ opacity: 0.5 }} />
            </button>
            {showLang && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 20,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 150,
                boxShadow: 'var(--shadow-lg)',
              }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', padding: '7px 12px 3px', textTransform: 'uppercase' }}>Audio Language</p>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setShowLang(false); setLang(l.code) }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left',
                      fontSize: 12, fontWeight: lang === l.code ? 700 : 400,
                      color: lang === l.code ? 'white' : 'var(--text-secondary)',
                      background: lang === l.code ? 'var(--accent-soft)' : 'transparent',
                      borderBottom: '1px solid var(--border-glass)',
                    }}>{l.label}</button>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ width: 1, height: 18, background: 'var(--border-glass)', flexShrink: 0 }} />
        <select value={activeSeason}
          onChange={e => { setActiveSeason(+e.target.value); setCurrentEp(1); setPlayerLoading(true) }}
          style={{
            background: 'var(--bg-glass)', color: 'white', border: '1px solid var(--border-glass)',
            borderRadius: 6, fontSize: 11, padding: '4px 8px', cursor: 'pointer',
          }}>
          {(show?.seasons?.length > 0 ? show.seasons : [{ number: 1, name: 'Season 1' }]).map(s => (
            <option key={s.number} value={s.number} style={{ background: '#1a1a2a' }}>{s.name || `Season ${s.number}`}</option>
          ))}
        </select>
        <select value={currentEp}
          onChange={e => { setCurrentEp(+e.target.value); setPlayerLoading(true) }}
          style={{
            background: 'var(--bg-glass)', color: 'white', border: '1px solid var(--border-glass)',
            borderRadius: 6, fontSize: 11, padding: '4px 8px', cursor: 'pointer',
          }}>
          {Array.from({ length: show?.seasons?.find(s => s.number === activeSeason)?.episodeCount || episodes.length || 12 }, (_, i) => i + 1).map(ep => (
            <option key={ep} value={ep} style={{ background: '#1a1a2a' }}>Ep {ep}</option>
          ))}
        </select>
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
          <p style={{ fontSize: 13 }}>Loading series...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '60px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 14, marginBottom: 4, color: 'var(--accent)' }}>Failed to load</p>
          <p style={{ fontSize: 12 }}>{error}</p>
        </div>
      )}

      {!loading && !error && show && (
        <div className="detail-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 60px' }}>
          <div className="detail-info-row">
            {show.poster && (
              <img src={show.poster} alt={show.title} className="detail-poster" />
            )}
            <div className="detail-info-text" style={{ flex: 1, minWidth: 200 }}>
              <span style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.3)', marginBottom: 8,
              }}>TV SERIES</span>
              <h2 className="detail-title" style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 6, lineHeight: 1.15 }}>{show.title}</h2>
              {show.tagline && <p style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic', marginBottom: 10 }}>"{show.tagline}"</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                {show.rating && <span className="info-badge"><HiStar color="#f5c518" size={14} /> {show.rating}</span>}
                {show.year && <span className="info-badge"><HiCalendar size={14} /> {show.year}</span>}
                {show.seasons?.length > 0 && <span className="info-badge">📺 {show.seasons.length} Season{show.seasons.length !== 1 ? 's' : ''}</span>}
                {show.status && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: show.status === 'Ended' ? 'rgba(100,100,100,0.3)' : 'rgba(34,197,94,0.2)',
                    color: show.status === 'Ended' ? '#9ca3af' : '#4ade80',
                  }}>{show.status}</span>
                )}
              </div>
              {show.genres?.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                  {show.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}
                </div>
              )}
              <div className="action-btns" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                <button onClick={toggleWatchlist} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 10,
                  background: inWatchlist ? 'var(--bg-glass)' : 'rgba(229,9,20,0.9)',
                  border: inWatchlist ? '1px solid var(--border-glass)' : 'none',
                  color: 'white', fontWeight: 600, fontSize: 13,
                  minHeight: 44,
                }}>
                  {inWatchlist ? <><HiCheck size={15} /> In My List</> : <><HiPlus size={15} /> Add to My List</>}
                </button>
                {show.trailer && (
                  <button onClick={() => setShowTrailer(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10,
                    background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                    color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
                    minHeight: 44,
                  }}>
                    <HiPlay size={15} /> Trailer
                  </button>
                )}
                <button onClick={shareSeries} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 10,
                  background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
                  minHeight: 44,
                }}>
                  <HiShare size={15} /> Share
                </button>
                <button onClick={() => setAutoNext(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 10,
                  background: autoNext ? 'rgba(34,197,94,0.15)' : 'var(--bg-glass)',
                  border: `1px solid ${autoNext ? 'rgba(34,197,94,0.3)' : 'var(--border-glass)'}`,
                  color: autoNext ? '#4ade80' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 13,
                  minHeight: 44,
                }}>
                  Auto-Next: {autoNext ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {show.overview && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overview</h3>
              <p className="detail-overview">{show.overview}</p>
            </div>
          )}

          {show.cast?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cast</h3>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                {show.cast.map(person => (
                  <div key={person.id} style={{ flex: '0 0 auto', width: 76, textAlign: 'center' }}>
                    <div style={{
                      width: 58, height: 58, borderRadius: '50%', overflow: 'hidden',
                      margin: '0 auto 6px', background: 'var(--bg-card)',
                      border: '2px solid var(--border-glass)',
                    }}>
                      {person.profile ? (
                        <img src={person.profile} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-muted)' }}>👤</div>
                      )}
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {show.seasons?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Episodes — Season {activeSeason}
              </h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {show.seasons.map(s => (
                  <button key={s.number}
                    onClick={() => { setActiveSeason(s.number); setCurrentEp(1); setPlayerLoading(true) }}
                    style={{
                      padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                      background: activeSeason === s.number ? 'var(--accent)' : 'var(--bg-glass)',
                      color: activeSeason === s.number ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${activeSeason === s.number ? 'transparent' : 'var(--border-glass)'}`,
                      whiteSpace: 'nowrap',
                    }}>
                    Season {s.number}
                    <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>({s.episodeCount})</span>
                  </button>
                ))}
              </div>

              {epLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ width: '100%', height: 72, borderRadius: 10, background: 'var(--bg-card)', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {episodes.map(ep => (
                    <div key={ep.id} className={`ep-card ${currentEp === ep.number ? 'active' : ''}`}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => setExpandedEp(expandedEp === ep.number ? null : ep.number)}
                      >
                        <div style={{
                          width: 'clamp(80px, 16vw, 100px)', aspectRatio: '16/9', borderRadius: 6,
                          overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, position: 'relative',
                        }}>
                          {ep.still ? (
                            <img src={ep.still} alt={ep.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 18 }}>🎬</div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                            <span style={{ color: 'var(--text-muted)', marginRight: 6, fontSize: 11 }}>E{ep.number}</span>
                            {ep.name}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                            {ep.runtime && <span>⏱ {ep.runtime}m</span>}
                            {ep.rating && <span>⭐ {ep.rating}</span>}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); playEpisode(ep) }}
                        style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: currentEp === ep.number ? 'rgba(229,9,20,0.3)' : 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                        <HiPlay size={14} color="white" />
                      </button>
                      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        {expandedEp === ep.number ? <HiChevronUp /> : <HiChevronDown />}
                      </span>
                      {expandedEp === ep.number && ep.overview && (
                        <div style={{
                          width: '100%', padding: '8px 0 0',
                          borderTop: '1px solid var(--border-glass)', marginTop: 8,
                        }}>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ep.overview}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {episodes.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                      No episodes found for this season.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {show.similar?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>More Like This</h3>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {show.similar.map(s => (
                  <SeriesCard key={s.id} series={s} onPlay={onPlay}
                    onInfo={onInfo ? (sv) => { onClose(); setTimeout(() => onInfo(sv), 100) } : undefined} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showTrailer && show.trailer && (
        <TrailerModal videoKey={show.trailer} title={show.title} onClose={() => setShowTrailer(false)} />
      )}

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
