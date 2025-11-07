# Stillwater Today - Firebase Functions

This directory contains the Firebase Cloud Functions for the Stillwater Today application.

## Functions

### `generateAISummary`

A callable HTTPS function that generates AI-powered daily summaries of OSU events and weather.

**Parameters:**
- `limit` (number, optional, default: 10): Maximum number of events to include
- `forceRefresh` (boolean, optional, default: false): Force regenerate summary even if cached

**Returns:**
- `summary` (string): The generated summary text
- `cached` (boolean): Whether the result was from cache

**Features:**
- Fetches top-ranked OSU events for today
- Retrieves current weather from Firestore
- Uses Google Gemini AI to generate natural language summaries
- Caches results for 1 hour to reduce API calls
- Includes weather information and event details

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

The function requires a Gemini API key. Create a `.env` file in the `functions/` directory:

```bash
cd functions
echo 'GEMINI_API_KEY="YOUR_GEMINI_API_KEY"' > .env
```

Or manually create `functions/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Get your Gemini API key from: https://aistudio.google.com/app/apikey

### 3. Local Development

Your `.env` file is automatically used for local development. Just run the emulator:

```bash
npm run serve
```

The emulator will automatically load environment variables from the `.env` file.

### 4. Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### 5. Deploy

Deploy functions to Firebase (the `.env` file is automatically uploaded):

```bash
npm run deploy
```

Or deploy from the project root:

```bash
firebase deploy --only functions
```

**Note:** Firebase automatically securely uploads your `.env` file during deployment. The environment variables are stored securely in Google Cloud Secret Manager.

## Architecture

The function:
1. Checks Firestore cache for recent summaries (< 1 hour old)
2. If cache miss or force refresh:
   - Fetches weather data from Firestore `weather/current` document
   - Fetches events from OSU Events API
   - Generates AI summary using Google Gemini
   - Caches result in Firestore `briefings/{date}` collection
3. Returns summary to client

## Data Dependencies

- **Firestore Collections:**
  - `weather` - Current weather data (must be populated by weather service)
  - `briefings` - Cached AI summaries

- **External APIs:**
  - OSU Events API: `https://events.okstate.edu/api/2/events`
  - Google Gemini API: For AI text generation

## Error Handling

The function includes comprehensive error handling:
- Missing API key configuration
- Weather data fetch failures (falls back to generic message)
- Events API failures
- AI generation errors
- All errors are logged to Firebase Functions logs

## Monitoring

View logs:

```bash
npm run logs
```

Or in Firebase Console:
- Functions > Logs

