import { useState, useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export default function TrailerModal({ videoKey, title, onClose }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!videoKey) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px env(safe-area-inset-right) 16px env(safe-area-inset-left)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 900,
          aspectRatio: '16/9', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-card)', zIndex: 1,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.75s linear infinite',
            }} />
          </div>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
          title={title || 'Trailer'}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%', height: '100%', border: 'none',
            opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease',
          }}
        />
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', transition: 'all 0.2s ease',
          }}
        >
          <HiX size={18} />
        </button>
      </div>

    </div>
  )
}
