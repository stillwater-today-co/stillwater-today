// Quote service using DummyJSON API for daily quotes
// API docs: https://dummyjson.com/docs/quotes

export interface Quote {
  text: string
  author: string
}

let cachedQuote: Quote | null = null
let cacheTs = 0

// Helper to check if cached quote is from today
function isQuoteFromToday(): boolean {
  if (!cachedQuote || cacheTs === 0) return false
  
  const cachedDate = new Date(cacheTs)
  const today = new Date()
  
  return (
    cachedDate.getDate() === today.getDate() &&
    cachedDate.getMonth() === today.getMonth() &&
    cachedDate.getFullYear() === today.getFullYear()
  )
}

export async function fetchRandomQuote(): Promise<Quote> {
  // Return cached if it's from today
  if (cachedQuote && isQuoteFromToday()) {
    return cachedQuote
  }

  try {
    // DummyJSON has 1453 quotes total, use deterministic selection based on day
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    const quoteId = (dayOfYear % 1453) + 1 // Quote IDs are 1-indexed
    
    const resp = await fetch(`https://dummyjson.com/quotes/${quoteId}`)
    if (!resp.ok) {
      throw new Error(`Quote API failed: ${resp.status}`)
    }
    const data = await resp.json()
    
    // Response: { id: 1, quote: "text", author: "name" }
    if (data && data.quote && data.author) {
      const q = {
        text: String(data.quote),
        author: String(data.author)
      }
      cachedQuote = q
      cacheTs = Date.now()
      return q
    }
    throw new Error('Unexpected quote response format')
  } catch (err) {
    console.error('Failed to fetch quote:', err)
    cachedQuote = null
    cacheTs = 0
    throw err
  }
}

export function clearQuoteCache() {
  cachedQuote = null
  cacheTs = 0
}
