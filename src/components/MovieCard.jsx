import { memo, useState } from 'react'
import { HiPlay } from 'react-icons/hi'

const MovieCard = memo(({ movie, onPlay, onInfo }) => {
  const [imgErr, setImgErr] = useState(false)
  const imgSrc = !imgErr && (movie.poster || movie.backdrop)

  return (
    <div
      onClick={() => onInfo?.(movie)}
      className="media-card"
      style={{
        flex: '0 0 auto',
        width: 'clamp(110px, 30vw, 160px)',
        cursor: 'pointer',
      }}
    >
      <div className="card-img-wrap">
        {imgSrc ? (
          <img
            src={imgSrc} alt={movie.title} loading="lazy"
            onError={() => setImgErr(true)}
            className="card-img"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', padding: 8,
          }}>{movie.title}</div>
        )}

        {/* Hover overlay */}
        <div className="card-overlay">
          <button
            onClick={e => { e.stopPropagation(); onPlay?.(movie) }}
            className="play-btn"
          >
            <HiPlay size={20} color="white" style={{ marginLeft: 2 }} />
          </button>
        </div>

        {/* Rating badge */}
        {movie.rating && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            padding: '2px 6px', borderRadius: 5, fontSize: 10, fontWeight: 700,
            background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(8px)',
            color: '#f5c518',
            zIndex: 3,
          }}>★ {movie.rating}</div>
        )}

        {/* TV badge */}
        {movie.type === 'tv' && (
          <div style={{
            position: 'absolute', top: 6, left: 6,
            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
            background: 'rgba(59,130,246,0.85)', color: 'white',
            zIndex: 3,
          }}>TV</div>
        )}

        {/* Content rating badge (PG-13, R, etc.) */}
        {movie.adult && (
          <div style={{
            position: 'absolute', top: 6, left: movie.type === 'tv' ? 30 : 6,
            padding: '2px 5px', borderRadius: 3, fontSize: 8, fontWeight: 700,
            background: 'rgba(239,68,68,0.85)', color: 'white',
            zIndex: 3,
          }}>18+</div>
        )}

        {/* Episode badge for continue watching */}
        {movie.type === 'tv' && movie.episode && (
          <div style={{
            position: 'absolute', bottom: 24, left: 6,
            padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            color: 'rgba(255,255,255,0.8)',
            zIndex: 3,
          }}>
            S{String(movie.season || 1).padStart(2,'0')}E{String(movie.episode).padStart(2,'0')}
          </div>
        )}

        {/* Progress bar */}
        {movie.progress > 0 && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'rgba(255,255,255,0.15)',
            zIndex: 3,
          }}>
            <div style={{
              height: '100%', width: `${Math.min(movie.progress, 100)}%`,
              background: 'var(--accent)', borderRadius: '0 2px 2px 0',
            }} />
          </div>
        )}
      </div>

      <div style={{ padding: '7px 4px 0' }}>
        <p style={{
          fontSize: 12, fontWeight: 600, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{movie.title}</p>
        {movie.year && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{movie.year}</p>
        )}
      </div>
    </div>
  )
})

MovieCard.displayName = 'MovieCard'
export default MovieCard
