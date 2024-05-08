import sdk from "@hasura/ndc-lambda-sdk"

// assuming env vars always set. todo: check and error on startup if not
// const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY as string;
// const ALGOLIA_APPLICATION_ID = process.env.ALGOLIA_APPLICATION_ID as string;
const ALGOLIA_API_KEY = 'c99d87cf6402f18cd3b18b9a2eea511a' as string;
const ALGOLIA_APPLICATION_ID = '2QU6OHSJH8' as string;

async function search<T>(query: string, index: string, hitMap: (hit: Hit) => T): Promise<T[]> {
  const endpoint = `https://${ALGOLIA_APPLICATION_ID}-dsn.algolia.net/1/indexes/${index}/query`;
  const headers = new Headers();
  headers.append('X-Algolia-API-Key', ALGOLIA_API_KEY);
  headers.append('X-Algolia-Application-Id',  ALGOLIA_APPLICATION_ID);
  headers.append('Content-Type', 'application/json');

  const body = JSON.stringify({ params: `query=${query}`});

  try {
    const response = await fetch(endpoint, { method: 'POST', headers, body });
    const data = await response.json() as { hits: Hit[] };
    return data.hits.map(hitMap);
  } catch (error) {
    // return the error to the client. Note this may not be desirable, to avoid leaking information
    // ref: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#error-handling
    throw new sdk.UnprocessableContent("Error Searching Algolia:", { error })
  }
}

interface Hit {
  objectID: string,
  name: string
}

interface ArtistHit {
  artistId: number,
  name: string
}
interface AlbumHit {
  albumId: number,
  name: string
}
interface TrackHit {
  trackId: number,
  name: string
}

/** @readonly */
export function searchArtist(query: string): Promise<ArtistHit[]> {
  return search<ArtistHit>(query, "artist", hit => ({ name: hit.name, artistId: Number(hit.objectID) }))
}

/** @readonly */
export function searchAlbum(query: string): Promise<AlbumHit[]> {
  return search<AlbumHit>(query, "album", hit => ({ name: hit.name, albumId: Number(hit.objectID) }))
}

/** @readonly */
export function searchTrack(query: string): Promise<TrackHit[]> {
  return search<TrackHit>(query, "track", hit => ({ name: hit.name, trackId: Number(hit.objectID) }))
}
