import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ url, title, logo, number }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !url) return

    setLoading(true)
    setError(null)

    let hls = hlsRef.current
    if (hls) {
      hls.destroy()
      hls = null
    }

    let finalUrl = url
    if (url.startsWith('/api/zee5/play/')) {
      finalUrl = url.replace('/play/', '/redirect/')
    } else if (url.startsWith('zee5:')) {
      const id = url.split(':')[1]
      finalUrl = `/api/zee5/redirect/${id}`
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        manifestLoadingMaxRetry: 5,
        manifestLoadingRetryDelay: 1000,
      })
      hlsRef.current = hls

      hls.loadSource(finalUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false)
        video.play().catch(() => {
          // Auto-play might be blocked by browser policy (needs user gesture or mute)
          video.muted = true
          video.play().catch(err => console.log('Autoplay blocked:', err))
        })
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              console.log('Fatal network error encountered, trying to recover...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, trying to recover...')
              hls.recoverMediaError()
              break
            default:
              // Cannot recover
              setError('Stream playback failed. This link might be temporarily offline or restricted by CORS/Geo-block.')
              setLoading(false)
              hls.destroy()
              break
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native support (Safari, iOS)
      video.src = finalUrl
      video.addEventListener('loadedmetadata', () => {
        setLoading(false)
        video.play().catch(() => {
          video.muted = true
          video.play().catch(err => console.log('Autoplay blocked:', err))
        })
      })
      video.addEventListener('error', () => {
        setError('Stream playback failed. This link might be temporarily offline.')
        setLoading(false)
      })
    } else {
      setError('Your browser does not support HLS streaming.')
      setLoading(false)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [url])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    const video = videoRef.current
    if (video) {
      let finalUrl = url
      if (url.startsWith('/api/zee5/play/')) {
        finalUrl = url.replace('/play/', '/redirect/')
      } else if (url.startsWith('zee5:')) {
        const id = url.split(':')[1]
        finalUrl = `/api/zee5/redirect/${id}`
      }

      if (hlsRef.current) {
        hlsRef.current.loadSource(finalUrl)
        hlsRef.current.startLoad()
      } else {
        video.src = finalUrl
        video.load()
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: 'inherit', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        controls
        playsInline
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
      />
      
      {/* Loading overlay */}
      {loading && !error && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, zIndex: 10
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Connecting to live feed...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(5, 5, 8, 0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center', gap: 16, zIndex: 10
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ maxWidth: 450 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Playback Error</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>{error}</p>
          </div>
          <button
            onClick={handleRetry}
            style={{
              padding: '8px 20px', borderRadius: 20, background: 'var(--accent)',
              border: 'none', color: 'white', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Try Reconnecting
          </button>
        </div>
      )}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
