import { useContext } from 'react'
import { HiHome, HiFire, HiStar, HiCollection, HiFilm, HiBookmarkAlt, HiClock, HiSun, HiMoon } from 'react-icons/hi'
import { HiTv } from 'react-icons/hi2'
import { ThemeContext } from '../App'

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',       icon: HiHome       },
  { id: 'series',    label: 'TV Series',  icon: HiTv         },
  { id: 'trending',  label: 'Trending',   icon: HiFire       },
  { id: 'genres',    label: 'Genres',     icon: HiCollection },
  { id: 'top-rated', label: 'Top Rated',  icon: HiStar       },
  { id: 'popular',   label: 'Popular',    icon: HiFilm       },
  { id: 'watchlist', label: 'My List',    icon: HiBookmarkAlt },
  { id: 'history',   label: 'History',    icon: HiClock      },
]

export default function Sidebar({ page, onNavigate }) {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-width)', zIndex: 80,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px', marginBottom: 28 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px',
          boxShadow: '0 0 20px rgba(229,9,20,0.4)',
          flexShrink: 0,
        }}>C</div>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
          Cina<span style={{ color: 'var(--accent)' }}>HD</span>
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 14px', borderRadius: 10,
              fontSize: 13, fontWeight: active ? 600 : 400,
              background: active ? 'var(--accent-soft)' : 'transparent',
              color: active ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.18s ease',
              textAlign: 'left', width: '100%',
              borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
            }}>
              <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px', borderRadius: 10, width: '100%',
        fontSize: 13, color: 'var(--text-secondary)',
        marginBottom: 4,
      }}>
        {theme === 'dark' ? <HiSun size={17} /> : <HiMoon size={17} />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Footer */}
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
        fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>CinaHD OTT</p>
        <p>Watch movies & series in Hindi</p>
        <p style={{ marginTop: 4, fontSize: 10, opacity: 0.6 }}>Press / to search · 1-8 for nav</p>
      </div>
    </aside>
  )
}
