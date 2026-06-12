import { useState, useEffect } from 'react'
import { HiTv } from 'react-icons/hi2'
import { HiSearch, HiVolumeUp, HiShieldCheck, HiDesktopComputer } from 'react-icons/hi'
import channelData from '../constants/channels'
import VideoPlayer from './VideoPlayer'

// Helper to get channel-specific HSL colors for ambient backlight glow
const getChannelColors = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return {
    primary: `hsl(${h}, 85%, 55%)`,
    bgGlow: `radial-gradient(circle at center, hsla(${h}, 85%, 55%, 0.12) 0%, transparent 70%)`
  }
}

function ChannelCard({ channel, isActive, onClick }) {
  const [imgErr, setImgErr] = useState(false)
  const initials = channel.name ? channel.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'TV'

  // Get fallback initials background
  const getFallbackBg = (name) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = ['#e50914', '#0055ff', '#fbbf24', '#00a8e1', '#ea580c', '#a855f7', '#22c55e', '#ec4899']
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div
      onClick={onClick}
      className={`livetv-card-new ${isActive ? 'active' : ''}`}
    >
      <div 
        className="livetv-logo" 
        style={{ 
          overflow: 'hidden', 
          background: imgErr || !channel.logo ? getFallbackBg(channel.name) : 'rgba(255,255,255,0.03)', 
          borderRadius: 8,
          width: 42,
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 11,
          color: 'white',
          flexShrink: 0
        }}
      >
        {channel.logo && !imgErr ? (
          <img
            src={channel.logo}
            alt={channel.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          initials
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
          {channel.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ 
            fontSize: 8, 
            color: isActive ? 'white' : 'var(--text-muted)', 
            background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.06)', 
            padding: '1px 5px', 
            borderRadius: 4, 
            fontWeight: 800 
          }}>
            CH {channel.number}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {channel.category}
          </span>
        </div>
      </div>
      {isActive && (
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent)'
        }} />
      )}
    </div>
  )
}

export default function LiveTvPage() {
  const [activeChannel, setActiveChannel] = useState(channelData[0] || null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Dynamically obtain unique categories
  const categories = ['All', ...new Set(channelData.map(ch => ch.category))]

  // Filter list of channels based on search query & category selection
  const filteredChannels = channelData.filter(ch => {
    const matchesCategory = selectedCategory === 'All' || ch.category === selectedCategory
    const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ch.number.includes(searchQuery) ||
                          ch.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Keyboard navigation for channels using Up/Down arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const currentIndex = filteredChannels.findIndex(ch => ch.id === activeChannel?.id)
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % filteredChannels.length
          if (filteredChannels[nextIndex]) {
            handleChannelSelect(filteredChannels[nextIndex])
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const currentIndex = filteredChannels.findIndex(ch => ch.id === activeChannel?.id)
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length
          if (filteredChannels[prevIndex]) {
            handleChannelSelect(filteredChannels[prevIndex])
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeChannel, filteredChannels])

  const handleChannelSelect = (ch) => {
    setActiveChannel(ch)
    // Smooth scroll to top on mobile screens so player is visible
    if (window.innerWidth < 992) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!channelData || channelData.length === 0) {
    return (
      <div className="page-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 40px)', paddingBottom: 60, textAlign: 'center' }}>
        <div className="container">
          <HiTv size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 20, color: 'white' }}>No Channels Available</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Please check back later.</p>
        </div>
      </div>
    )
  }

  const colors = activeChannel ? getChannelColors(activeChannel.name) : { bgGlow: 'none' }

  return (
    <div className="page-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 12px)', paddingBottom: 60, position: 'relative' }}>
      
      {/* Inline styles for local classes */}
      <style>{`
        /* Dual-pane layouts */
        .livetv-container {
          display: flex;
          gap: 24px;
          margin-top: 16px;
        }
        .livetv-main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }
        .livetv-sidebar {
          width: 350px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: rgba(13, 13, 17, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          height: calc(100vh - var(--nav-height) - 100px);
          min-height: 520px;
          position: sticky;
          top: calc(var(--nav-height) + 12px);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 12px 32px 0 rgba(0, 0, 0, 0.4);
          z-index: 5;
        }
        
        /* Sidebar queue scrollable area */
        .livetv-queue-container {
          flex: 1;
          overflow-y: auto;
          margin-top: 12px;
          padding-right: 4px;
        }
        .livetv-queue-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        /* Category chips styling */
        .livetv-cats-scroll {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 4px 2px 10px;
          margin-bottom: 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .livetv-cats-scroll::-webkit-scrollbar {
          display: none;
        }
        
        /* Dynamic premium cards with hover effect */
        .livetv-card-new {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }
        .livetv-card-new::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .livetv-card-new:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }
        .livetv-card-new.active {
          background: rgba(229, 9, 20, 0.08);
          border-color: rgba(229, 9, 20, 0.25);
          box-shadow: 0 0 15px rgba(229, 9, 20, 0.05);
        }
        .livetv-card-new.active::before {
          opacity: 1;
        }
        
        /* Scrollbar styles for the queue */
        .livetv-queue-container::-webkit-scrollbar {
          width: 4px;
        }
        .livetv-queue-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .livetv-queue-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        /* Mobile overrides */
        @media (max-width: 991px) {
          .livetv-container {
            flex-direction: column;
            gap: 16px;
          }
          .livetv-sidebar {
            width: 100%;
            height: auto;
            min-height: auto;
            position: static;
            background: transparent;
            border: none;
            padding: 0;
            box-shadow: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
          .livetv-queue-container {
            overflow-y: visible;
            height: auto;
          }
          .livetv-queue-grid {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 8px !important;
            padding: 4px 2px 16px !important;
            scrollbar-width: none !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .livetv-queue-grid::-webkit-scrollbar {
            display: none !important;
          }
          .livetv-card-new {
            flex: 0 0 180px !important;
            min-width: 180px !important;
            padding: 8px 10px !important;
            gap: 8px !important;
          }
          .livetv-card-new:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Dynamic Ambient Blur Glow behind theater */}
      <div 
        className="livetv-ambient-glow"
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          width: '50%',
          height: '500px',
          backgroundImage: colors.bgGlow,
          filter: 'blur(100px)',
          opacity: 0.65,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'all 0.8s ease'
        }} 
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Main Header (Breadcrumb feel) */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 4,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
            background: 'rgba(229,9,20,0.18)', color: 'var(--accent)',
            border: '1px solid rgba(229,9,20,0.3)', marginBottom: 6,
            textTransform: 'uppercase'
          }}>
            <HiTv size={11} /> Live Stream Hub
          </span>
        </div>

        {/* Dual-Pane Layout Container */}
        <div className="livetv-container">
          
          {/* LEFT PANE: Video Player & Channel Info */}
          <div className="livetv-main-content">
            
            {/* Player Wrapper with Premium Outline & Shadow */}
            {activeChannel ? (
              <div 
                className="livetv-theater" 
                style={{ 
                  margin: 0, 
                  boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px ${activeChannel ? getChannelColors(activeChannel.name).primary + '15' : 'transparent'}`,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: '#000',
                  borderRadius: 16,
                  overflow: 'hidden',
                  aspectRatio: '16/9',
                  width: '100%'
                }}
              >
                <VideoPlayer
                  key={activeChannel.id}
                  url={activeChannel.url}
                  title={activeChannel.name}
                  logo={activeChannel.logo}
                  number={activeChannel.number}
                />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9', width: '100%', background: '#0a0a0f',
                borderRadius: 16, border: '1px dashed rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <p style={{ color: 'var(--text-muted)' }}>Select a channel to begin streaming</p>
              </div>
            )}

            {/* Premium Control Dashboard Panel */}
            {activeChannel && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 14,
                padding: '18px 24px', background: 'rgba(20, 20, 30, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16,
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
              }}>
                
                {/* Dashboard Title Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Active Channel Number Badge */}
                    <div style={{
                      padding: '4px 10px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, #ff5c5c 100%)',
                      borderRadius: 8,
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 12,
                      boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)'
                    }}>
                      CH {activeChannel.number}
                    </div>
                    
                    {/* Pulsating Live indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 10px #ef4444'
                      }} className="live-indicator-pulse" />
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        LIVE
                      </span>
                    </div>
                  </div>
                  
                  {/* Format/Quality Tags */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                      <HiShieldCheck size={12} style={{ color: '#4ade80' }} /> Secure Feed
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                      1080p FHD
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                      <HiVolumeUp size={12} /> Stereo
                    </span>
                  </div>
                </div>

                <hr style={{ border: 'none', height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: 0 }} />

                {/* Metadata Details */}
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>
                    {activeChannel.name}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, lineHeight: 1.5, margin: '4px 0 0' }}>
                    Currently streaming {activeChannel.category} coverage. Press Arrow keys <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>↑</kbd> or <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>↓</kbd> to change channels instantly.
                  </p>
                </div>
                
                {/* Keyboard tip bar (only on desktop) */}
                <div className="keyboard-shortcut-tip" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.04)', marginTop: 2
                }}>
                  <HiDesktopComputer size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <strong>Quick Tip:</strong> Use the browser's Up/Down arrows to zapp through channels.
                  </span>
                </div>
                <style>{`
                  @media (max-width: 991px) {
                    .keyboard-shortcut-tip { display: none !important; }
                  }
                `}</style>

              </div>
            )}
          </div>

          {/* RIGHT PANE: Channels Queue Sidebar */}
          <div className="livetv-sidebar">
            
            {/* Sidebar title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <HiTv size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', margin: 0 }}>Channel Guide</h3>
            </div>

            {/* Queue Search Input */}
            <div style={{ position: 'relative', width: '100%', marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search guide by name or number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingLeft: 34,
                  borderRadius: 10,
                  fontSize: 12.5,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
              />
              <HiSearch size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none'
              }} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 12, padding: 2
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category horizontal scrolling bar */}
            <div className="livetv-cats-scroll">
              {categories.map(cat => {
                const isCatActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: isCatActive ? 'linear-gradient(135deg, var(--accent) 0%, #ff5c5c 100%)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCatActive ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                      color: isCatActive ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      boxShadow: isCatActive ? '0 4px 10px rgba(229, 9, 20, 0.2)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* Queue channels count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {selectedCategory === 'All' ? 'ALL FEEDS' : selectedCategory.toUpperCase()}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {filteredChannels.length} CHANNELS
              </span>
            </div>

            {/* Queue Channels scrollable list */}
            <div className="livetv-queue-container">
              {filteredChannels.length > 0 ? (
                <div className="livetv-queue-grid">
                  {filteredChannels.map(ch => (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      isActive={activeChannel && activeChannel.id === ch.id}
                      onClick={() => handleChannelSelect(ch)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '30px 16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)',
                  borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)'
                }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
                    No channels match your query.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
