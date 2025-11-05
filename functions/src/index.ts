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
    humidity?: string;
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
      humidity: data?.current?.humidity || '',
    },
  };
}

async function generateWeatherSummary(apiKey: string): Promise<string> {
  try {
    const weather = await fetchWeatherData();
    const tempStr = weather.current.temperature || '';
    const condition = weather.current.condition || '';
    const wind = weather.current.wind || '';
    const humidity = weather.current.humidity || '';

    const weatherPrompt = [
      'You are a friendly weather assistant for Stillwater, Oklahoma.',
      'Write 2-3 natural, conversational sentences about today\'s weather with a clothing suggestion.',
      'Be concise but informative. Use a warm, helpful tone.',
      'Current weather data:',
      `- Temperature: ${tempStr}`,
      `- Conditions: ${condition}`,
      `- Wind: ${wind}`,
      `- Humidity: ${humidity}`,
      '',
      'Example style: "It\'s a beautiful sunny day with temps near 72°F and light breezes. Perfect weather for outdoor activities. A light jacket should be comfortable."',
    ].join('\n');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(weatherPrompt);
    const text = result.response.text().trim();
    
    return text || 'Expect typical seasonal weather today. Dress comfortably for changing conditions.';
  } catch (error) {
    functions.logger.warn('Weather summary generation failed:', error);
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
    'Summarize today\'s top events in one cohesive paragraph of approximately 150-160 words.',
    'Do not include weather; write as a natural continuation after a weather lead. Start directly with event facts; avoid greetings, ellipses, or transitional phrases like "Now", "Let\'s", "Here are", "and onto", "Also".',
    'Be descriptive and engaging while covering the variety of events happening today.',
    'Here are today\'s events:',
    list,
  ].join('\n');
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

/**
 * Callable HTTPS function to generate AI summary
 * Call from client: const result = await functions.httpsCallable('generateAISummary')({ limit: 10, forceRefresh: true })
 */
export const generateAISummary = functions.https.onCall(async (data, context) => {
  const limit = data.limit ?? 10;
  const forceRefresh = data.forceRefresh ?? false;
  
  try {
    // Record caller identity (if any) for observability and to satisfy linting
    const callerUid = context?.auth?.uid ?? 'anonymous';
    functions.logger.info('generateAISummary invoked', { callerUid });
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
    const events = await fetchRankedTodayEvents(limit);

    // Generate weather summary
    const weatherLead = await generateWeatherSummary(apiKey);

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
    
    // Single cohesive paragraph: weather lead + soft bridge + events continuation
    const bridge = 'Around campus, ';
    const finalSummary = `${weatherLead} ${bridge}${eventsText}`;

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

