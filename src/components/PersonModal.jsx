import { useState, useEffect } from 'react'
import { HiX, HiStar, HiCalendar, HiUser, HiFilm } from 'react-icons/hi'

export default function PersonModal({ personId, onClose, onMediaClick }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!personId) return
    setLoading(true)
    setError(null)
    fetch(`/api/person/${personId}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load actor profile')
        return r.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [personId])

  useEffect(() => {
    // Lock background scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!personId) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(5,5,8,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div 
        className="modal-animate-scale"
        style={{
          width: '100%', maxWidth: 650,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'min(780px, 90vh)',
        }}
      >
        {/* Top Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Actor Profile</h2>
          <button 
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <HiX size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
          {loading && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '2.5px solid var(--border-glass)', borderTopColor: 'var(--accent)',
                margin: '0 auto 12px', animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: 13 }}>Fetching actor details...</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 4 }}>Failed to load profile</p>
              <p style={{ fontSize: 12 }}>{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Profile Block */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                {/* Photo */}
                <div style={{
                  width: 120, height: 160, borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', background: 'var(--bg-card)', flexShrink: 0,
                  border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-sm)'
                }}>
                  {data.profile ? (
                    <img src={data.profile} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--text-muted)' }}>
                      <HiUser />
                    </div>
                  )}
                </div>

                {/* Details text */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'white', letterSpacing: '-0.02em' }}>
                    {data.name}
                  </h1>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {data.knownFor && (
                      <p>
                        <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>Department:</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.knownFor}</span>
                      </p>
                    )}
                    {data.birthday && (
                      <p>
                        <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>Born:</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.birthday}</span>
                      </p>
                    )}
                    {data.placeOfBirth && (
                      <p>
                        <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>Birth Place:</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.placeOfBirth}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Biography</h3>
                <p className="cast-biography">{data.biography}</p>
              </div>

              {/* Known For / Filmography */}
              {data.filmography?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Known For</h3>
                  
                  <div style={{ 
                    display: 'flex', gap: 10, overflowX: 'auto', 
                    paddingBottom: 8, scrollbarWidth: 'none' 
                  }}>
                    {data.filmography.map(m => (
                      <div 
                        key={`${m.type}-${m.id}`}
                        onClick={() => { onMediaClick(m); onClose() }}
                        style={{ 
                          flex: '0 0 94px', width: 94, cursor: 'pointer',
                          transition: 'transform 0.2s', position: 'relative'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {/* Poster */}
                        <div style={{
                          width: '100%', aspectRatio: '2/3', borderRadius: 8,
                          overflow: 'hidden', background: 'var(--bg-card)',
                          border: '1px solid var(--border-glass)', marginBottom: 4,
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          {m.poster ? (
                            <img src={m.poster} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <HiFilm size={24} />
                            </div>
                          )}
                        </div>
                        {/* Rating overlay if any */}
                        {m.rating && (
                          <div style={{
                            position: 'absolute', top: 4, right: 4,
                            padding: '1px 4px', borderRadius: 4, fontSize: 8, fontWeight: 800,
                            background: 'rgba(0,0,0,0.8)', color: '#f5c518',
                            display: 'flex', alignItems: 'center', gap: 1
                          }}>
                            <HiStar size={8} /> {m.rating}
                          </div>
                        )}
                        <p style={{ 
                          fontSize: 10, fontWeight: 600, color: 'white',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {m.title}
                        </p>
                        <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                          {m.year || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
