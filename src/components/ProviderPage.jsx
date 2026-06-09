import { useState, useEffect, useRef, useCallback } from 'react'
import { HiChevronDown, HiChevronLeft } from 'react-icons/hi'
import MovieCard from './MovieCard'
import SeriesCard from './SeriesCard'

const BRAND_DETAILS = {
  netflix: {
    name: 'Netflix',
    color: '#e50914',
    gradient: 'linear-gradient(135deg, rgba(229, 9, 20, 0.45) 0%, rgba(5, 5, 8, 0.95) 100%)',
    badge: 'N'
  },
  prime: {
    name: 'Prime Video',
    color: '#00a8e1',
    gradient: 'linear-gradient(135deg, rgba(0, 168, 225, 0.45) 0%, rgba(5, 5, 8, 0.95) 100%)',
    badge: 'Prime'
  },
  disney: {
    name: 'Disney+',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.45) 0%, rgba(5, 5, 8, 0.95) 100%)',
    badge: 'Disney+'
  },
  hbo: {
    name: 'Max',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(5, 5, 8, 0.95) 100%)',
    badge: 'Max'
  },
  apple: {
    name: 'Apple TV+',
    color: '#f8fafc',
    gradient: 'linear-gradient(135deg, rgba(248, 250, 252, 0.25) 0%, rgba(5, 5, 8, 0.95) 100%)',
    badge: 'tv+'
  },
  jiohotstar: {
    name: 'JioHotstar',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(234, 179, 8, 0.35) 50%, rgba(5, 5, 8, 0.95) 100%)',
    badge: 'JioHotstar'
  }
}

const SORT_OPTIONS = [
  { value: 'default', label: 'Popularity' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
]

function sortItems(items, sortBy) {
  if (sortBy === 'default') return items
  const sorted = [...items]
  switch (sortBy) {
    case 'rating-desc': return sorted.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
    case 'year-desc': return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0))
    case 'year-asc': return sorted.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
    case 'title-asc': return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    default: return sorted
  }
}

export default function ProviderPage({ providerName, onPlay, onInfo, onBack }) {
  const brand = BRAND_DETAILS[providerName] || BRAND_DETAILS.netflix
  const [activeTab, setActiveTab] = useState('tv') // 'tv' or 'movie'
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('default')
  const [showSort, setShowSort] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const loaderRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setPage(1)
    setItems([])
    setSearchQuery('')
    fetch(`/api/provider/${providerName}?type=${activeTab}&page=1`)
      .then(r => r.json())
      .then(d => {
        setItems(d.results || [])
        setTotalPages(d.totalPages || 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [providerName, activeTab])

  useEffect(() => {
    if (page === 1) return
    fetch(`/api/provider/${providerName}?type=${activeTab}&page=${page}`)
      .then(r => r.json())
      .then(d => {
        setItems(prev => [...prev, ...(d.results || [])])
      })
  }, [page, providerName, activeTab])

  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && page < totalPages && !loading) {
      setPage(p => p + 1)
    }
  }, [page, totalPages, loading])

  useEffect(() => {
    const option = { root: null, rootMargin: '200px', threshold: 0 }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [handleObserver])

  const sorted = sortItems(items, sortBy)
  const filtered = sorted.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.overview || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 10px)', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      
      {/* Brand Header Banner */}
      <div style={{
        background: brand.gradient,
        borderBottom: '1px solid var(--border-glass)',
        padding: '24px 18px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 20,
        borderRadius: 16,
        margin: '0 12px 20px',
        minHeight: 135,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Back Button */}
        <button 
          onClick={onBack} 
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(5,5,8,0.6)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s ease',
            marginBottom: 24, backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = brand.color}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <HiChevronLeft size={16} /> Back to Home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontSize: 'clamp(28px, 6vw, 56px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'white',
            lineHeight: 1,
            textShadow: `0 4px 20px ${brand.color}33`
          }}>
            {brand.name}
          </div>
          <span style={{
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            background: brand.color,
            color: providerName === 'apple' ? 'black' : 'white',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Originals
          </span>
        </div>
      </div>

      <div className="container">
        {/* Brand search input */}
        <div style={{ marginBottom: 20, maxWidth: 450 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)', padding: '0 14px', height: 42,
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder={`Search in ${brand.name} ${activeTab === 'tv' ? 'TV Shows' : 'Movies'}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none',
                color: 'white', fontSize: 13, outline: 'none'
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-secondary)', padding: 6, fontSize: 12 }}>✕</button>
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            padding: 3,
            borderRadius: 10,
            backdropFilter: 'blur(10px)'
          }}>
            <button
              onClick={() => setActiveTab('tv')}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'tv' ? 'white' : 'var(--text-secondary)',
                background: activeTab === 'tv' ? 'var(--bg-elevated)' : 'transparent',
                border: activeTab === 'tv' ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              TV Shows
            </button>
            <button
              onClick={() => setActiveTab('movie')}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'movie' ? 'white' : 'var(--text-secondary)',
                background: activeTab === 'movie' ? 'var(--bg-elevated)' : 'transparent',
                border: activeTab === 'movie' ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              Movies
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="sort-dropdown" style={{ position: 'relative' }}>
            <button onClick={() => setShowSort(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)', minHeight: 38
            }}>
              Sort by: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <HiChevronDown size={14} />
            </button>
            {showSort && (
              <div className="lang-popover-menu" style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 20,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 180,
                boxShadow: 'var(--shadow-lg)',
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                      fontSize: 12, fontWeight: sortBy === opt.value ? 600 : 400,
                      color: sortBy === opt.value ? 'white' : 'var(--text-secondary)',
                      background: sortBy === opt.value ? 'var(--accent-soft)' : 'transparent',
                      borderBottom: '1px solid var(--border-glass)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showSort && <div style={{ position: 'fixed', inset: 0, zIndex: 15 }} onClick={() => setShowSort(false)} />}

        {loading ? (
          <div className="mobile-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ aspectRatio: '2/3', borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <>
            <div className="mobile-grid">
              {filtered.map(item => (
                item.type === 'tv' ? (
                  <SeriesCard key={item.id} series={item} onPlay={onPlay} onInfo={onInfo} />
                ) : (
                  <MovieCard key={item.id} movie={item} onPlay={onPlay} onInfo={onInfo} />
                )
              ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--text-muted)' }}>
                {searchQuery ? `No matches found for "${searchQuery}"` : 'No titles available in this category.'}
              </div>
            )}

            {/* Infinite scroll loader */}
            <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {page < totalPages && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '2.5px solid var(--border-glass)', borderTopColor: brand.color,
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
