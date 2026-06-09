import { useState, useEffect, useRef, useCallback } from 'react'
import { HiSearch, HiX, HiPlay, HiClock, HiTrash, HiFire, HiFilm } from 'react-icons/hi'
import { HiTv } from 'react-icons/hi2'

const STORAGE_KEY = 'cinahd_recent_searches'
const MAX_RECENT = 10

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveRecentSearch(query) {
  if (!query.trim()) return
  const recent = getRecentSearches().filter(q => q.toLowerCase() !== query.toLowerCase())
  recent.unshift(query.trim())
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

function removeRecentSearch(query) {
  const recent = getRecentSearches().filter(q => q !== query)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
}

function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function SearchModal({ onClose, onPlay, onInfo }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches())
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const vv = window.visualViewport
    if (vv) {
      const onResize = () => {
        const kb = window.innerHeight - vv.height - vv.offsetTop
        setKeyboardHeight(Math.max(0, kb))
      }
      vv.addEventListener('resize', onResize)
      vv.addEventListener('scroll', onResize)
      return () => {
        document.body.style.overflow = ''
        vv.removeEventListener('resize', onResize)
        vv.removeEventListener('scroll', onResize)
      }
    }
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const d = await r.json()
        setResults(d.results || [])
      } catch { setResults([]) }
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = useCallback((q) => {
    const searchQuery = q || query
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery)
      setRecentSearches(getRecentSearches())
    }
  }, [query])

  const selectRecent = useCallback((q) => {
    setQuery(q)
    saveRecentSearch(q)
    setRecentSearches(getRecentSearches())
  }, [])

  const movies = results.filter(r => r.type !== 'tv')
  const shows  = results.filter(r => r.type === 'tv')
  const showRecent = !query.trim() && recentSearches.length > 0

  return (
    <div
      ref={modalRef}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Search bar */}
      <div style={{
        flexShrink: 0, padding: '12px 14px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          maxWidth: 720, margin: '0 auto',
          background: 'var(--bg-secondary)',
          border: '2px solid rgba(229,9,20,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0 14px',
          minHeight: 48,
        }}>
          <HiSearch size={19} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search movies & TV series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            style={{
              flex: 1, height: 48, background: 'none', border: 'none',
              color: 'white', fontSize: 16, outline: 'none',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)', padding: 6, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiX size={17} />
            </button>
          )}
          <button onClick={onClose} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)', flexShrink: 0, minHeight: 36,
          }}>Esc</button>
        </div>
      </div>

      {/* Results / Recent searches */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 40px', paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 40 }} onClick={e => e.stopPropagation()}>
        {/* Zero Query State: Genres & Recent searches */}
        {!query.trim() && (
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Quick browse genres */}
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>
                Quick Browse
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Animation', 'Horror', 'Mystery'].map(gName => (
                  <button
                    key={gName}
                    onClick={() => setQuery(gName)}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-full)',
                      fontSize: 12, fontWeight: 500,
                      background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-secondary)', transition: 'all var(--transition)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.background = 'var(--accent-soft)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-glass)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                      e.currentTarget.style.background = 'var(--bg-glass)'
                    }}
                  >
                    {gName}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            <div>
              <h3 style={{
                display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12
              }}>
                <HiFire size={14} style={{ color: '#ff6b6b', marginRight: 6 }} /> Trending Searches
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Wednesday', 'The Boys', 'Stranger Things', 'Loki', 'Invincible', 'Interstellar', 'Succession'].map(trend => (
                  <button
                    key={trend}
                    onClick={() => {
                      setQuery(trend);
                      handleSubmit(trend);
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-full)',
                      fontSize: 12, fontWeight: 600,
                      background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.2)',
                      color: '#ff6b6b', transition: 'all var(--transition)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.background = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(229,9,20,0.2)'
                      e.currentTarget.style.color = '#ff6b6b'
                      e.currentTarget.style.background = 'rgba(229,9,20,0.06)'
                    }}
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Recent Searches
                  </h3>
                  <button onClick={() => { clearRecentSearches(); setRecentSearches([]) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, color: 'var(--text-muted)', padding: '4px 8px',
                      borderRadius: 6, minHeight: 28, cursor: 'pointer',
                    }}>
                    <HiTrash size={11} /> Clear
                  </button>
                </div>
                {recentSearches.map((q, i) => (
                  <button key={i} onClick={() => selectRecent(q)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 12px', marginBottom: 3,
                    borderRadius: 'var(--radius-md)', textAlign: 'left',
                    transition: 'all 0.15s ease', minHeight: 44,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid transparent', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'var(--border-glass)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                  >
                    <HiClock size={14} color="var(--text-muted)" />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{q}</span>
                    <HiX size={14} color="var(--text-muted)" style={{ opacity: 0.5, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); removeRecentSearch(q); setRecentSearches(getRecentSearches()) }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 50 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid var(--border-glass)', borderTopColor: 'var(--accent)',
              margin: '0 auto 14px', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 13 }}>Searching...</p>
          </div>
        )}

        {/* No results */}
        {!loading && query.trim() && results.length === 0 && (
          <div style={{
            textAlign: 'center', color: 'var(--text-muted)', padding: '60px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 16, color: 'var(--accent)' }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <path d="M8 11h6" />
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No results found</h3>
            <p style={{ fontSize: 13, opacity: 0.6, maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
              We couldn't find any movies or TV series matching "{query}". Try double-checking your spelling.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {movies.length > 0 && (
              <>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, marginTop: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Movies · {movies.length}
                </h3>
                {movies.map(item => (
                  <SearchRowItem key={item.id} item={item} onPlay={onPlay} onInfo={onInfo} />
                ))}
              </>
            )}
            {shows.length > 0 && (
              <>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, marginTop: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  TV Series · {shows.length}
                </h3>
                {shows.map(item => (
                  <SearchRowItem key={item.id} item={item} onPlay={onPlay} onInfo={onInfo} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

function SearchRowItem({ item, onPlay, onInfo }) {
  const isTV = item.type === 'tv'
  const [imgErr, setImgErr] = useState(false)
  const imgSrc = !imgErr && (item.poster || item.backdrop)

  return (
    <div
      onClick={() => onInfo(item)}
      style={{
        display: 'flex', gap: 14, alignItems: 'center',
        padding: '10px 14px', marginBottom: 6,
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
        cursor: 'pointer', transition: 'all var(--transition)',
        minHeight: 68,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-glass-hover)'
        e.currentTarget.style.background = 'var(--bg-elevated)'
        e.currentTarget.style.transform = 'translateX(4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-glass)'
        e.currentTarget.style.background = 'var(--bg-card)'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
    >
      <div style={{ width: 44, height: 60, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        {imgSrc ? (
          <img src={imgSrc} alt="" onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-muted)' }}>
            {isTV ? <HiTv size={18} /> : <HiFilm size={18} />}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {isTV && (
            <span style={{
              padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700,
              background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>TV</span>
          )}
          <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
          {item.year && <span>{item.year}</span>}
          {item.rating && <span style={{ color: '#f5c518' }}>★ {item.rating}</span>}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onPlay(isTV ? { ...item, season: 1, episode: 1 } : item) }}
        style={{
          width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all var(--transition)', cursor: 'pointer',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
      >
        <HiPlay size={16} color="white" />
      </button>
    </div>
  )
}
