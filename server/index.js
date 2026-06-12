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
  originalLanguage: m.original_language || null,
  type: 'movie',
  popularity: m.popularity || 0,
  voteCount: m.vote_count || 0,
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
  originalLanguage: s.original_language || null,
  type: 'tv',
  popularity: s.popularity || 0,
  voteCount: s.vote_count || 0,
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

const getSearchScore = (item, query) => {
  const title = (item.title || '').toLowerCase().trim();
  const cleanQ = query.toLowerCase().trim();
  let score = 0;

  if (title === cleanQ) {
    score += 100000;
  } else if (title.startsWith(cleanQ)) {
    score += 50000;
  } else if (title.includes(cleanQ)) {
    score += 10000;
  }

  // Word-level matches
  const qWords = cleanQ.split(/\s+/).filter(Boolean);
  const titleWords = title.split(/\s+/).filter(Boolean);
  if (qWords.length > 1) {
    const containsAllWords = qWords.every(qw => titleWords.some(tw => tw.includes(qw)));
    if (containsAllWords && score === 0) {
      score += 5000;
    }
  }

  // Add popularity directly
  score += item.popularity || 0;
  // Add rating factor (scaled to not overpower title matches)
  score += (parseFloat(item.rating) || 0) * 10;

  return score;
};

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ results: [] });
    // Multi-search: movies + TV together
    const [movies, shows] = await Promise.all([
      tmdbFetch('/search/movie', { query: q, page: req.query.page || 1 }),
      tmdbFetch('/search/tv', { query: q, page: req.query.page || 1 }),
    ]);
    
    const cleanQ = q.trim().toLowerCase();
    const combined = [
      ...movies.results.map(formatMovie),
      ...shows.results.map(formatShow),
    ];

    combined.sort((a, b) => {
      const scoreA = getSearchScore(a, cleanQ);
      const scoreB = getSearchScore(b, cleanQ);
      return scoreB - scoreA;
    });

    res.json({ results: combined, totalPages: Math.max(movies.total_pages, shows.total_pages) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/movie/:id', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}`, {
      append_to_response: 'videos,credits,similar,reviews',
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
      reviews: (data.reviews?.results || []).slice(0, 8).map(r => ({
        id: r.id,
        author: r.author,
        content: r.content,
        rating: r.author_details?.rating || null,
        avatar: r.author_details?.avatar_path
          ? (r.author_details.avatar_path.startsWith('/http')
            ? r.author_details.avatar_path.substring(1)
            : `${TMDB_IMG}/w185${r.author_details.avatar_path}`)
          : null,
      })),
      originalLanguage: data.original_language || null,
      imdbId: data.imdb_id || null,
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
      append_to_response: 'videos,credits,similar,reviews,external_ids',
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
      reviews: (data.reviews?.results || []).slice(0, 8).map(r => ({
        id: r.id,
        author: r.author,
        content: r.content,
        rating: r.author_details?.rating || null,
        avatar: r.author_details?.avatar_path
          ? (r.author_details.avatar_path.startsWith('/http')
            ? r.author_details.avatar_path.substring(1)
            : `${TMDB_IMG}/w185${r.author_details.avatar_path}`)
          : null,
      })),
      originalLanguage: data.original_language || null,
      imdbId: data.external_ids?.imdb_id || null,
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

/* ════════════════════════════════════════════
   PROVIDERS & ACTORS ROUTES
   ════════════════════════════════════════════ */
app.get('/api/provider/:name', async (req, res) => {
  const name = req.params.name.toLowerCase();
  const page = req.query.page || 1;
  const type = req.query.type || 'tv';

  const providers = {
    netflix: { network: 213, company: 7254 },
    prime: { network: 1024, company: 20580 },
    disney: { network: 2739, company: 2 },
    hbo: { network: 49, company: 3268 },
    apple: { network: 2552, company: 132402 },
    jiohotstar: { network: 2739, company: 2 }
  };

  const provider = providers[name];
  if (!provider) return res.status(400).json({ error: 'Unknown provider' });

  try {
    if (type === 'movie') {
      const data = await tmdbFetch('/discover/movie', {
        with_companies: provider.company,
        sort_by: 'popularity.desc',
        page,
      });
      res.json({ results: data.results.map(formatMovie), totalPages: data.total_pages });
    } else {
      const data = await tmdbFetch('/discover/tv', {
        with_networks: provider.network,
        sort_by: 'popularity.desc',
        page,
      });
      res.json({ results: data.results.map(formatShow), totalPages: data.total_pages });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/person/:id', async (req, res) => {
  try {
    const [bio, credits] = await Promise.all([
      tmdbFetch(`/person/${req.params.id}`),
      tmdbFetch(`/person/${req.params.id}/combined_credits`),
    ]);

    res.json({
      id: bio.id,
      name: bio.name,
      biography: bio.biography || 'No biography available.',
      profile: bio.profile_path ? `${TMDB_IMG}/w300${bio.profile_path}` : null,
      birthday: bio.birthday || null,
      placeOfBirth: bio.place_of_birth || null,
      knownFor: bio.known_for_department || null,
      filmography: (credits.cast || [])
        .slice(0, 24)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .map(c => ({
          id: c.id,
          title: c.title || c.name,
          poster: c.poster_path ? `${TMDB_IMG}/w300${c.poster_path}` : null,
          rating: c.vote_average ? c.vote_average.toFixed(1) : null,
          year: c.release_date?.slice(0, 4) || c.first_air_date?.slice(0, 4) || null,
          type: c.media_type || 'movie',
        })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════
   ZEE5 STREAM PROXY
════════════════════════════════════════════ */
const zee5Cache = { platformToken: null, streamUrls: new Map() };
const ZEE5_TOKEN_TTL = 12 * 60 * 60 * 1000;
const ZEE5_STREAM_TTL = 45 * 60 * 1000;

function generateGuestToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateDDToken() {
  return Buffer.from(JSON.stringify({
    schema_version: '1', os_name: 'N/A', os_version: 'N/A',
    platform_name: 'Chrome', platform_version: '104', device_name: '',
    app_name: 'Web', app_version: '2.52.31',
    player_capabilities: {
      audio_channel: ['STEREO'], video_codec: ['H264'],
      container: ['MP4', 'TS'], package: ['DASH', 'HLS'],
      resolution: ['240p', 'SD', 'HD', 'FHD'], dynamic_range: ['SDR']
    },
    security_capabilities: {
      encryption: ['WIDEVINE_AES_CTR'], widevine_security_level: ['L3'],
      hdcp_version: ['HDCP_V1', 'HDCP_V2', 'HDCP_V2_1', 'HDCP_V2_2']
    }
  })).toString('base64');
}

async function fetchPlatformToken() {
  const { data } = await axios.get('https://www.zee5.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'none'
    },
    timeout: 15000
  });
  const match = data.match(/__NEXT_DATA__"\s*type="application\/json">(\{.*?\})<\/script>/s);
  if (!match) throw new Error('Could not find Next.js data on zee5.com');
  const json = JSON.parse(match[1]);
  const token = json.props?.initialServerSideState?.initialLaunchData?.platform_token?.token;
  if (!token) throw new Error('Could not extract platform token from zee5.com');
  return token;
}

async function getCachedPlatformToken() {
  // Use auth token from .env for premium channels
  if (process.env.ZEE5_AUTH_TOKEN) {
    return process.env.ZEE5_AUTH_TOKEN;
  }
  if (zee5Cache.platformToken && Date.now() - zee5Cache.platformToken.fetchedAt < ZEE5_TOKEN_TTL) {
    return zee5Cache.platformToken.value;
  }
  const token = await fetchPlatformToken();
  zee5Cache.platformToken = { value: token, fetchedAt: Date.now() };
  return token;
}

async function getStreamUrl(channelId, userType = 'guest') {
  const cacheKey = channelId;
  const cached = zee5Cache.streamUrls.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < ZEE5_STREAM_TTL) {
    return cached.value;
  }

  const platformToken = await getCachedPlatformToken();
  const guestToken = generateGuestToken();
  const ddToken = generateDDToken();

  const { data } = await axios.post(
    `https://spapi.zee5.com/singlePlayback/getDetails/secure?channel_id=${channelId}&device_id=${guestToken}&platform_name=desktop_web&translation=en&user_language=en,hi&country=IN&state=&app_version=4.24.0&user_type=${userType}&check_parental_control=false`,
    { 'x-access-token': platformToken, 'X-Z5-Guest-Token': guestToken, 'x-dd-token': ddToken },
    {
      headers: {
        'accept': 'application/json', 'content-type': 'application/json',
        'origin': 'https://www.zee5.com', 'referer': 'https://www.zee5.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    }
  );

  const videoToken = data?.keyOsDetails?.video_token;
  if (!videoToken) {
    const errCode = data?.error_code;
    const errMsg = data?.error_msg || 'Could not get stream URL';
    if (errCode === '3804') {
      if (process.env.ZEE5_AUTH_TOKEN) {
        throw new Error('ZEE5 subscription required for this channel. Your auth token may be invalid or expired.');
      }
      throw new Error('This channel requires a ZEE5 subscription. Set ZEE5_AUTH_TOKEN in .env with your authenticated token from ZEE5 browser session.');
    }
    if (errCode === '401') {
      throw new Error('ZEE5 token expired. Try restarting the server to refresh the guest token.');
    }
    throw new Error(`ZEE5 error (${errCode || 'unknown'}): ${errMsg}`);
  }

  zee5Cache.streamUrls.set(cacheKey, { value: videoToken, fetchedAt: Date.now() });
  return videoToken;
}

app.get('/api/zee5/play/:channelId', async (req, res) => {
  try {
    const streamUrl = await getStreamUrl(req.params.channelId);
    res.json({ url: streamUrl });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/zee5/redirect/:channelId', async (req, res) => {
  try {
    const streamUrl = await getStreamUrl(req.params.channelId);
    res.redirect(302, streamUrl);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ZEE5 CDN proxy (for segments if the CDN doesn't have CORS)
app.get('/api/zee5/proxy/*', async (req, res) => {
  try {
    const targetUrl = req.params[0];
    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': response.headers['content-type'] || 'application/octet-stream'
    });
    response.data.pipe(res);
  } catch (e) {
    res.status(502).json({ error: 'Proxy error: ' + e.message });
  }
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

if (!process.env.VERCEL) {
  app.listen(PORT, start);
}

export default app;
