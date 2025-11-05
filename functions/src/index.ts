import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Firebase Admin
admin.initializeApp();

type SummaryEvent = {
  title: string;
  date: string;
  time: string;
  location: string;
  cost?: string;
};

type OSUEventInstanceJson = {
  start?: string;
  all_day?: boolean;
};

type OSUEventJson = {
  title?: string;
  location?: string;
  location_name?: string;
  ticket_cost?: string | null;
  event_instances?: Array<{ event_instance?: OSUEventInstanceJson }>;
};

type OSUEventsResponseJson = {
  events?: Array<{ event?: OSUEventJson }>;
};

type WeatherData = {
  current: {
    temperature: string;
    condition: string;
    wind: string;
  };
};

function formatLocalDate(date: Date): string {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatEventDateTime(startTime: string | undefined, allDay: boolean | undefined): { date: string; time: string } {
  if (!startTime) {
    return { date: 'Today', time: 'Time TBD' };
  }
  const dt = new Date(startTime);
  if (isNaN(dt.getTime())) {
    return { date: 'Today', time: 'Time TBD' };
  }
  const today = new Date();
  const isToday = dt.toDateString() === today.toDateString();
  const dateStr = isToday ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = allDay ? 'All Day' : dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { date: dateStr, time: timeStr };
}

async function fetchRankedTodayEvents(limit: number): Promise<SummaryEvent[]> {
  const start = formatLocalDate(new Date());
  const params = new URLSearchParams({
    start,
    days: '1',
    pp: '20',
    sort: 'ranking',
    direction: 'desc',
    distinct: 'true',
    for: 'main',
  });

  const url = `https://events.okstate.edu/api/2/events?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Events API failed: ${res.status}`);
  }
  const data: OSUEventsResponseJson = await res.json();
  const items = (data.events ?? []).map(e => e.event).filter((e): e is OSUEventJson => Boolean(e));

  const mapped: SummaryEvent[] = items.map((ev) => {
    const inst = ev.event_instances?.[0]?.event_instance;
    const { date, time } = formatEventDateTime(inst?.start, inst?.all_day);
    const location = ev.location_name || ev.location || 'Location TBD';
    const cost: string | undefined = (() => {
      const c = ev.ticket_cost || '';
      if (!c) return undefined;
      if (typeof c === 'string' && c.toLowerCase().includes('free')) return 'Free';
      return c;
    })();
    return {
      title: String(ev.title ?? 'Untitled Event'),
      date,
      time,
      location,
      cost,
    };
  });

  return mapped.slice(0, Math.max(0, limit));
}

async function fetchWeatherData(): Promise<WeatherData> {
  // Fetch weather from your Firebase weather endpoint
  const weatherRef = admin.firestore().collection('weather').doc('current');
  const weatherDoc = await weatherRef.get();
  
  if (!weatherDoc.exists) {
    throw new Error('Weather data not found');
  }
  
  const data = weatherDoc.data();
  return {
    current: {
      temperature: data?.current?.temperature || '',
      condition: data?.current?.condition || '',
      wind: data?.current?.wind || '',
    },
  };
}

async function buildTwoSentenceWeatherSummary(): Promise<string> {
  try {
    const weather = await fetchWeatherData();
    const tempStr = weather.current.temperature || ''; // e.g., "72°F"
    const tempMatch = tempStr.match(/-?\d+/);
    const tempF = tempMatch ? parseInt(tempMatch[0], 10) : undefined;

    const condition = (weather.current.condition || '').toLowerCase();
    const wind = (weather.current.wind || '').toLowerCase(); // e.g., "8 mph N" or "22 mph W"

    // Derive descriptive phrases (avoid exact numbers except temperature)
    const isRainy = /rain|shower|storm|thunder/.test(condition);
    const isSnowy = /snow/.test(condition);
    const isSunny = /sunny|clear/.test(condition);
    const isCloudy = /cloud|overcast|mostly cloudy|partly cloudy/.test(condition);

    let windDescriptor = '';
    const windMphMatch = wind.match(/(\d{1,3})\s*mph/);
    if (windMphMatch) {
      const mph = parseInt(windMphMatch[1], 10);
      if (mph >= 25) windDescriptor = 'strong gusts of wind';
      else if (mph >= 15) windDescriptor = 'a noticeable breeze';
      else if (mph >= 5) windDescriptor = 'a light breeze';
    }

    let skyPhrase = 'calm skies';
    if (isRainy) skyPhrase = 'showers at times';
    else if (isSnowy) skyPhrase = 'wintry skies';
    else if (isSunny) skyPhrase = 'mostly sunny skies';
    else if (isCloudy) skyPhrase = 'mostly cloudy skies';

    const tempPhrase = tempF !== undefined ? `${tempF}°F` : 'seasonal temperatures';

    // Clothing suggestion
    let suggestion = 'light layers are comfortable';
    if (isRainy) suggestion = 'bring an umbrella';
    else if (isSnowy || (tempF !== undefined && tempF <= 45)) suggestion = 'bundle up in warm layers';
    else if (tempF !== undefined && tempF >= 85) suggestion = 'choose light, breathable layers';
    else if (windDescriptor === 'strong gusts of wind') suggestion = 'a windbreaker will be useful';

    // Two natural sentences; only temperature has an exact number
    const s1 = `${capitalizeFirst(skyPhrase)}${windDescriptor ? ` with ${windDescriptor}` : ''}, near ${tempPhrase}.`;
    const s2 = `${capitalizeFirst(suggestion)} today.`;
    return `${s1} ${s2}`;
  } catch (error) {
    // Fallback if weather fails
    functions.logger.warn('Weather fetch failed:', error);
    return 'Expect typical seasonal weather today. Dress comfortably for changing conditions.';
  }
}

function buildPrompt(events: SummaryEvent[]): string {
  if (events.length === 0) {
    return 'No OSU events are listed for today in Stillwater.';
  }

  const list = events
    .map(e => `- ${e.title} — ${e.date} ${e.time} @ ${e.location}${e.cost ? ` (${e.cost})` : ''}`)
    .join('\n');

  return [
    'You are a local events assistant for Stillwater, Oklahoma.',
    'Summarize today\'s top events in one cohesive paragraph of ~120–130 words.',
    'Do not include weather; write as a natural continuation after a weather lead. Start directly with event facts; avoid greetings, ellipses, or transitional phrases like "Now", "Let\'s", "Here are", "and onto", "Also".',
    'Here are today\'s events:',
    list,
  ].join('\n');
}

function limitWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  const truncated = words.slice(0, maxWords).join(' ');
  return /[.!?]$/.test(truncated) ? truncated : `${truncated}.`;
}

function sanitizeEventsLead(text: string): string {
  // Collapse whitespace/newlines to single spaces
  let t = text.replace(/\s+/g, ' ').trim();
  // Strip leading ellipses or em-dashes
  t = t.replace(/^(?:\u2026|\.\.\.|—|–)+\s*/u, '');
  // Remove common transitional openings for a smoother continuation (case-insensitive)
  t = t.replace(/^(?:and\s+onto\s+|and\s+on\s+to\s+|and\s+|also[:,]?\s+|now[:,]?\s+|meanwhile[:,]?\s+|then[:,]?\s+|here\s+(?:are|is)\s+|in\s+summary[:,]?\s+)/i, '');
  // Ensure first character is uppercase for proper sentence case
  if (t.length > 0) {
    t = t[0].toUpperCase() + t.slice(1);
  }
  return t;
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Callable HTTPS function to generate AI summary
 * Call from client: const result = await functions.httpsCallable('generateAISummary')({ limit: 10, forceRefresh: true })
 */
export const generateAISummary = functions.https.onCall(async (data, context) => {
  const limit = data.limit ?? 10;
  const forceRefresh = data.forceRefresh ?? false;
  
  try {
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Gemini API key not configured. Add GEMINI_API_KEY to .env file'
      );
    }

    // Check cache first if not force refresh
    const today = formatLocalDate(new Date());
    const cacheRef = admin.firestore().collection('briefings').doc(today);
    
    if (!forceRefresh) {
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cached = cacheDoc.data();
        const cacheAge = Date.now() - cached?.createdAt?.toMillis();
        // Use cache if less than 1 hour old
        if (cacheAge < 3600000 && cached?.summaryText) {
          functions.logger.info('Returning cached summary');
          return { summary: cached.summaryText, cached: true };
        }
      }
    }

    // Generate new summary
    const [weatherLead, events] = await Promise.all([
      buildTwoSentenceWeatherSummary(),
      fetchRankedTodayEvents(limit)
    ]);

    // If no events, return a friendly message rather than calling the model.
    if (events.length === 0) {
      const summary = `${weatherLead} There are no OSU events listed for today in Stillwater.`;
      
      // Cache the result
      await cacheRef.set({
        date: today,
        summaryText: summary,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        eventCount: 0
      });
      
      return { summary, cached: false };
    }

    const prompt = buildPrompt(events);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const eventsText = sanitizeEventsLead(text || 'A mix of activities and gatherings are planned across OSU today.');
    
    // Single cohesive paragraph: 2-sentence weather lead + soft bridge + events continuation
    const bridge = 'Around campus, ';
    const combined = `${weatherLead} ${bridge}${eventsText}`;
    const finalSummary = limitWords(combined, 160);

    // Cache the result
    await cacheRef.set({
      date: today,
      summaryText: finalSummary,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      eventCount: events.length
    });

    functions.logger.info(`Generated summary with ${events.length} events`);
    return { summary: finalSummary, cached: false };
    
  } catch (error) {
    functions.logger.error('Error generating AI summary:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate AI summary',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

