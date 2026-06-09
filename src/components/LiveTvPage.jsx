import { useState } from 'react'
import { HiTv } from 'react-icons/hi2'

const CHANNELS = [
  {
    id: 'aajtak',
    name: 'Aaj Tak',
    desc: 'Hindi News Channel',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCtB8jaih_coo_y48otn7-yA&autoplay=1&mute=1',
    color: '#e50914',
    logoText: 'AT'
  },
  {
    id: 'ndtv',
    name: 'NDTV India',
    desc: 'Hindi News & Analysis',
    url: 'https://www.youtube.com/embed/live_stream?channel=UC8J31r4914f7T_GfHek8GzA&autoplay=1&mute=1',
    color: '#0055ff',
    logoText: 'NDTV'
  },
  {
    id: 'abp',
    name: 'ABP News',
    desc: 'Hindi Live Broadcast',
    url: 'https://www.youtube.com/embed/live_stream?channel=UC1w8p9n58yN4kig1G-z7d0A&autoplay=1&mute=1',
    color: '#fbbf24',
    logoText: 'ABP'
  },
  {
    id: 'dw',
    name: 'DW News',
    desc: 'English International News',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1gqcb7OJYBJA&autoplay=1&mute=1',
    color: '#00a8e1',
    logoText: 'DW'
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    desc: 'Global English News',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJjfcUXw&autoplay=1&mute=1',
    color: '#ea580c',
    logoText: 'AJE'
  },
  {
    id: 'indiatoday',
    name: 'India Today',
    desc: 'English News Channel',
    url: 'https://www.youtube.com/embed/live_stream?channel=UCzH_6N0ifz0N31pX2u0B9bQ&autoplay=1&mute=1',
    color: '#a855f7',
    logoText: 'IT'
  }
]

export default function LiveTvPage() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0])

  return (
    <div className="page-fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 12px)', paddingBottom: 60 }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 4,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
            background: 'rgba(229,9,20,0.2)', color: 'var(--accent)',
            border: '1px solid rgba(229,9,20,0.35)', marginBottom: 8,
            textTransform: 'uppercase'
          }}>
            <HiTv size={11} /> Live Stream
          </span>
          <h1 className="section-title" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            Live TV Channels
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Enjoy free-to-air Indian and Global networks streaming live 24/7.
          </p>
        </div>

        {/* Theater Player */}
        <div className="livetv-theater">
          <iframe
            key={activeChannel.id}
            src={activeChannel.url}
            title={activeChannel.name}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>

        {/* Currently playing header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glass)', borderRadius: 12,
          marginBottom: 24, backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 10px var(--accent)'
          }} />
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NOW STREAMING</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', marginTop: 1 }}>{activeChannel.name} — <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{activeChannel.desc}</span></h3>
          </div>
        </div>

        {/* Channels Grid */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Select Channel</h2>
        <div className="livetv-channels-grid">
          {CHANNELS.map(ch => {
            const isActive = activeChannel.id === ch.id
            return (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`livetv-card ${isActive ? 'active' : ''}`}
              >
                <div className="livetv-logo" style={{ background: ch.color }}>
                  {ch.logoText}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ch.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ch.desc}
                  </p>
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
          })}
        </div>

      </div>
    </div>
  )
}
