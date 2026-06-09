import { useState, useEffect } from 'react'
import HeroBanner from './HeroBanner'
import CategoryRow from './CategoryRow'
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi'

export default function HomePage({ onPlay, onInfo, onProviderClick, onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [watchlist, setWatchlist] = useState([])

  const loadLocalData = () => {
    try {
      setHistory(JSON.parse(localStorage.getItem('cinahd_history') || '[]'))
      setWatchlist(JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]'))
    } catch { setHistory([]); setWatchlist([]) }
  }

  useEffect(() => {
    loadLocalData()
    window.addEventListener('storage', loadLocalData)
    return () => window.removeEventListener('storage', loadLocalData)
  }, [])

  const fetchHome = () => {
    setLoading(true); setError(null)
    const timeout = setTimeout(() => { setError('Request timed out — server not responding'); setLoading(false) }, 15000)
    fetch('/api/home')
      .then(r => { if (!r.ok) throw new Error(`Server error (${r.status})`); return r.json() })
      .then(d => { if (d.error) throw new Error(d.error); clearTimeout(timeout); setData(d); setLoading(false) })
      .catch(e => { clearTimeout(timeout); setError(e.message); setLoading(false) })
    return () => clearTimeout(timeout)
  }

  useEffect(() => { const cleanup = fetchHome(); return cleanup }, [])

  if (loading) {
    return (
      <div className="mobile-page" style={{ paddingTop: 'var(--nav-height)', background: 'var(--bg-primary)', minHeight: '100dvh' }}>
        <div style={{
          height: 'clamp(240px, 44vh, 340px)', minHeight: 240,
          display: 'flex', alignItems: 'flex-end', padding: 'clamp(16px, 4vw, 40px)',
          position: 'relative', overflow: 'hidden',
        }} className="shimmer">
          <div>
            <div style={{ width: 70, height: 18, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
            <div style={{ width: 'clamp(180px, 50vw, 320px)', height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 10 }} />
            <div style={{ width: 'clamp(140px, 40vw, 240px)', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 120, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ width: 100, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '20px 14px' }}>
            <div className="shimmer" style={{ width: 140, height: 16, borderRadius: 6, marginBottom: 12 }} />
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
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6, marginBottom: 6, fontSize: 14 }}>
          {error}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, lineHeight: 1.5, marginBottom: 24 }}>
          Make sure the backend is running on port 3001 and your TMDB API key in .env is valid.
        </p>
        <button className="btn-primary" onClick={fetchHome}>
          <HiRefresh size={16} /> Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="page-fade-in mobile-page" style={{ background: 'var(--bg-primary)', minHeight: '100dvh', paddingTop: 'var(--nav-height)' }}>
      <HeroBanner movies={data?.hero} onPlay={onPlay} onInfo={onInfo} />

      {/* Content — flush below hero, no negative margin overlap */}
      <div style={{ position: 'relative', zIndex: 2, paddingBottom: 40 }}>

        {/* Brand Channels / Providers */}
        <div style={{ padding: '18px 14px 8px', maxWidth: 1280, margin: '0 auto' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Featured Channels
          </h3>
          <div className="providers-container">
            {[
              { key: 'netflix', cls: 'netflix', svg: (
                <svg viewBox="0 0 100 100">
                  <path d="M32 15h14v70H32z" fill="#e50914" />
                  <path d="M54 15h14v70H54z" fill="#e50914" />
                  <path d="M32 15c4.7 15.3 31.3 54.7 36 70H54C49.3 69.7 36.7 30.3 32 15z" fill="#b81d24" />
                </svg>
              )},
              { key: 'prime', cls: 'prime', svg: (
                <svg viewBox="0 0 100 100">
                  <path d="M20 30c0 10 20 18 30 18s30-8 30-18S60 12 50 12s-30 8-30 18zm0 15c8 10 18 13 30 13s22-3 30-13c-4 5-14 9-30 9s-26-4-30-9z" fill="#00a8e1" />
                  <path d="M12 55c15 8 40 12 76 0-3 3-10 7-26 9-20 2-40-1-50-9z" fill="#00a8e1" />
                  <path d="M82 50l4 8-8-2 4-6z" fill="#00a8e1" stroke="#00a8e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )},
              { key: 'jiohotstar', cls: 'jiohotstar', svg: (
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="jioHotstarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0a0e1a" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>
                  <text x="50" y="42" fill="#22c55e" fontSize="13" fontWeight="950" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="0.5px">Jio</text>
                  <text x="50" y="68" fill="#eab308" fontSize="14" fontWeight="950" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="0.2px">HOTSTAR</text>
                  <path d="M50 13 l2.5 5.5 h5.5 l-4.5 3.5 l1.8 5.5 l-5.3-3.5 l-5.3 3.5 l1.8-5.5 l-4.5-3.5 h5.5 z" fill="#eab308" />
                </svg>
              )},
              { key: 'disney', cls: 'disney', svg: (
                <svg viewBox="0 0 100 100">
                  <path d="M15 65c20-30 50-35 70-10C65 25 35 30 15 65z" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                  <text x="50" y="58" fill="white" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">DISNEY+</text>
                </svg>
              )},
              { key: 'hbo', cls: 'hbo', svg: (
                <svg viewBox="0 0 100 100">
                  <text x="50" y="58" fill="white" fontSize="24" fontWeight="950" textAnchor="middle" fontFamily="sans-serif" letterSpacing="-1px">MAX</text>
                  <circle cx="50" cy="48" r="4" fill="#a855f7" />
                </svg>
              )},
              { key: 'apple', cls: 'apple', svg: (
                <svg viewBox="0 0 100 100">
                  <path d="M42 42c0-3.5 2.5-6.5 6-6.5 1 0 2.5.5 3.5 1 .5.5 1 .5 1.5 0 1-.5 2.5-1 3.5-1 3.5 0 6 3 6 6.5 0 4.5-4 10.5-8.5 10.5-1.5 0-2.5-.5-3.5-1-.5-.5-1-.5-1.5 0-1 .5-2 1-3.5 1-4.5 0-7.5-6-7.5-10.5z" fill="white" />
                  <path d="M51 34c1-2.5 3.5-4 6-3.5.5 2.5-1.5 5-4.5 5.5h-1.5v-2z" fill="white" />
                  <text x="74" y="52" fill="white" fontSize="18" fontWeight="800" fontFamily="sans-serif">tv+</text>
                </svg>
              )},
            ].map(({ key, cls, svg }) => (
              <div key={key} onClick={() => onProviderClick?.(key)} className={`provider-brand-card ${cls}`}>
                {svg}
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <CategoryRow title="Continue Watching" movies={history} onPlay={onPlay} onInfo={onInfo} delay={0} />
        )}
        {watchlist.length > 0 && (
          <CategoryRow title="My List" movies={watchlist} onPlay={onPlay} onInfo={onInfo} delay={0.05} />
        )}
        {data?.sections?.map((section, idx) => (
          <CategoryRow
            key={section.id}
            title={section.title}
            movies={section.movies}
            onPlay={onPlay}
            onInfo={onInfo}
            delay={(idx + 2) * 0.06}
            onSeeAll={onNavigate && ['trending', 'popular', 'top-rated'].includes(section.id)
              ? () => onNavigate(section.id === 'trending' ? 'trending' : section.id === 'top-rated' ? 'top-rated' : 'popular')
              : null}
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
