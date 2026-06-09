import { useState, useEffect } from 'react'
import { HiTrash, HiClock } from 'react-icons/hi'
import MovieCard from './MovieCard'
import SeriesCard from './SeriesCard'

export default function HistoryPage({ onPlay, onInfo }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const load = () => {
      try {
        setItems(JSON.parse(localStorage.getItem('cinahd_history') || '[]'))
      } catch { setItems([]) }
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  const clearAll = () => {
    localStorage.removeItem('cinahd_history')
    setItems([])
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 12px)' }}>
      <div className="container" style={{ padding: '0 clamp(12px, 3vw, 24px)' }}>
        <div className="list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title">Watch History</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {items.length} {items.length === 1 ? 'title' : 'titles'} watched
            </p>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
            }}>
              <HiTrash size={14} /> Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--text-muted)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: 'var(--text-muted)'
            }}>
              <HiClock size={28} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>No watch history</p>
            <p style={{ fontSize: 13 }}>Start watching to build your history</p>
          </div>
        ) : (
          <div className="mobile-grid">
            {items.map(item => (
              item.type === 'tv' ? (
                <SeriesCard key={`${item.id}-${item.season}-${item.episode}`} series={item} onPlay={onPlay} onInfo={onInfo} />
              ) : (
                <MovieCard key={item.id} movie={item} onPlay={onPlay} onInfo={onInfo} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
