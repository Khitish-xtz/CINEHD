import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react'
import Navbar from './components/Navbar'
import HomePage from './components/HomePage'
import MovieDetail from './components/MovieDetail'
import SeriesDetail from './components/SeriesDetail'
import PlayerModal from './components/PlayerModal'
import SearchModal from './components/SearchModal'
import GenrePage from './components/GenrePage'
import CategoryPage from './components/CategoryPage'
import SeriesPage from './components/SeriesPage'
import WatchlistPage from './components/WatchlistPage'
import HistoryPage from './components/HistoryPage'
import { HiHome, HiFire, HiStar, HiCollection, HiFilm, HiBookmarkAlt, HiClock, HiSearch } from 'react-icons/hi'
import { HiTv } from 'react-icons/hi2'

/* ── Theme Context ── */
export const ThemeContext = createContext()

function getStoredTheme() {
  try { return localStorage.getItem('cinahd_theme') || 'dark' }
  catch { return 'dark' }
}

/* ── Error Boundary ── */
import { Component } from 'react'
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(err) { return { error: err } }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: 40, background: 'var(--bg-primary)',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 380, marginBottom: 24 }}>{this.state.error?.message}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      )
    }
    return this.props.children
  }
}

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',       icon: HiHome       },
  { id: 'series',    label: 'TV',         icon: HiTv         },
  { id: 'trending',  label: 'Trending',   icon: HiFire       },
  { id: 'watchlist', label: 'My List',    icon: HiBookmarkAlt },
  { id: 'genres',    label: 'Explore',    icon: HiCollection },
]

const ALL_NAV_ITEMS = [
  ...NAV_ITEMS,
  { id: 'top-rated', label: 'Top Rated',  icon: HiStar       },
  { id: 'popular',   label: 'Popular',    icon: HiFilm       },
  { id: 'history',   label: 'History',    icon: HiClock      },
]

function Footer() {
  return (
    <footer style={{
      padding: '40px 16px',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-glass)',
      textAlign: 'center',
      fontSize: 12,
      color: 'var(--text-muted)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      marginTop: 'auto',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 14 }}>
        Cina<span style={{ color: 'var(--accent)' }}>HD</span>
      </div>
      <p>CinaHD © 2026 • Powered by TMDB API. All rights reserved.</p>
      <p style={{ maxWidth: 600, fontSize: 11, opacity: 0.7, lineHeight: 1.6 }}>
        Disclaimer: CinaHD does not store any files on its server. All contents are provided by non-affiliated third parties.
      </p>
    </footer>
  )
}

export default function App() {
  const [theme, setTheme] = useState(getStoredTheme)
  const [page, setPage]                     = useState('home')
  const [selectedMedia, setSelectedMedia]   = useState(null)
  const [playingMovie, setPlayingMovie]     = useState(null)
  const [showSearch, setShowSearch]         = useState(false)
  const [isDesktop, setIsDesktop]           = useState(window.innerWidth >= 768)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cinahd_theme', theme)
  }, [theme])

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handlePlay = useCallback((movie) => setPlayingMovie(movie), [])
  const handleInfo = useCallback((media) => setSelectedMedia({ id: media.id, type: media.type || 'movie' }), [])
  const handleCloseDetail = useCallback(() => setSelectedMedia(null), [])
  const navigate = useCallback((p) => setPage(p), [])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e) => {
      // Ignore when typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key) {
        case '/':
        case 's':
          if (!playingMovie && !selectedMedia) {
            e.preventDefault()
            setShowSearch(true)
          }
          break
        case 'Escape':
          if (showSearch) setShowSearch(false)
          else if (playingMovie) setPlayingMovie(null)
          else if (selectedMedia) setSelectedMedia(null)
          break
        case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8':
          if (!playingMovie && !selectedMedia && !showSearch) {
            const idx = parseInt(e.key) - 1
            if (ALL_NAV_ITEMS[idx]) { e.preventDefault(); setPage(ALL_NAV_ITEMS[idx].id) }
          }
          break
        case 'Home':
          if (!playingMovie && !selectedMedia) { e.preventDefault(); setPage('home') }
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSearch, playingMovie, selectedMedia])

  const renderPage = () => {
    switch (page) {
      case 'home':      return <HomePage onPlay={handlePlay} onInfo={handleInfo} />
      case 'series':    return <SeriesPage onPlay={handlePlay} onInfo={handleInfo} />
      case 'genres':    return <GenrePage onPlay={handlePlay} onInfo={handleInfo} />
      case 'trending':  return <CategoryPage category="trending-now"   onPlay={handlePlay} onInfo={handleInfo} />
      case 'top-rated': return <CategoryPage category="top-rated"      onPlay={handlePlay} onInfo={handleInfo} />
      case 'popular':   return <CategoryPage category="popular-movies" onPlay={handlePlay} onInfo={handleInfo} />
      case 'watchlist': return <WatchlistPage onPlay={handlePlay} onInfo={handleInfo} />
      case 'history':   return <HistoryPage onPlay={handlePlay} onInfo={handleInfo} />
      default:          return <HomePage onPlay={handlePlay} onInfo={handleInfo} />
    }
  }

  const hasDetail = !!selectedMedia
  const showChrome = !hasDetail && !playingMovie

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      <ErrorBoundary>
        {isDesktop ? (
          /* ── DESKTOP layout ── */
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {showChrome && (
              <Navbar 
                page={page} 
                onNavigate={navigate} 
                onSearchClick={() => setShowSearch(true)} 
              />
            )}
            <div style={{
              flex: 1,
              minHeight: '100vh',
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ flex: 1 }}>
                {!hasDetail && renderPage()}
              </div>
              {showChrome && <Footer />}
            </div>
          </div>
        ) : (
          /* ── MOBILE layout ── */
          <div style={{
            position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
            background: 'var(--bg-primary)',
          }}>
            <main style={{
              flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
              paddingBottom: showChrome ? 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))' : 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ flex: 1 }}>
                {!hasDetail && renderPage()}
              </div>
              {showChrome && <Footer />}
            </main>

            {/* Mobile bottom nav */}
            {showChrome && (
              <nav className="bottom-nav" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
                height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                background: theme === 'dark' ? 'rgba(9,9,11,0.97)' : 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: `1px solid ${theme === 'dark' ? 'var(--border-glass)' : 'rgba(0,0,0,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                padding: '0 4px',
              }}>
                {NAV_ITEMS.map(item => {
                  const isActive = item.id === page || (item.id === 'genres' && (page === 'top-rated' || page === 'popular' || page === 'history'))
                  return (
                    <button key={item.id} onClick={() => setPage(item.id)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 2, padding: '6px 0', position: 'relative',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      transition: 'color 0.2s ease', flex: 1, minWidth: 0,
                      minHeight: 44,
                    }}>
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>{item.label}</span>
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                          width: 20, height: 2.5, borderRadius: 2, background: 'var(--accent)',
                        }} />
                      )}
                    </button>
                  )
                })}
                {/* Search button */}
                <button onClick={() => setShowSearch(true)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 2, padding: '6px 0', position: 'relative',
                  color: 'var(--text-muted)', transition: 'color 0.2s ease', flex: 1, minWidth: 0,
                  minHeight: 44,
                }}>
                  <HiSearch size={22} strokeWidth={1.8} />
                  <span style={{ fontSize: 10, fontWeight: 400, lineHeight: 1 }}>Search</span>
                </button>
              </nav>
            )}
          </div>
        )}

        {/* Modals — shared between desktop and mobile */}
        {showSearch && (
          <SearchModal
            onClose={() => setShowSearch(false)}
            onPlay={(m) => { setShowSearch(false); handlePlay(m) }}
            onInfo={(m) => { setShowSearch(false); handleInfo(m) }}
          />
        )}

        {selectedMedia?.type === 'tv' && (
          <SeriesDetail
            seriesId={selectedMedia.id}
            onClose={handleCloseDetail}
            onPlay={(m) => { handleCloseDetail(); setTimeout(() => handlePlay(m), 80) }}
            onInfo={(m) => { handleCloseDetail(); setTimeout(() => handleInfo(m), 80) }}
          />
        )}

        {selectedMedia?.type === 'movie' && (
          <MovieDetail
            movieId={selectedMedia.id}
            onClose={handleCloseDetail}
            onPlay={(m) => { handleCloseDetail(); setTimeout(() => handlePlay(m), 80) }}
            onInfo={(m) => { handleCloseDetail(); setTimeout(() => handleInfo(m), 80) }}
          />
        )}

        {playingMovie && (
          <PlayerModal movie={playingMovie} onClose={() => setPlayingMovie(null)} />
        )}
      </ErrorBoundary>
    </ThemeContext.Provider>
  )
}
