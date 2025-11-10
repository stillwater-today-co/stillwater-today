# Firebase Functions Migration Guide

This document describes the migration of AI summary generation from client-side to Firebase Cloud Functions.

## Overview

Previously, the AI summary generation was handled entirely on the client side using the Gemini API. This approach had several limitations:
- Exposed API keys in client code
- Required client-side API calls with potential CORS issues
- No server-side caching capabilities
- Limited ability to control costs and rate limiting

The new implementation uses Firebase Cloud Functions to handle all AI generation server-side.

## Changes Made

### 1. Firebase Functions Setup

**New Files:**
- `functions/package.json` - Node.js dependencies for functions
- `functions/tsconfig.json` - TypeScript configuration for functions
- `functions/src/index.ts` - Main function implementation
- `functions/.gitignore` - Ignore build artifacts and node_modules
- `functions/README.md` - Documentation for functions

**Updated Files:**
- `firebase.json` - Added functions configuration

### 2. Client-Side Changes

**Updated Files:**
- `src/briefing/briefingService.ts` - Simplified to call Firebase Function instead of direct API calls

**What Changed:**
- Removed all AI generation logic from client
- Removed direct Gemini API integration from client
- Now uses `httpsCallable` to invoke the Cloud Function
- Cleaner, simpler client code (~220 lines removed)

### 3. Dependencies

**Client-Side (`package.json`):**
- Keep `@google/generative-ai` if used elsewhere, or remove if only used for summaries
- Firebase SDK already includes `getFunctions` and `httpsCallable`

**Functions (`functions/package.json`):**
- Added `@google/generative-ai` - For AI generation
- Added `firebase-functions` - Cloud Functions SDK
- Added `firebase-admin` - Admin SDK for Firestore access

## Configuration Required

### 1. Set Gemini API Key (Server-Side)

The API key is now stored server-side in a `.env` file:

```bash
cd functions
echo 'GEMINI_API_KEY="YOUR_GEMINI_API_KEY"' > .env
```

Or manually create `functions/.env` with:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Remove Client-Side API Key (Optional)

You can remove `VITE_GEMINI_API_KEY` from your `.env` files if it's no longer needed.

### 3. Install Function Dependencies

```bash
cd functions
npm install
```

### 4. Deploy Functions

```bash
firebase deploy --only functions
```

## Local Development

### Running Locally

1. Ensure `.env` file exists in `functions/` directory with your `GEMINI_API_KEY`

2. Start the Firebase emulator:
```bash
cd functions
npm run serve
```

3. (Optional) Update client to point to local emulator:
```typescript
// In your Firebase config
if (import.meta.env.DEV) {
  connectFunctionsEmulator(getFunctions(), "localhost", 5001);
}
```

The emulator automatically loads environment variables from the `.env` file.

## Benefits of This Migration

1. **Security**: API keys are no longer exposed to clients
2. **Caching**: Server-side caching reduces API costs and improves performance
3. **Rate Limiting**: Easier to implement server-side rate limiting
4. **Cost Control**: Better monitoring and control of AI API usage
5. **Scalability**: Firebase automatically scales functions based on demand
6. **Reliability**: Built-in retry logic and error handling
7. **Monitoring**: Access to detailed logs and metrics in Firebase Console

## Client Usage

The client-side API remains the same:

```typescript
import { generateTodayEventsSummary } from '../briefing/briefingService'

// Get cached summary or generate new one
const summary = await generateTodayEventsSummary({ limit: 10, forceRefresh: false })

// Force refresh
const freshSummary = await generateTodayEventsSummary({ limit: 10, forceRefresh: true })
```

## Caching Strategy

- Summaries are cached in Firestore (`briefings/{date}` collection)
- Cache is valid for 1 hour
- `forceRefresh: true` bypasses cache
- Cache key is based on date (one summary per day)

## Troubleshooting

### Function not found error

Make sure functions are deployed:
```bash
firebase deploy --only functions
```

### API key not configured error

Ensure you have a `.env` file in the `functions/` directory:
```bash
cd functions
echo 'GEMINI_API_KEY="YOUR_KEY"' > .env
```

Then redeploy:
```bash
firebase deploy --only functions
```

### Weather data not found

Ensure the weather service is populating `weather/current` in Firestore.

### CORS issues

Cloud Functions automatically handle CORS for Firebase callable functions.

## Rollback Plan

If you need to rollback to client-side generation:

1. Restore the old `src/briefing/briefingService.ts` from git history
2. Add back `VITE_GEMINI_API_KEY` to environment
3. Client code will work as before

However, it's recommended to fix issues with the Cloud Function approach rather than rollback.

