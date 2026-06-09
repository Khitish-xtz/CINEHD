import { useState, useEffect } from 'react'
import HeroBanner from './HeroBanner'
import CategoryRow from './CategoryRow'
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi'

export default function SeriesPage({ onPlay, onInfo, isDesktop, onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myList, setMyList] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]')
      setMyList(saved.filter(item => item.type === 'tv'))
    } catch { setMyList([]) }
  }, [])

  const fetchSeries = () => {
    setLoading(true); setError(null)
    const timeout = setTimeout(() => { setError('Request timed out — server not responding'); setLoading(false) }, 15000)
    Promise.all([
      fetch('/api/tv/trending').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/tv/popular').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/tv/top-rated').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/tv/on-air').then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([trending, popular, topRated, onAir]) => {
        clearTimeout(timeout)
        setData({
          hero: (trending.results || []).slice(0, 6).map(s => ({
            ...s, backdrop: s.backdrop ? s.backdrop.replace('/w1280', '/original') : null,
          })),
          sections: [
            { id: 'tv-trending',  title: 'Trending Series',    movies: trending.results  || [] },
            { id: 'tv-popular',   title: 'Popular Series',     movies: popular.results   || [] },
            { id: 'tv-top-rated', title: 'Top Rated Series',   movies: topRated.results  || [] },
            { id: 'tv-on-air',    title: 'Currently On Air',   movies: onAir.results     || [] },
          ]
        })
        setLoading(false)
      })
      .catch(e => { clearTimeout(timeout); setError(typeof e === 'string' ? e : e.message || 'Failed to fetch series data'); setLoading(false) })
  }

  useEffect(() => { const cleanup = fetchSeries(); return cleanup }, [])

  if (loading) {
    return (
      <div className="mobile-page" style={{ paddingTop: 'var(--nav-height)', background: 'var(--bg-primary)', minHeight: '100dvh' }}>
        <div style={{
          height: 'clamp(240px, 44vh, 340px)', minHeight: 240,
          display: 'flex', alignItems: 'flex-end', padding: 'clamp(20px, 4vw, 40px)',
          position: 'relative', overflow: 'hidden',
        }} className="shimmer">
          <div>
            <div style={{ width: 70, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 14 }} />
            <div style={{ width: 'clamp(200px, 40vw, 320px)', height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 10 }} />
            <div style={{ width: 'clamp(160px, 30vw, 240px)', height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginBottom: 24 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 120, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ width: 100, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '20px 14px' }}>
            <div className="shimmer" style={{ width: 160, height: 18, borderRadius: 6, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="shimmer" style={{ flex: '0 0 clamp(110px, 30vw, 150px)', aspectRatio: '2/3', borderRadius: 10 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mobile-page" style={{
        paddingTop: 'var(--nav-height)', minHeight: '100dvh', background: 'var(--bg-primary)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: 24,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--accent-soft)', border: '1px solid rgba(229,9,20,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}>
          <HiExclamationCircle size={36} color="var(--accent)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6, marginBottom: 6, fontSize: 14 }}>{error}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, lineHeight: 1.5, marginBottom: 24 }}>
          Make sure the backend is running on port 3001 and your TMDB API key in .env is valid.
        </p>
        <button className="btn-primary" onClick={fetchSeries}>
          <HiRefresh size={16} /> Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="page-fade-in mobile-page" style={{ background: 'var(--bg-primary)', minHeight: '100dvh', paddingTop: 'var(--nav-height)' }}>
      {/* Hero — only show on desktop; on mobile it takes too much space for a series page */}
      {isDesktop && <HeroBanner movies={data?.hero} onPlay={onPlay} onInfo={onInfo} />}

      {/* Content — no negative overlap, add slight padding if no hero */}
      <div style={{ position: 'relative', zIndex: 2, paddingBottom: 40, paddingTop: !isDesktop ? 12 : 0 }}>
        {myList.length > 0 && (
          <CategoryRow title="My List (TV Series)" movies={myList} onPlay={onPlay} onInfo={onInfo} delay={0} />
        )}
        {data?.sections?.map((section, idx) => (
          <CategoryRow
            key={section.id}
            title={section.title}
            movies={section.movies}
            onPlay={onPlay}
            onInfo={onInfo}
            delay={(idx + 1) * 0.06}
            onSeeAll={onNavigate ? () => onNavigate(section.id) : null}
          />
        ))}
        {(!data?.sections || data.sections.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 14, marginBottom: 6 }}>No content available</p>
            <p style={{ fontSize: 12 }}>Make sure the server is running and TMDB_API_KEY is valid.</p>
          </div>
        )}
      </div>
    </div>
  )
}
