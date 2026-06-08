import { useState, useEffect } from 'react'
import { HiTrash, HiPlay } from 'react-icons/hi'
import MovieCard from './MovieCard'
import SeriesCard from './SeriesCard'

export default function WatchlistPage({ onPlay, onInfo }) {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('cinahd_watchlist') || '[]'))
    } catch { setItems([]) }
  }, [])

  const clearAll = () => {
    localStorage.removeItem('cinahd_watchlist')
    setItems([])
  }

  const filtered = filter === 'all' ? items
    : items.filter(i => i.type === filter)

  const movies = filtered.filter(i => i.type !== 'tv')
  const shows = filtered.filter(i => i.type === 'tv')

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 12px)' }}>
      <div className="container" style={{ padding: '0 clamp(12px, 3vw, 24px)' }}>
        <div className="list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title">My List</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {items.length} {items.length === 1 ? 'title' : 'titles'} saved
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

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {['all', 'movie', 'tv'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`server-chip ${filter === f ? 'active' : ''}`}>
              {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Series'}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px', color: 'var(--text-muted)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28,
            }}>+</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Your list is empty</p>
            <p style={{ fontSize: 13 }}>Add movies and series to your list to watch later</p>
          </div>
        ) : (
          <>
            {movies.length > 0 && (
              <div className="mobile-grid" style={{ marginBottom: 28 }}>
                {movies.map(m => <MovieCard key={m.id} movie={m} onPlay={onPlay} onInfo={onInfo} />)}
              </div>
            )}
            {shows.length > 0 && (
              <div className="mobile-grid">
                {shows.map(s => <SeriesCard key={s.id} series={s} onPlay={onPlay} onInfo={onInfo} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
