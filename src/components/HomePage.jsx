import { useState, useEffect } from 'react'
import HeroBanner from './HeroBanner'
import CategoryRow from './CategoryRow'
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi'

export default function HomePage({ onPlay, onInfo }) {
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
      <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--bg-primary)', minHeight: '100dvh' }}>
        <div style={{
          height: 'clamp(250px, 42vh, 380px)', minHeight: 250,
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
              {[1, 2, 3, 4, 5, 6].map(j => (
                <div key={j} className="shimmer" style={{
                  flex: '0 0 clamp(100px, 28vw, 140px)', aspectRatio: '2/3', borderRadius: 10,
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
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
      <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh' }}>
      <HeroBanner movies={data?.hero} onPlay={onPlay} onInfo={onInfo} />

      <div style={{ marginTop: -50, position: 'relative', zIndex: 2, paddingBottom: 40 }}>
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
