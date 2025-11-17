// @ts-nocheck
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { clearQuoteCache, fetchRandomQuote } from '../quotesService';

describe('quotesService', () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
    global.fetch = originalFetch as typeof global.fetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearQuoteCache();
  });

  it('caches quote responses for the same day', async () => {
    vi.setSystemTime(new Date('2025-03-01T10:00:00Z'));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ quote: 'Stay positive', author: 'Alex' })
    });

    global.fetch = fetchMock as unknown as typeof global.fetch;

    const first = await fetchRandomQuote();
    const second = await fetchRandomQuote();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('re-fetches after cache is cleared', async () => {
    vi.setSystemTime(new Date('2025-03-02T10:00:00Z'));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ quote: 'Keep going', author: 'Sam' })
    });

    global.fetch = fetchMock as unknown as typeof global.fetch;

    await fetchRandomQuote();
    clearQuoteCache();
    await fetchRandomQuote();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws when the API response is not ok', async () => {
    vi.setSystemTime(new Date('2025-03-03T10:00:00Z'));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    global.fetch = fetchMock as unknown as typeof global.fetch;

    await expect(fetchRandomQuote()).rejects.toThrow('Quote API failed: 500');
  });
});


