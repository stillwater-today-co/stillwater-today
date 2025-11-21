import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Generate today's events summary using Firebase Cloud Function
 * This calls the backend function which handles AI generation server-side
 */
export async function generateTodayEventsSummary(options?: { limit?: number; forceRefresh?: boolean }): Promise<string> {
  const limit = options?.limit ?? 10
  const forceRefresh = options?.forceRefresh ?? false

  try {
    const functions = getFunctions()
    const generateSummary = httpsCallable<
      { limit: number; forceRefresh: boolean },
      { summary: string; cached: boolean }
    >(functions, 'generateAISummary')

    const result = await generateSummary({ limit, forceRefresh })
    return result.data.summary
  } catch (error) {
    console.error('Error calling generateAISummary function:', error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate summary. Please try again later.'
    )
  }
}
