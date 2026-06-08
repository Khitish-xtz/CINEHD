import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

if (!TMDB_KEY) {
  console.error('\x1b[31m✖ TMDB_API_KEY missing in .env\x1b[0m');
  console.error('\x1b[33m  → Create a free API key at https://www.themoviedb.org/settings/api\x1b[0m');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 150 });
app.use('/api/', limiter);

const tmdbFetch = async (endpoint, params = {}) => {
  const { data } = await axios.get(`${TMDB_BASE}${endpoint}`, {
    params: { api_key: TMDB_KEY, language: 'en-US', ...params },
    timeout: 8000,
  });
  return data;
};

/* ── Movie formatters ── */
const formatMovie = (m) => ({
  id: m.id,
  title: m.title,
  overview: m.overview,
  poster: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : null,
  backdrop: m.backdrop_path ? `${TMDB_IMG}/w1280${m.backdrop_path}` : null,
  rating: m.vote_average ? m.vote_average.toFixed(1) : null,
  year: m.release_date?.slice(0, 4) || null,
  genres: m.genre_ids || [],
  type: 'movie',
});

/* ── TV/Series formatters ── */
const formatShow = (s) => ({
  id: s.id,
  title: s.name,
  overview: s.overview,
  poster: s.poster_path ? `${TMDB_IMG}/w500${s.poster_path}` : null,
  backdrop: s.backdrop_path ? `${TMDB_IMG}/w1280${s.backdrop_path}` : null,
  rating: s.vote_average ? s.vote_average.toFixed(1) : null,
  year: s.first_air_date?.slice(0, 4) || null,
  genres: s.genre_ids || [],
  type: 'tv',
});

/* ════════════════════════════════════════════
   MOVIE ROUTES
════════════════════════════════════════════ */
app.get('/api/trending', async (_, res) => {
  try {
    const data = await tmdbFetch('/trending/movie/week');
    res.json({ results: data.results.slice(0, 20).map(formatMovie) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/popular', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/popular', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatMovie), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/top-rated', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/top_rated', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatMovie), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/upcoming', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/upcoming', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatMovie), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/now-playing', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/now_playing', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatMovie), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/genres', async (_, res) => {
  try {
    const data = await tmdbFetch('/genre/movie/list');
    res.json(data.genres);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/genre/:id', async (req, res) => {
  try {
    const data = await tmdbFetch('/discover/movie', {
      with_genres: req.params.id,
      sort_by: 'popularity.desc',
      page: req.query.page || 1,
    });
    res.json({ results: data.results.map(formatMovie), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ results: [] });
    // Multi-search: movies + TV together
    const [movies, shows] = await Promise.all([
      tmdbFetch('/search/movie', { query: q, page: req.query.page || 1 }),
      tmdbFetch('/search/tv', { query: q, page: req.query.page || 1 }),
    ]);
    const combined = [
      ...movies.results.map(formatMovie),
      ...shows.results.map(formatShow),
    ].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    res.json({ results: combined, totalPages: Math.max(movies.total_pages, shows.total_pages) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/movie/:id', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}`, {
      append_to_response: 'videos,credits,similar',
    });
    res.json({
      id: data.id,
      title: data.title,
      overview: data.overview,
      poster: data.poster_path ? `${TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null,
      rating: data.vote_average ? data.vote_average.toFixed(1) : null,
      year: data.release_date?.slice(0, 4) || null,
      runtime: data.runtime || null,
      genres: data.genres?.map(g => ({ id: g.id, name: g.name })) || [],
      releaseDate: data.release_date || null,
      tagline: data.tagline || null,
      trailer: data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
      cast: (data.credits?.cast || []).slice(0, 12).map(a => ({
        id: a.id,
        name: a.name,
        character: a.character,
        profile: a.profile_path ? `${TMDB_IMG}/w185${a.profile_path}` : null,
      })),
      director: (data.credits?.crew || []).find(c => c.job === 'Director')?.name || null,
      similar: (data.similar?.results || []).slice(0, 8).map(formatMovie),
      type: 'movie',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════
   TV / SERIES ROUTES
════════════════════════════════════════════ */
app.get('/api/tv/trending', async (req, res) => {
  try {
    const data = await tmdbFetch('/trending/tv/week', { page: req.query.page || 1 });
    res.json({ results: data.results.slice(0, 20).map(formatShow), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tv/popular', async (req, res) => {
  try {
    const data = await tmdbFetch('/tv/popular', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatShow), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tv/top-rated', async (req, res) => {
  try {
    const data = await tmdbFetch('/tv/top_rated', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatShow), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tv/on-air', async (req, res) => {
  try {
    const data = await tmdbFetch('/tv/on_the_air', { page: req.query.page || 1 });
    res.json({ results: data.results.map(formatShow), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tv/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ results: [] });
    const data = await tmdbFetch('/search/tv', { query: q, page: req.query.page || 1 });
    res.json({ results: data.results.map(formatShow), totalPages: data.total_pages });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tv/:id', async (req, res) => {
  try {
    const data = await tmdbFetch(`/tv/${req.params.id}`, {
      append_to_response: 'videos,credits,similar',
    });
    res.json({
      id: data.id,
      title: data.name,
      overview: data.overview,
      poster: data.poster_path ? `${TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null,
      rating: data.vote_average ? data.vote_average.toFixed(1) : null,
      year: data.first_air_date?.slice(0, 4) || null,
      genres: data.genres?.map(g => ({ id: g.id, name: g.name })) || [],
      tagline: data.tagline || null,
      status: data.status || null,
      seasons: (data.seasons || [])
        .filter(s => s.season_number > 0)
        .map(s => ({
          id: s.id,
          number: s.season_number,
          name: s.name,
          episodeCount: s.episode_count,
          poster: s.poster_path ? `${TMDB_IMG}/w300${s.poster_path}` : null,
          airDate: s.air_date,
        })),
      cast: (data.credits?.cast || []).slice(0, 12).map(a => ({
        id: a.id,
        name: a.name,
        character: a.character,
        profile: a.profile_path ? `${TMDB_IMG}/w185${a.profile_path}` : null,
      })),
      similar: (data.similar?.results || []).slice(0, 8).map(formatShow),
      trailer: data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
      type: 'tv',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/tv/:id/season/:season', async (req, res) => {
  try {
    const data = await tmdbFetch(`/tv/${req.params.id}/season/${req.params.season}`);
    res.json({
      seasonNumber: data.season_number,
      name: data.name,
      overview: data.overview,
      episodes: (data.episodes || []).map(ep => ({
        id: ep.id,
        number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still: ep.still_path ? `${TMDB_IMG}/w300${ep.still_path}` : null,
        runtime: ep.runtime,
        airDate: ep.air_date,
        rating: ep.vote_average ? ep.vote_average.toFixed(1) : null,
      })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════
   HOME (Movies + TV)
════════════════════════════════════════════ */
app.get('/api/home', async (_, res) => {
  try {
    const [trending, popular, topRated, upcoming, nowPlaying, genres, tvTrending, tvPopular] = await Promise.all([
      tmdbFetch('/trending/movie/week'),
      tmdbFetch('/movie/popular'),
      tmdbFetch('/movie/top_rated'),
      tmdbFetch('/movie/upcoming'),
      tmdbFetch('/movie/now_playing'),
      tmdbFetch('/genre/movie/list'),
      tmdbFetch('/trending/tv/week'),
      tmdbFetch('/tv/popular'),
    ]);
    res.json({
      hero: trending.results.slice(0, 6).map(m => ({
        ...formatMovie(m),
        backdrop: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : null,
      })),
      sections: [
        { id: 'trending', title: '🔥 Trending Now', movies: trending.results.slice(0, 20).map(formatMovie) },
        { id: 'tv-trending', title: '📺 Trending Series', movies: tvTrending.results.slice(0, 20).map(formatShow) },
        { id: 'popular', title: '🎬 Popular Movies', movies: popular.results.slice(0, 20).map(formatMovie) },
        { id: 'tv-popular', title: '🌟 Popular Series', movies: tvPopular.results.slice(0, 20).map(formatShow) },
        { id: 'top-rated', title: '⭐ Top Rated Movies', movies: topRated.results.slice(0, 20).map(formatMovie) },
        { id: 'upcoming', title: '🗓 Coming Soon', movies: upcoming.results.slice(0, 20).map(formatMovie) },
        { id: 'now-playing', title: '🎭 Now Playing', movies: nowPlaying.results.slice(0, 20).map(formatMovie) },
      ],
      genres: genres.genres,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from the Vite build directory in production
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback for Single Page Application (SPA) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const start = async () => {
  try {
    await axios.get(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}`, { timeout: 5000 });
    console.log(`\x1b[32m🎬 CinaHD Server\x1b[0m \x1b[33m→\x1b[0m http://localhost:${PORT}`);
    console.log(`\x1b[32m   TMDB API\x1b[0m \x1b[33m→\x1b[0m \x1b[32m✓ Connected\x1b[0m`);
  } catch {
    console.log(`\x1b[32m🎬 CinaHD Server\x1b[0m \x1b[33m→\x1b[0m http://localhost:${PORT}`);
    console.log(`\x1b[31m   TMDB API\x1b[0m \x1b[33m→\x1b[0m \x1b[31m✖ Invalid API key\x1b[0m`);
    console.log(`\x1b[33m   → Get a free key at https://www.themoviedb.org/settings/api\x1b[0m`);
    console.log(`\x1b[33m   → Then update TMDB_API_KEY in .env\x1b[0m`);
  }
};

app.listen(PORT, start);
