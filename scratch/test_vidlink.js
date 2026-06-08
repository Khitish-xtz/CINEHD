import axios from 'axios';

const VIDLINK_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Referer': 'https://vidlink.pro'
};

async function getVidlinkStreams(tmdbId, mediaType = 'movie', seasonNum = null, episodeNum = null) {
    console.log(`[Vidlink] Fetching streams for TMDB ID: ${tmdbId}, Type: ${mediaType}`);
    try {
        const encRes = await axios.get(
            `https://enc-dec.app/api/enc-vidlink?text=${encodeURIComponent(String(tmdbId))}`,
            { timeout: 8000 }
        );
        const encodedTmdb = encRes.data && encRes.data.result;
        if (!encodedTmdb) {
            console.log('[Vidlink] Encryption step returned no result.');
            return null;
        }

        const apiUrl = mediaType === 'tv'
            ? `https://vidlink.pro/api/b/tv/${encodedTmdb}/${seasonNum}/${episodeNum}?multiLang=0`
            : `https://vidlink.pro/api/b/movie/${encodedTmdb}?multiLang=0`;

        const apiRes = await axios.get(apiUrl, { headers: VIDLINK_HEADERS, timeout: 8000 });
        const playlist = apiRes.data && apiRes.data.stream && apiRes.data.stream.playlist;
        return playlist;
    } catch (err) {
        console.error(`[Vidlink] Error: ${err.message}`);
        return null;
    }
}

async function run() {
    console.log('--- MOVIE TEST (Batman Begins: 272) ---');
    const movieUrl = await getVidlinkStreams(272, 'movie');
    console.log('Movie Playlist HLS URL:', movieUrl);

    console.log('\n--- TV SHOW TEST (House of the Dragon: 94997 S1 E1) ---');
    const tvUrl = await getVidlinkStreams(94997, 'tv', 1, 1);
    console.log('TV Playlist HLS URL:', tvUrl);
}

run();
