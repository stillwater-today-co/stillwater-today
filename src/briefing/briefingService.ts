import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchWeatherData } from '../services/weatherService'

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!key) {
    throw new Error('Missing VITE_GEMINI_API_KEY in environment')
  }
  return key
}

type SummaryEvent = {
  title: string
  date: string
  time: string
  location: string
  cost?: string
}

function formatLocalDate(date: Date): string {
  const y = String(date.getFullYear())
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatEventDateTime(startTime: string | undefined, allDay: boolean | undefined): { date: string; time: string } {
  if (!startTime) {
    return { date: 'Today', time: 'Time TBD' }
  }
  const dt = new Date(startTime)
  if (isNaN(dt.getTime())) {
    return { date: 'Today', time: 'Time TBD' }
  }
  const today = new Date()
  const isToday = dt.toDateString() === today.toDateString()
  const dateStr = isToday ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = allDay ? 'All Day' : dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return { date: dateStr, time: timeStr }
}

async function fetchRankedTodayEvents(limit: number): Promise<SummaryEvent[]> {
  const start = formatLocalDate(new Date())
  const params = new URLSearchParams({
    start,
    days: '1',
    pp: '20',
    sort: 'ranking',
    direction: 'desc',
    distinct: 'true',
    for: 'main',
  })

  const url = `https://events.okstate.edu/api/2/events?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Events API failed: ${res.status}`)
  }
  const data = await res.json() as { events?: Array<{ event?: any }> }
  const items = (data.events ?? []).map(e => e.event).filter(Boolean)

  const mapped: SummaryEvent[] = items.map((ev: any) => {
    const inst = ev.event_instances?.[0]?.event_instance
    const { date, time } = formatEventDateTime(inst?.start, inst?.all_day)
    const location = ev.location_name || ev.location || 'Location TBD'
    const cost: string | undefined = (() => {
      const c = (ev.ticket_cost as string | null) || ''
      if (!c) return undefined
      if (typeof c === 'string' && c.toLowerCase().includes('free')) return 'Free'
      return c
    })()
    return {
      title: String(ev.title ?? 'Untitled Event'),
      date,
      time,
      location,
      cost,
    }
  })

  return mapped.slice(0, Math.max(0, limit))
}

async function buildTwoSentenceWeatherSummary(): Promise<string> {
  try {
    const weather = await fetchWeatherData(false)
    const tempStr = weather.current.temperature || '' // e.g., "72°F"
    const tempMatch = tempStr.match(/-?\d+/)
    const tempF = tempMatch ? parseInt(tempMatch[0], 10) : undefined

    const condition = (weather.current.condition || '').toLowerCase()
    const wind = (weather.current.wind || '').toLowerCase() // e.g., "8 mph N" or "22 mph W"

    // Derive descriptive phrases (avoid exact numbers except temperature)
    const isRainy = /rain|shower|storm|thunder/.test(condition)
    const isSnowy = /snow/.test(condition)
    const isSunny = /sunny|clear/.test(condition)
    const isCloudy = /cloud|overcast|mostly cloudy|partly cloudy/.test(condition)

    let windDescriptor = ''
    const windMphMatch = wind.match(/(\d{1,3})\s*mph/)
    if (windMphMatch) {
      const mph = parseInt(windMphMatch[1], 10)
      if (mph >= 25) windDescriptor = 'strong gusts of wind'
      else if (mph >= 15) windDescriptor = 'a noticeable breeze'
      else if (mph >= 5) windDescriptor = 'a light breeze'
    }

    let skyPhrase = 'a calm day'
    if (isRainy) skyPhrase = 'periods of rain'
    else if (isSnowy) skyPhrase = 'wintry conditions'
    else if (isSunny) skyPhrase = 'plenty of sun'
    else if (isCloudy) skyPhrase = 'mostly cloudy skies'

    const tempPhrase = tempF !== undefined ? `${tempF}°F` : 'seasonal temperatures'

    // Clothing suggestion
    let suggestion = 'dress comfortably'
    if (isRainy) suggestion = 'bring an umbrella'
    else if (isSnowy) suggestion = 'bundle up and wear layers'
    else if (tempF !== undefined && tempF <= 45) suggestion = 'make sure to dress warm'
    else if (tempF !== undefined && tempF >= 85) suggestion = 'opt for light, breathable clothing'
    else if (windDescriptor === 'strong gusts of wind') suggestion = 'consider a windbreaker'

    // Two sentences max; only temperature has an exact number
    const s1 = `Expect ${skyPhrase}${windDescriptor ? ` with ${windDescriptor}` : ''} around ${tempPhrase}.`
    const s2 = `${capitalizeFirst(suggestion)} today.`
    return `${s1} ${s2}`
  } catch {
    // Fallback if weather fails
    return 'Expect typical seasonal weather today. Dress comfortably for changing conditions.'
  }
}

function buildPrompt(events: SummaryEvent[]): string {
  if (events.length === 0) {
    return 'No OSU events are listed for today in Stillwater.'
  }

  const list = events
    .map(e => `- ${e.title} — ${e.date} ${e.time} @ ${e.location}${e.cost ? ` (${e.cost})` : ''}`)
    .join('\n')

  return [
    'You are a concise local events assistant for Stillwater, Oklahoma.',
    'Summarize today\'s top events in one cohesive paragraph of ~120–130 words.',
    'Do not include weather; write as a natural continuation after a weather lead. Avoid greetings, list formats, and transitional phrases like "Now", "Let\'s", "Here are".',
    'Here are today\'s events:',
    list,
  ].join('\n')
}

export async function generateTodayEventsSummary(options?: { limit?: number; forceRefresh?: boolean }): Promise<string> {
  const limit = options?.limit ?? 10
  // forceRefresh is unused now since we always fetch ranked for today
  const [weatherLead, events] = await Promise.all([
    buildTwoSentenceWeatherSummary(),
    fetchRankedTodayEvents(limit)
  ])

  // If no events, return a friendly message rather than calling the model.
  if (events.length === 0) {
    return `${weatherLead} There are no OSU events listed for today in Stillwater.`
  }

  const prompt = buildPrompt(events)

  const genAI = new GoogleGenerativeAI(getApiKey())
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  const eventsText = sanitizeEventsLead(text || 'Top campus highlights today include a mix of activities and gatherings across OSU.')
  // Single cohesive paragraph: 2-sentence weather lead + events continuation
  const combined = `${weatherLead} ${eventsText}`
  return limitWords(combined, 160)
}

function limitWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  const truncated = words.slice(0, maxWords).join(' ')
  return /[.!?]$/.test(truncated) ? truncated : `${truncated}.`
}

function sanitizeEventsLead(text: string): string {
  // Collapse whitespace/newlines to single spaces
  let t = text.replace(/\s+/g, ' ').trim()
  // Remove common transitional openings for a smoother continuation
  t = t.replace(/^(?:Now[:,]?\s+|Now\s+let[’']?s\s+|Let[’']?s\s+|Here\s+(?:are|is)\s+|In\s+summary[:,]?\s+)/i, '')
  // Ensure first character is uppercase for proper sentence case
  if (t.length > 0) {
    t = t[0].toUpperCase() + t.slice(1)
  }
  return t
}

function capitalizeFirst(s: string): string {
  if (!s) return s
  return s[0].toUpperCase() + s.slice(1)
}


