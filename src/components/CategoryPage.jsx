import { useState, useEffect, useRef, useCallback } from 'react'
import { HiChevronDown } from 'react-icons/hi'
import MovieCard from './MovieCard'
import SeriesCard from './SeriesCard'

const API_MAP = {
  'trending-now': '/api/trending',
  'popular-movies': '/api/popular',
  'top-rated': '/api/top-rated',
  'coming-soon': '/api/upcoming',
  'now-playing': '/api/now-playing',
}

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'rating-asc', label: 'Rating (Low to High)' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
]

function sortItems(items, sortBy) {
  if (sortBy === 'default') return items
  const sorted = [...items]
  switch (sortBy) {
    case 'rating-desc': return sorted.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
    case 'rating-asc': return sorted.sort((a, b) => (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0))
    case 'year-desc': return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0))
    case 'year-asc': return sorted.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
    case 'title-asc': return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    default: return sorted
  }
}

export default function CategoryPage({ category, onPlay, onInfo }) {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('default')
  const [showSort, setShowSort] = useState(false)
  const loaderRef = useRef(null)

  const apiPath = API_MAP[category]

  useEffect(() => {
    if (!apiPath) return
    setLoading(true); setPage(1)
    fetch(`${apiPath}?page=1`)
      .then(r => r.json())
      .then(d => { setMovies(d.results || []); setTotalPages(d.totalPages || 1); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category, apiPath])

  // Infinite scroll observer
  useEffect(() => {
    if (page === 1 || !apiPath) return
    fetch(`${apiPath}?page=${page}`)
      .then(r => r.json())
      .then(d => setMovies(prev => [...prev, ...(d.results || [])]))
  }, [page, category, apiPath])

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

  const titles = {
    'trending-now': 'Trending Now',
    'popular-movies': 'Popular Movies',
    'top-rated': 'Top Rated',
    'coming-soon': 'Coming Soon',
    'now-playing': 'Now Playing',
  }

  if (!apiPath) {
    return <div style={{ padding: '60px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Category not found</div>
  }

  const sorted = sortItems(movies, sortBy)

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 12px)' }}>
      <div className="container">
        <div className="category-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h1 className="section-title">{titles[category] || category}</h1>

          {/* Sort dropdown */}
          <div className="sort-dropdown" style={{ position: 'relative' }}>
            <button onClick={() => setShowSort(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
            }}>
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <HiChevronDown size={13} />
            </button>
            {showSort && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 20,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', minWidth: 180,
                boxShadow: 'var(--shadow-lg)',
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 14px', textAlign: 'left',
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
              <div key={i} className="shimmer" style={{ aspectRatio: '2/3', borderRadius: 10 }} />
            ))}
          </div>
        ) : (
          <>
            <div className="mobile-grid">
              {sorted.map(movie => (
                movie.type === 'tv' ? (
                  <SeriesCard key={movie.id} series={movie} onPlay={onPlay} onInfo={onInfo} />
                ) : (
                  <MovieCard key={movie.id} movie={movie} onPlay={onPlay} onInfo={onInfo} />
                )
              ))}
            </div>
            {/* Infinite scroll trigger */}
            <div ref={loaderRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {page < totalPages && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid var(--border-glass)', borderTopColor: 'var(--accent)',
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
