import { useState } from 'react'
import { HiPlay, HiInformationCircle, HiStar } from 'react-icons/hi'

export default function SeriesCard({ series, onPlay, onInfo }) {
  const [imgErr, setImgErr] = useState(false)

  const handlePlay = (e) => {
    e.stopPropagation()
    onPlay?.({ ...series, type: 'tv', season: series.season || 1, episode: series.episode || 1 })
  }

  return (
    <div
      onClick={() => onInfo?.({ ...series, type: 'tv' })}
      className="media-card"
      style={{
        flex: '0 0 auto',
        width: 'clamp(110px, 30vw, 150px)',
        cursor: 'pointer',
      }}
    >
      <div className="card-img-wrap">
        {!imgErr && series.poster ? (
          <img
            src={series.poster} alt={series.title} loading="lazy"
            onError={() => setImgErr(true)}
            className="card-img"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 11, padding: 8, textAlign: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 24 }}>📺</span>{series.title}
          </div>
        )}

        {/* Hover overlay */}
        <div className="card-overlay" style={{ gap: 8 }}>
          <button 
            onClick={handlePlay} 
            title="Watch" 
            className="play-btn"
          >
            <HiPlay size={20} color="white" style={{ marginLeft: 2 }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onInfo?.({ ...series, type: 'tv' }) }}
            title="More info" 
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'transform 0.25s var(--ease-spring), background-color var(--transition)',
              transform: 'scale(0.85)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.transform = 'scale(0.85)'
            }}
          >
            <HiInformationCircle size={18} color="white" />
          </button>
        </div>

        {/* Rating */}
        {series.rating && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: 'rgba(229,9,20,0.88)', color: 'white',
            zIndex: 3,
          }}>
            <HiStar size={9} /> {series.rating}
          </div>
        )}

        {/* TV badge */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
          background: 'rgba(59,130,246,0.88)', color: 'white',
          zIndex: 3,
        }}>SERIES</div>

        {/* Episode badge for continue watching */}
        {series.episode && (
          <div style={{
            position: 'absolute', bottom: 24, left: 6,
            padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            color: 'rgba(255,255,255,0.8)',
            zIndex: 3,
          }}>
            S{String(series.season || 1).padStart(2,'0')}E{String(series.episode).padStart(2,'0')}
          </div>
        )}

        {/* Content rating */}
        {series.adult && (
          <div style={{
            position: 'absolute', top: 6, left: 52,
            padding: '2px 5px', borderRadius: 3, fontSize: 8, fontWeight: 700,
            background: 'rgba(239,68,68,0.85)', color: 'white',
            zIndex: 3,
          }}>18+</div>
        )}
      </div>

      <div style={{ padding: '7px 4px 0' }}>
        <p style={{
          fontSize: 12, fontWeight: 600, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{series.title}</p>
        {series.year && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{series.year}</p>
        )}
      </div>
    </div>
  )
}
