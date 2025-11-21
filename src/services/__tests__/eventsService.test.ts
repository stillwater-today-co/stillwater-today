import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanDescription,
  filterAndSortEvents,
  filterEvents,
  filterEventsByDate,
  formatEventDateTime,
  getEventCategories,
  sortEventsByPopularity,
  type ProcessedEvent
} from '../eventsService';

const makeEvent = (overrides: Partial<ProcessedEvent>): ProcessedEvent => ({
  id: overrides.id ?? Math.floor(Math.random() * 10000),
  title: overrides.title ?? 'Sample Event',
  date: overrides.date ?? 'Sample Date',
  time: overrides.time ?? 'Sample Time',
  location: overrides.location ?? 'Sample Location',
  description: overrides.description ?? 'Sample Description',
  rawDate: overrides.rawDate ?? new Date(),
  cost: overrides.cost,
  type: overrides.type,
  category: overrides.category,
  ranking: overrides.ranking,
  numAttending: overrides.numAttending,
  popularityScore: overrides.popularityScore
});

describe('eventsService utilities', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(new Date('2025-04-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('formatEventDateTime', () => {
    it('formats events happening today', () => {
      const input = new Date('2025-04-10T15:30:00Z');
      const { date, time } = formatEventDateTime(input.toISOString(), false);

      expect(date).toBe('Today');

      const expectedTime = input.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      expect(time).toBe(expectedTime);
    });

    it('returns friendly fallback when date is missing', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = formatEventDateTime('', false);

      expect(result).toEqual({
        date: 'Date TBD',
        time: 'Time TBD',
        rawDate: expect.any(Date)
      });
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('labels future events as Tomorrow when appropriate', () => {
      const tomorrow = new Date('2025-04-11T18:00:00Z');
      const { date } = formatEventDateTime(tomorrow.toISOString(), false);
      expect(date).toBe('Tomorrow');
    });
  });

  describe('filter functions', () => {
    const today = new Date('2025-04-10T09:00:00Z');
    const yesterday = new Date('2025-04-09T09:00:00Z');
    const nextWeek = new Date('2025-04-17T09:00:00Z');

    const events = [
      makeEvent({ id: 1, rawDate: yesterday, category: 'Community' }),
      makeEvent({ id: 2, rawDate: today, category: 'Academic' }),
      makeEvent({ id: 3, rawDate: nextWeek, category: 'Community' })
    ];

    it('filters events happening today', () => {
      const filtered = filterEventsByDate(events, 'today');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    it('filters upcoming events', () => {
      const filtered = filterEventsByDate(events, 'upcoming');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(3);
    });

    it('filters by date and category together', () => {
      const filtered = filterEvents(events, 'all', 'Community');
      const ids = filtered.map(e => e.id);
      expect(ids).toEqual([1, 3]);
    });

    it('sorts by popularity when requested', () => {
      const scoredEvents = [
        makeEvent({ id: 10, rawDate: nextWeek, popularityScore: 5 }),
        makeEvent({ id: 11, rawDate: nextWeek, popularityScore: 20 }),
        makeEvent({ id: 12, rawDate: nextWeek, popularityScore: 10 })
      ];

      const sorted = filterAndSortEvents(scoredEvents, 'all', 'all', true);
      expect(sorted.map(event => event.id)).toEqual([11, 12, 10]);
    });
  });

  describe('category helpers', () => {
    it('returns unique categories sorted alphabetically', () => {
      const categories = getEventCategories([
        makeEvent({ id: 1, rawDate: new Date(), category: 'Athletics' }),
        makeEvent({ id: 2, rawDate: new Date(), category: 'Community' }),
        makeEvent({ id: 3, rawDate: new Date(), category: 'Athletics' })
      ]);

      expect(categories).toEqual(['Athletics', 'Community']);
    });
  });

  describe('cleanDescription', () => {
    it('strips HTML tags and trims content', () => {
      const html = '<p>Hello <strong>world</strong> &amp; friends</p>';
      expect(cleanDescription(html)).toBe('Hello world friends');
    });

    it('truncates at word boundary when above max length', () => {
      const longHtml = `<p>${'Word '.repeat(100)}</p>`;
      const result = cleanDescription(longHtml, 50);
      expect(result.endsWith('...')).toBe(true);
      expect(result.length).toBeLessThanOrEqual(53);
    });
  });

  describe('sortEventsByPopularity', () => {
    it('orders events from most to least popular', () => {
      const events = [
        makeEvent({ id: 1, rawDate: new Date(), popularityScore: 2 }),
        makeEvent({ id: 2, rawDate: new Date(), popularityScore: 15 }),
        makeEvent({ id: 3, rawDate: new Date(), popularityScore: 5 })
      ];
      const sorted = sortEventsByPopularity(events);
      expect(sorted.map(e => e.id)).toEqual([2, 3, 1]);
    });
  });
});


