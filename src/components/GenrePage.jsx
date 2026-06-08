import { useState, useEffect } from 'react'
import MovieCard from './MovieCard'

export default function GenrePage({ onPlay, onInfo }) {
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch('/api/genres').then(r => r.json()).then(setGenres)
  }, [])

  useEffect(() => {
    if (!selectedGenre) return
    setPage(1)
    fetch(`/api/genre/${selectedGenre}?page=1`)
      .then(r => r.json())
      .then(d => { setMovies(d.results || []); setTotalPages(d.totalPages || 1) })
  }, [selectedGenre])

  useEffect(() => {
    if (!selectedGenre || page === 1) return
    fetch(`/api/genre/${selectedGenre}?page=${page}`)
      .then(r => r.json())
      .then(d => setMovies(prev => [...prev, ...(d.results || [])]))
  }, [page, selectedGenre])

  if (!genres.length) {
    return (
      <div style={{ paddingTop: 'calc(var(--nav-height) + 16px)', paddingLeft: 16, paddingRight: 16, paddingBottom: 16, textAlign: 'center', color: 'var(--text-muted)', minHeight: '100dvh' }}>
        Loading...
      </div>
    )
  }

  return (
      <div style={{ paddingTop: 'calc(var(--nav-height) + 12px)' }}>
      <div className="container" style={{ padding: '0 clamp(12px, 3vw, 24px)' }}>
        <h1 className="section-title" style={{ marginBottom: 16 }}>Browse by Genre</h1>
        <div className="server-chips-scroll" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          {genres.map(g => (
            <button key={g.id} onClick={() => setSelectedGenre(g.id)}
              className={`server-chip ${selectedGenre === g.id ? 'active' : ''}`}>
              {g.name}
            </button>
          ))}
        </div>

        {!selectedGenre && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 13 }}>
            Select a genre to browse movies
          </p>
        )}

        {selectedGenre && (
          <>
            <div className="mobile-grid">
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onPlay={onPlay} onInfo={onInfo} />
              ))}
            </div>
            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button className="btn-secondary" onClick={() => setPage(p => p + 1)}>Load More</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
