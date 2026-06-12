export const BLOCK_ADS = null
export const BLOCK_ADS_POPUP = null
export const NO_SANDBOX = null

export const SOURCES = [
  {
    label: 'Nxsha',
    badge: 'sparkles',
    movieUrl: (id) => `https://web.nxsha.app/embed/movie/${id}`,
    tvUrl: (id, s, ep) => `https://web.nxsha.app/embed/tv/${id}/${s}/${ep}`,
    desc: 'Main primary · Multi-server',
    sandbox: NO_SANDBOX,
  },
  {
    label: 'Videasy',
    badge: 'video',
    movieUrl: (id) => `https://player.videasy.to/movie/${id}`,
    tvUrl: (id, s, ep) => `https://player.videasy.to/tv/${id}/${s}/${ep}`,
    desc: 'Multi-server · Audio tracks',
    sandbox: NO_SANDBOX,
  }
  ,
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
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://multiembed.mov/?video_id=${imdbId}&tmdb=0`
      : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://multiembed.mov/?video_id=${imdbId}&tmdb=0&s=${s}&e=${ep}`
      : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${ep}`,
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
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://autoembed.co/movie/imdb/${imdbId}`
      : `https://autoembed.co/movie/tmdb/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://autoembed.co/tv/imdb/${imdbId}-${s}-${ep}`
      : `https://autoembed.co/tv/tmdb/${id}-${s}-${ep}`,
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
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidfast.pro/movie/${imdbId}?autoPlay=true`
      : `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidfast.pro/tv/${imdbId}/${s}/${ep}?autoPlay=true&autoNext=true`
      : `https://vidfast.pro/tv/${id}/${s}/${ep}?autoPlay=true&autoNext=true`,
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
  {
    label: 'VidSrcMe.ru',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrcme.ru/embed/movie/${imdbId}`
      : `https://vidsrcme.ru/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrcme.ru/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vidsrcme.ru/embed/tv/${id}/${s}/${ep}`,
    desc: 'VidSrc mirror (RU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrcMe.su',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrcme.su/embed/movie/${imdbId}`
      : `https://vidsrcme.su/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrcme.su/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vidsrcme.su/embed/tv/${id}/${s}/${ep}`,
    desc: 'VidSrc mirror (SU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrc-Me.ru',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrc-me.ru/embed/movie/${imdbId}`
      : `https://vidsrc-me.ru/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrc-me.ru/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vidsrc-me.ru/embed/tv/${id}/${s}/${ep}`,
    desc: 'VidSrc mirror (RU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrc-Me.su',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrc-me.su/embed/movie/${imdbId}`
      : `https://vidsrc-me.su/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrc-me.su/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vidsrc-me.su/embed/tv/${id}/${s}/${ep}`,
    desc: 'VidSrc mirror (SU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrc-Embed.ru',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrc-embed.ru/embed/${imdbId}/`
      : `https://vidsrc-embed.ru/embed/${id}/`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrc-embed.ru/embed/${imdbId}/${s}-${ep}/`
      : `https://vidsrc-embed.ru/embed/${id}/${s}-${ep}/`,
    desc: 'VidSrc embed (RU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrc-Embed.su',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrc-embed.su/embed/${imdbId}/`
      : `https://vidsrc-embed.su/embed/${id}/`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrc-embed.su/embed/${imdbId}/${s}-${ep}/`
      : `https://vidsrc-embed.su/embed/${id}/${s}-${ep}/`,
    desc: 'VidSrc embed (SU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VSrc.su',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vsrc.su/embed/movie/${imdbId}`
      : `https://vsrc.su/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vsrc.su/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vsrc.su/embed/tv/${id}/${s}/${ep}`,
    desc: 'VSrc mirror (SU)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: '111Movies',
    badge: 'video',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://111movies.com/movie/${imdbId}`
      : `https://111movies.com/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://111movies.com/tv/${imdbId}/${s}/${ep}`
      : `https://111movies.com/tv/${id}/${s}/${ep}`,
    desc: '111Movies player',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: '2Embed.cc',
    badge: 'refresh',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://www.2embed.cc/embed/${imdbId}`
      : `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://www.2embed.cc/embedtv/${imdbId}?s=${s}&e=${ep}`
      : `https://www.2embed.cc/embedtv/${id}?s=${s}&e=${ep}`,
    desc: 'Alternative 2Embed player',
    sandbox: BLOCK_ADS,
  },
  {
    label: 'VidSrc.mov',
    badge: 'video',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrc.mov/embed/movie/${imdbId}`
      : `https://vidsrc.mov/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrc.mov/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vidsrc.mov/embed/tv/${id}/${s}/${ep}`,
    desc: 'VidSrc mirror (MOV)',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'HnEmbed',
    badge: 'video',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://hnembed.cc/embed/movie/${imdbId}`
      : `https://hnembed.cc/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://hnembed.cc/embed/tv/${imdbId}/${s}/${ep}`
      : `https://hnembed.cc/embed/tv/${id}/${s}/${ep}`,
    desc: 'Drama & movie player',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VaPlayer',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vaplayer.ru/embed/movie/${imdbId}`
      : `https://vaplayer.ru/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vaplayer.ru/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vaplayer.ru/embed/tv/${id}/${s}/${ep}`,
    desc: 'VaPlayer mirror',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'HnDrama',
    badge: 'video',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://hndrama.cc/embed/movie/${imdbId}`
      : `https://hndrama.cc/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => {
      const baseId = imdbId || id;
      if (s !== undefined && ep !== undefined && s !== null && ep !== null) {
        return `https://hndrama.cc/embed/drama/${baseId}/${s}/${ep}`;
      }
      return `https://hndrama.cc/embed/drama/${baseId}`;
    },
    desc: 'Asian Drama specialist',
    sandbox: BLOCK_ADS_POPUP,
  },
  {
    label: 'VidSrc.xyz',
    badge: 'play',
    movieUrl: (id, lang, imdbId) => imdbId
      ? `https://vidsrc.xyz/embed/movie/${imdbId}`
      : `https://vidsrc.xyz/embed/movie/${id}`,
    tvUrl: (id, s, ep, lang, imdbId) => imdbId
      ? `https://vidsrc.xyz/embed/tv/${imdbId}/${s}/${ep}`
      : `https://vidsrc.xyz/embed/tv/${id}/${s}/${ep}`,
    desc: 'Reliable multi-audio mirror',
    sandbox: BLOCK_ADS_POPUP,
  },
]

export const LANGUAGES = [
  { code: 'hi', label: 'Hindi' },
  { code: 'en', label: 'English' },
  { code: 'te', label: 'Telugu' },
  { code: 'ta', label: 'Tamil' },
]
