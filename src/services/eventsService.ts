// Events service for Oklahoma State University events
// Main Campus API: https://events.okstate.edu/api/2/events
// Extension API: https://ag-events.okstate.edu/api/2/events

interface EventInstance {
  id: number
  event_id: number
  start: string
  end: string | null
  ranking: number
  all_day: boolean
  num_attending: number
}

interface EventInstanceWrapper {
  event_instance: EventInstance
}

interface EventFilters {
  event_audience?: Array<{ name: string; id: number }>
  event_county_department?: Array<{ name: string; id: number }>
  event_program_area?: Array<{ name: string; id: number }>
  event_types?: Array<{ name: string; id: number }>
  event_academic_college?: Array<{ name: string; id: number }>
  event_themes?: Array<{ name: string; id: number }>
}

interface OSUEvent {
  id: number
  title: string
  url: string
  updated_at: string
  created_at: string
  first_date: string
  last_date: string
  urlname: string
  location: string
  location_name: string
  status: string
  experience: 'inperson' | 'virtual' | 'hybrid'
  ticket_cost: string | null
  description_text: string
  description: string
  address: string
  event_instances: EventInstanceWrapper[]
  geo: {
    latitude: string | null
    longitude: string | null
    street: string | null
    city: string | null
    state: string | null
    zip: string | null
  }
  filters: EventFilters
  custom_fields: {
    contact_name?: string
    contact_email?: string
    contact_phone?: string
  }
  localist_url: string
  photo_url: string
}

interface OSUEventsResponse {
  events: Array<{ event: OSUEvent }>
  page: {
    current: number
    size: number
    total: number
  }
  date: {
    first: string
    last: string
  }
}

export interface ProcessedEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  description: string
  cost?: string
  type?: 'inperson' | 'virtual' | 'hybrid'
  contact?: {
    name?: string
    email?: string
    phone?: string
  }
  url?: string
  image?: string
  rawDate: Date // Add raw date for proper comparison
  category?: string // Event category (Academic, Athletics, Community, etc.)
  college?: string // Academic college if applicable
  ranking?: number // Event ranking from API
  numAttending?: number // Number of people attending
  popularityScore?: number // Calculated popularity score
}

// Cache for API responses (30 minutes cache)
let eventsCache: { 
  data: ProcessedEvent[]; 
  timestamp: number;
  fetchedPages: {
    main: Set<number>;
    extension: Set<number>;
  }
} | null = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// Track available pages
const totalPages = { main: 62, extension: 23 } // From our API testing

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Fetch events from specific pages
async function fetchEventsFromPages(
  mainPages: number[] = [1], 
  extensionPages: number[] = [1]
): Promise<ProcessedEvent[]> {
  try {
    // Create fetch promises for all requested pages
    const mainPromises = mainPages.map(page => 
      fetch(`https://events.okstate.edu/api/2/events?days=60&page=${page}`)
    )
    const extensionPromises = extensionPages.map(page => 
      fetch(`https://ag-events.okstate.edu/api/2/events?days=60&page=${page}`)
    )

    // Execute all requests in parallel
    const [mainResponses, extensionResponses] = await Promise.all([
      Promise.all(mainPromises),
      Promise.all(extensionPromises)
    ])

    const allEvents: OSUEvent[] = []

    // Process main campus responses
    for (const response of mainResponses) {
      if (response.ok) {
        const data: OSUEventsResponse = await response.json()
        allEvents.push(...data.events.map(e => e.event))
      }
    }

    // Process extension responses
    for (const response of extensionResponses) {
      if (response.ok) {
        const data: OSUEventsResponse = await response.json()
        allEvents.push(...data.events.map(e => e.event))
      }
    }

    // Process events into our format
    const processedEvents = allEvents
      .map((event) => {
        const nextInstanceWrapper = event.event_instances[0]
        if (!nextInstanceWrapper || !nextInstanceWrapper.event_instance) {
          return null
        }

        const nextInstance = nextInstanceWrapper.event_instance
        const { date, time, rawDate } = formatEventDateTime(nextInstance.start, nextInstance.all_day)
        
        // Calculate popularity score based on ranking and attendance
        const ranking = nextInstance.ranking || 0
        const numAttending = nextInstance.num_attending || 0
        const popularityScore = (numAttending * 2) + (ranking * 1) // Weight attendance more than ranking
        
        return {
          id: event.id,
          title: event.title,
          date,
          time,
          location: event.location_name || event.location || 'Location TBD',
          description: cleanDescription(event.description_text || event.description),
          cost: formatCost(event.ticket_cost),
          type: event.experience,
          rawDate,
          category: getEventCategory(event.filters),
          college: event.filters?.event_academic_college?.[0]?.name,
          ranking,
          numAttending,
          popularityScore,
          ...(event.custom_fields && {
            contact: {
              name: event.custom_fields.contact_name,
              email: event.custom_fields.contact_email,
              phone: event.custom_fields.contact_phone
            }
          }),
          url: event.localist_url,
          image: event.photo_url
        } as ProcessedEvent
      })
      .filter((event): event is ProcessedEvent => event !== null)
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

    return processedEvents
  } catch (error) {
    console.error('Events API error:', error)
    throw new Error(`Failed to fetch OSU events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Convert date/time to user-friendly format
function formatEventDateTime(startTime: string, allDay: boolean): { date: string; time: string; rawDate: Date } {
  // Handle invalid or missing dates
  if (!startTime) {
    console.warn('No start time provided for event')
    const fallbackDate = new Date()
    return { 
      date: 'Date TBD', 
      time: 'Time TBD', 
      rawDate: fallbackDate 
    }
  }

  const date = new Date(startTime)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', startTime)
    const fallbackDate = new Date()
    return { 
      date: 'Date TBD', 
      time: 'Time TBD', 
      rawDate: fallbackDate 
    }
  }

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Check if it's today or tomorrow for special formatting
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  let dateStr: string
  if (isToday) {
    dateStr = 'Today'
  } else if (isTomorrow) {
    dateStr = 'Tomorrow'
  } else {
    // Show full date with year if it's not this year
    const currentYear = today.getFullYear()
    const eventYear = date.getFullYear()
    
    if (eventYear === currentYear) {
      dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric'
      })
    } else {
      dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
  
  const timeStr = allDay 
    ? 'All Day'
    : date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
  
  return { date: dateStr, time: timeStr, rawDate: date }
}

// Clean up HTML description
function cleanDescription(html: string, maxLength: number = 200): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  if (text.length <= maxLength) return text
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

// Format cost display
function formatCost(cost: string | null): string {
  if (!cost) return 'Free'
  if (cost.toLowerCase().includes('free')) return 'Free'
  return cost
}

// Get appropriate category from event filters
function getEventCategory(filters: EventFilters | undefined): string {
  if (!filters) return 'Other'
  
  // Priority order: event_types, event_themes, event_program_area, event_audience
  if (filters.event_types && filters.event_types.length > 0) {
    return filters.event_types[0].name
  }
  
  if (filters.event_themes && filters.event_themes.length > 0) {
    return filters.event_themes[0].name
  }
  
  if (filters.event_program_area && filters.event_program_area.length > 0) {
    return filters.event_program_area[0].name
  }
  
  if (filters.event_audience && filters.event_audience.length > 0) {
    return filters.event_audience[0].name
  }
  
  if (filters.event_academic_college && filters.event_academic_college.length > 0) {
    return filters.event_academic_college[0].name
  }
  
  return 'Other'
}

// Main function to fetch initial OSU events (randomized from first 2 pages)
export async function fetchOSUEvents(forceRefresh: boolean = false): Promise<ProcessedEvent[]> {
  // Check cache first (unless force refresh)
  if (!forceRefresh && eventsCache && (Date.now() - eventsCache.timestamp) < CACHE_DURATION) {
    return shuffleArray(eventsCache.data).slice(0, 15) // Return randomized subset
  }
  
  try {
    // Fetch first 2 pages from each API for initial load
    const events = await fetchEventsFromPages([1, 2], [1, 2])
    
    if (events.length === 0) {
      throw new Error('No events found from either API')
    }
    
    // Cache all fetched events
    eventsCache = {
      data: events,
      timestamp: Date.now(),
      fetchedPages: {
        main: new Set([1, 2]),
        extension: new Set([1, 2])
      }
    }
    
    // Return randomized subset for initial display
    return shuffleArray(events).slice(0, 15)
    
  } catch (error) {
    console.error('Events API error:', error)
    throw new Error(`Failed to fetch OSU events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Check if cached data exists and is still valid
export function hasCachedEvents(): boolean {
  return eventsCache !== null && (Date.now() - eventsCache.timestamp) < CACHE_DURATION
}

// Get cached events data if available
export function getCachedEvents(): ProcessedEvent[] | null {
  if (hasCachedEvents()) {
    return eventsCache!.data
  }
  return null
}

// Get events by type
export async function getEventsByType(type: 'inperson' | 'virtual' | 'hybrid'): Promise<ProcessedEvent[]> {
  const events = await fetchOSUEvents()
  return events.filter(event => event.type === type)
}

// Search events by keyword
export async function searchEvents(keyword: string): Promise<ProcessedEvent[]> {
  const events = await fetchOSUEvents()
  const searchTerm = keyword.toLowerCase()
  
  return events.filter(event => 
    event.title.toLowerCase().includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm) ||
    event.location.toLowerCase().includes(searchTerm)
  )
}

// Filter events by date
export function filterEventsByDate(events: ProcessedEvent[], filter: 'all' | 'today' | 'upcoming'): ProcessedEvent[] {
  console.log(`Filtering ${events.length} events by date filter: ${filter}`)
  
  if (filter === 'all') return events
  
  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Start of today
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1) // Start of tomorrow
  
  if (filter === 'today') {
    const filtered = events.filter(event => {
      const eventDate = new Date(event.rawDate)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === today.getTime()
    })
    console.log(`Today filter result: ${filtered.length} events`)
    return filtered
  }
  
  if (filter === 'upcoming') {
    const filtered = events.filter(event => {
      return event.rawDate.getTime() > now.getTime()
    })
    console.log(`Upcoming filter result: ${filtered.length} events`)
    return filtered
  }
  
  return events
}

// Get unique event categories from events list
export function getEventCategories(events: ProcessedEvent[]): string[] {
  const categories = new Set<string>()
  events.forEach(event => {
    if (event.category) {
      categories.add(event.category)
    }
  })
  return Array.from(categories).sort()
}

// Filter events by category
export function filterEventsByCategory(events: ProcessedEvent[], category: string): ProcessedEvent[] {
  if (category === 'all') return events
  return events.filter(event => event.category === category)
}

// Sort events by popularity (highest score first)
export function sortEventsByPopularity(events: ProcessedEvent[]): ProcessedEvent[] {
  return [...events].sort((a, b) => {
    const scoreA = a.popularityScore || 0
    const scoreB = b.popularityScore || 0
    return scoreB - scoreA // Descending order (most popular first)
  })
}

// Combined filter: date and category
export function filterEvents(
  events: ProcessedEvent[], 
  dateFilter: 'all' | 'today' | 'upcoming',
  categoryFilter: string
): ProcessedEvent[] {
  let filtered = filterEventsByDate(events, dateFilter)
  if (categoryFilter !== 'all') {
    filtered = filterEventsByCategory(filtered, categoryFilter)
  }
  return filtered
}

// Combined filter with popularity sorting option
export function filterAndSortEvents(
  events: ProcessedEvent[], 
  dateFilter: 'all' | 'today' | 'upcoming',
  categoryFilter: string,
  sortByPopularity: boolean = false
): ProcessedEvent[] {
  let filtered = filterEvents(events, dateFilter, categoryFilter)
  if (sortByPopularity) {
    filtered = sortEventsByPopularity(filtered)
  }
  return filtered
}

// Load more events (general - gets next pages)
export async function loadMoreEvents(currentEvents: ProcessedEvent[]): Promise<ProcessedEvent[]> {
  if (!eventsCache) {
    throw new Error('No events cache available')
  }

  try {
    // Find next pages to fetch
    const nextMainPage = findNextPage(eventsCache.fetchedPages.main, totalPages.main)
    const nextExtPage = findNextPage(eventsCache.fetchedPages.extension, totalPages.extension)

    if (!nextMainPage && !nextExtPage) {
      return [] // No more pages available
    }

    // Fetch next pages
    const mainPages = nextMainPage ? [nextMainPage] : []
    const extPages = nextExtPage ? [nextExtPage] : []
    
    const newEvents = await fetchEventsFromPages(mainPages, extPages)

    // Update cache with new pages
    if (nextMainPage) eventsCache.fetchedPages.main.add(nextMainPage)
    if (nextExtPage) eventsCache.fetchedPages.extension.add(nextExtPage)
    
    // Add new events to cache
    eventsCache.data.push(...newEvents)

    // Filter out events that are already displayed
    const currentIds = new Set(currentEvents.map(e => e.id))
    const uniqueNewEvents = newEvents.filter(e => !currentIds.has(e.id))

    return uniqueNewEvents

  } catch (error) {
    console.error('Load more events error:', error)
    throw new Error(`Failed to load more events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Load more events for specific category
export async function loadMoreCategoryEvents(
  category: string, 
  currentEvents: ProcessedEvent[]
): Promise<ProcessedEvent[]> {
  if (!eventsCache) {
    throw new Error('No events cache available')
  }

  try {
    const currentIds = new Set(currentEvents.map(e => e.id))
    const foundEvents: ProcessedEvent[] = []
    let attempts = 0
    const maxAttempts = 5 // Limit attempts to avoid infinite loops

    // Keep fetching pages until we find enough events in the category
    while (foundEvents.length < 10 && attempts < maxAttempts) {
      const nextMainPage = findNextPage(eventsCache.fetchedPages.main, totalPages.main)
      const nextExtPage = findNextPage(eventsCache.fetchedPages.extension, totalPages.extension)

      if (!nextMainPage && !nextExtPage) {
        break // No more pages available
      }

      // Fetch next pages
      const mainPages = nextMainPage ? [nextMainPage] : []
      const extPages = nextExtPage ? [nextExtPage] : []
      
      const newEvents = await fetchEventsFromPages(mainPages, extPages)

      // Update cache with new pages
      if (nextMainPage) eventsCache.fetchedPages.main.add(nextMainPage)
      if (nextExtPage) eventsCache.fetchedPages.extension.add(nextExtPage)
      
      // Add new events to cache
      eventsCache.data.push(...newEvents)

      // Find events in the requested category that aren't already displayed
      const categoryEvents = newEvents
        .filter(e => e.category === category && !currentIds.has(e.id))
      
      foundEvents.push(...categoryEvents)
      attempts++
    }

    return foundEvents.slice(0, 10) // Return up to 10 new events

  } catch (error) {
    console.error('Load more category events error:', error)
    throw new Error(`Failed to load more ${category} events: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to find next unfetched page
function findNextPage(fetchedPages: Set<number>, maxPages: number): number | null {
  for (let page = 1; page <= maxPages; page++) {
    if (!fetchedPages.has(page)) {
      return page
    }
  }
  return null
}

// Check if more events are available
export function hasMoreEventsAvailable(): boolean {
  if (!eventsCache) return true // Assume yes if no cache

  const mainHasMore = eventsCache.fetchedPages.main.size < totalPages.main
  const extHasMore = eventsCache.fetchedPages.extension.size < totalPages.extension
  
  return mainHasMore || extHasMore
}

// Get count of remaining events
export function getRemainingEventsCount(): number {
  if (!eventsCache) return 0

  const mainRemaining = Math.max(0, totalPages.main - eventsCache.fetchedPages.main.size) * 10
  const extRemaining = Math.max(0, totalPages.extension - eventsCache.fetchedPages.extension.size) * 10
  
  return mainRemaining + extRemaining
}