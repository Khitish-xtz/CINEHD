export const BLOCK_ADS = null
export const BLOCK_ADS_POPUP = null
export const NO_SANDBOX = null

export const SOURCES = [
  {
    label: 'Videasy',
    badge: 'video',
    movieUrl: (id) => `https://player.videasy.to/movie/${id}`,
    tvUrl: (id, s, ep) => `https://player.videasy.to/tv/${id}/${s}/${ep}`,
    desc: 'Multi-server · Audio tracks',
    sandbox: NO_SANDBOX,
  },
  {
    label: 'WatchOut',
    badge: 'india',
    movieUrl: (id) => `https://watchout.rpmvid.com/#${id}`,
    tvUrl: (id, s, ep) => `https://watchout.rpmvid.com/#${id}/tv/${s}/${ep}`,
    desc: 'Hindi multi-audio · Ad-free',
    sandbox: NO_SANDBOX,
  },
  {
    label: 'Indra',
    badge: 'audio',
    movieUrl: (id) => `https://indraembed.netlify.app/movie/${id}`,
    tvUrl: (id, s, ep) => `https://indraembed.netlify.app/tv/${id}/${s}/${ep}`,
    desc: 'Multi-Audio embed · Hindi',
    sandbox: BLOCK_ADS,
  },
  {
    label: 'Cinezo',
    badge: 'movie',
    movieUrl: (id) => `https://player.cinezo.live/embed/movie/${id}?server=hindi&autoplay=true`,
    tvUrl: (id, s, ep) => `https://player.cinezo.live/embed/tv/${id}/${s}/${ep}?server=hindi&autoplay=true`,
    desc: 'Ad-free · Hindi audio',
    sandbox: BLOCK_ADS,
  },
  {
    label: 'VidLink',
    badge: 'india',
    movieUrl: (id, lang) =>
      `https://vidlink.pro/movie/${id}?primaryColor=E50914&iconColor=E50914&lang=${lang}&autoplay=true`,
    tvUrl: (id, s, ep, lang) =>
      `https://vidlink.pro/tv/${id}/${s}/${ep}?primaryColor=E50914&iconColor=E50914&lang=${lang}&autoplay=true`,
    supportsLang: true,
    desc: 'Hindi default (may have ads)',
    sandbox: NO_SANDBOX,
  },
  {
    label: 'NHDAPI',
    badge: 'rocket',
    movieUrl: (id) => `https://embed.streammafia.to/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://embed.streammafia.to/embed/tv/${id}/${s}/${ep}`,
    desc: 'Zero Ads · Multi-Audio',
    sandbox: BLOCK_ADS,
  },
  {
    label: 'ScreenScape',
    badge: 'theater',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://screenscape.me/embed?imdb=${imdbId}&type=movie&lang=${lang || 'hi'}&autoplay=true`
      : `https://screenscape.me/embed?tmdb=${id}&type=movie&lang=${lang || 'hi'}&autoplay=true`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://screenscape.me/embed?imdb=${imdbId}&type=tv&season=${s}&episode=${ep}&lang=${lang || 'hi'}&autoplay=true`
      : `https://screenscape.me/embed?tmdb=${id}&type=tv&season=${s}&episode=${ep}&lang=${lang || 'hi'}&autoplay=true`,
    supportsLang: true,
    desc: 'Hindi multi-audio',
    sandbox: NO_SANDBOX,
  },
  {
    label: 'VidSrc',
    badge: 'play',
    movieUrl: (id) => `https://vidsrc.wiki/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://vidsrc.wiki/embed/tv/${id}/${s}/${ep}`,
    desc: 'Reliable backup',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'Vidsrc.to',
    badge: 'video',
    movieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://vidsrc.to/embed/tv/${id}/${s}/${ep}`,
    desc: 'Multi-source backup',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'SuperEmbed',
    badge: 'globe',
    movieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tvUrl: (id, s, ep) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${ep}`,
    desc: 'Multi-source aggregator',
    sandbox: BLOCK_ADS,
  },
  {
    label: '2Embed',
    badge: 'refresh',
    movieUrl: (id) => `https://www.2embed.stream/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://www.2embed.stream/embed/tv/${id}/${s}/${ep}`,
    desc: 'Stable embed',
    sandbox: BLOCK_ADS,
  },
  {
    label: 'AutoEmbed',
    badge: 'bolt',
    movieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tvUrl: (id, s, ep) => `https://autoembed.co/tv/tmdb/${id}-${s}-${ep}`,
    desc: 'Auto backup',
    sandbox: BLOCK_ADS,
  },
  {
    label: 'VidSrc.in',
    badge: 'india',
    movieUrl: (id) => `https://vidsrc.in/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://vidsrc.in/embed/tv/${id}/${s}/${ep}`,
    desc: 'Hindi default for Bollywood',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidFast',
    badge: 'bolt',
    movieUrl: (id) => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tvUrl: (id, s, ep) => `https://vidfast.pro/tv/${id}/${s}/${ep}?autoPlay=true&autoNext=true`,
    desc: 'Fast verified player',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'Smashy',
    badge: 'star',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://player.smashy.stream/movie/${imdbId}`
      : `https://player.smashy.stream/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://player.smashy.stream/tv/${imdbId}?s=${s}&e=${ep}`
      : `https://player.smashy.stream/tv/${id}?s=${s}&e=${ep}`,
    desc: 'Multi-server · subtitle lang',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrc.cc',
    badge: 'diamond',
    movieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${ep}`,
    desc: 'Reliable new mirror',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'MoviesAPI',
    badge: 'film',
    movieUrl: (id) => `https://moviesapi.to/movie/${id}`,
    tvUrl: (id, s, ep) => `https://moviesapi.to/tv/${id}-${s}-${ep}`,
    desc: 'Clean minimal player',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidLux',
    badge: 'sparkles',
    movieUrl: (id) => `https://vidlux.online/movie/${id}`,
    tvUrl: (id, s, ep) => `https://vidlux.online/tv/${id}/${s}/${ep}`,
    desc: '7 servers · multi-domain',
    sandbox: BLOCK_ADS_POPUP,
  },
]

export const LANGUAGES = [
  { code: 'hi', label: 'Hindi' },
  { code: 'en', label: 'English' },
  { code: 'te', label: 'Telugu' },
  { code: 'ta', label: 'Tamil' },
]
