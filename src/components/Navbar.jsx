import { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../App'
import { HiSearch, HiSun, HiMoon } from 'react-icons/hi'

const NAV_LINKS = [
  { id: 'home',      label: 'Home' },
  { id: 'series',    label: 'TV Series' },
  { id: 'trending',  label: 'Trending' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'live-tv',   label: 'Live TV' },
  { id: 'genres',    label: 'Genres' },
  { id: 'watchlist', label: 'My List' },
  { id: 'history',   label: 'History' },
]

export default function Navbar({ page, onNavigate, onSearchClick }) {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      zIndex: 100,
      background: scrolled
        ? (theme === 'dark' ? 'rgba(5, 5, 8, 0.88)' : 'rgba(255, 255, 255, 0.88)')
        : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled
        ? `1px solid ${theme === 'dark' ? 'var(--border-glass)' : 'rgba(0,0,0,0.08)'}`
        : '1px solid transparent',
      boxShadow: scrolled ? '0 8px 32px rgba(0, 0, 0, 0.25)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 48px)',
      transition: 'background-color 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
    }}>
      {/* Left section: Logo & Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {/* Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: '-0.5px',
            boxShadow: 'var(--shadow-glow)',
            color: 'white',
          }}>
            C
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            Cina<span style={{ color: 'var(--accent)' }}>HD</span>
          </span>
        </div>

        {/* Desktop Links (hidden on mobile, managed by CSS / component check) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {NAV_LINKS.map(link => {
            const active = page === link.id
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  transition: 'all var(--transition)',
                  border: '1px solid transparent',
                }}
                className={active ? 'nav-link-active' : 'nav-link-item'}
              >
                {link.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right section: Search & Theme & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search Input trigger */}
        <button
          onClick={onSearchClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            fontSize: 12,
            transition: 'all var(--transition)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-glass-hover)'
            e.currentTarget.style.background = 'var(--bg-glass-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-glass)'
            e.currentTarget.style.background = 'var(--bg-glass)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <HiSearch size={15} />
          <span>Search...</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-glass-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-glass)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {theme === 'dark' ? <HiSun size={16} /> : <HiMoon size={16} />}
        </button>

        {/* Profile Avatar (Placeholder) */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          border: '2px solid var(--bg-card)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }} />
      </div>
    </header>
  )
}
