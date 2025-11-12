// Simple thin wrapper around ZenQuotes API to provide positive quotes
// Docs: https://docs.zenquotes.io/

export interface Quote {
  text: string
  author: string
}

let cachedQuote: Quote | null = null
let cacheTs = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function fetchRandomQuote(): Promise<Quote> {
  // Return cached if fresh
  if (cachedQuote && (Date.now() - cacheTs) < CACHE_TTL) {
    return cachedQuote
  }

  try {
    // Use the free ZenQuotes random endpoint which returns an array with one object
    const resp = await fetch('https://zenquotes.io/api/random')
    if (!resp.ok) {
      throw new Error(`Quote API failed: ${resp.status}`)
    }
    const data = await resp.json()
    // Expected shape: [{ q: 'quote text', a: 'Author' }]
    if (Array.isArray(data) && data.length > 0 && data[0].q) {
      const q = {
        text: String(data[0].q),
        author: data[0].a ? String(data[0].a) : 'Unknown'
      }
      cachedQuote = q
      cacheTs = Date.now()
      return q
    }
    throw new Error('Unexpected quote response')
  } catch (err) {
    // log and fallback: small curated list
    // keep the error visible in dev tools but continue with a safe fallback
  console.debug('fetchRandomQuote failed', err)
    const fallback: Quote = {
      text: "Keep your face always toward the sunshine—and shadows will fall behind you.",
      author: 'Walt Whitman'
    }
    cachedQuote = fallback
    cacheTs = Date.now()
    return fallback
  }
}

export function clearQuoteCache() {
  cachedQuote = null
  cacheTs = 0
}
