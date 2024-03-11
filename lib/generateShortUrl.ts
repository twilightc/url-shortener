import { customAlphabet } from 'nanoid'

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const generateShortUrl = (host: string) => {
  // produce short url--it should be unpredictable and unique (base62, assume take the former six alphebets)
  // (if don't use nanoid, combine sha-512, salting, base62 encoding)
  const shortUrlCode = customAlphabet(alphabet, 6)();
  return {
    shortUrlCode,
    fullShortenUrl: `${protocol}://${host}/api/${shortUrlCode}`
  }
}

export default generateShortUrl;