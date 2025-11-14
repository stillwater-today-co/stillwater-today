# Stillwater Today

A modern community information platform for Stillwater, Oklahoma, built with React and Firebase. This application provides residents with AI-generated daily summaries, real-time weather updates from the National Weather Service, and curated local events from Oklahoma State University.

## 🚀 Features

- **AI-Powered Daily Summaries** - Intelligent briefings combining weather and events
  - Uses Google Gemini 2.0 Flash to summarize top-ranked OSU events
  - Includes concise weather overview with clothing suggestions
  - Daily motivational quotes from DummyJSON API
- **Real-Time Weather** - Integration with National Weather Service API
  - Current conditions with detailed metrics (temperature, humidity, wind, visibility)
  - 5-day forecast with hourly breakdown
  - Automatic icon mapping for weather conditions
  - Caching for improved performance
- **OSU Events Integration** - Real-time events from Oklahoma State University
  - Ranked events from events.okstate.edu API
  - Filter by date (all, today, upcoming) and category
  - Event favorites system for authenticated users
  - Pagination and search capabilities
- **User Authentication** - Secure Firebase Auth integration
  - Email/password authentication
  - Password reset functionality
  - Profile management and account deletion
  - Protected routes and user-specific data
- **Favorites System** - Save and manage favorite events
  - Persistent storage in Firestore
  - Automatic cleanup of expired events
  - Real-time synchronization across sessions
- **Feedback System** - Community input and suggestions
- **Modern Dark Theme** - Black/gray color scheme with orange accents (#f97316)
- **Responsive Design** - Mobile-first approach, works on all devices
- **Firebase Integration** - Firestore, Authentication, Cloud Functions
- **Automated CI/CD** - GitHub Actions deployment pipeline

## 📋 What This App Does

Stillwater Today serves as a community hub that:
1. **Daily Briefings**: AI-generated summaries combining weather forecasts and OSU events
2. **Weather Updates**: Real-time weather data from the National Weather Service for Stillwater, OK
3. **Event Discovery**: Browse and filter events happening at Oklahoma State University
4. **Event Favorites**: Save events to your personal favorites list (requires authentication)
5. **Community Engagement**: User feedback system
6. **Secure Access**: Email/password authentication with profile management

## 🏗️ Architecture

### Project Structure

```
├── src/
│   ├── components/              # UI Components (organized by feature)
│   │   ├── ai/                 # AI Summary components
│   │   │   └── AISummary.tsx   # Daily briefing with weather + events + quote
│   │   ├── auth/               # Authentication components
│   │   │   └── Auth.tsx        # Sign in/up forms with password reset
│   │   ├── events/             # Event-related components
│   │   │   ├── EventsSection.tsx     # Main events display with filters
│   │   │   ├── FavoritesSection.tsx  # User's saved favorite events
│   │   │   └── Pagination.tsx        # Pagination controls
│   │   ├── layout/             # Layout components
│   │   │   ├── Layout.tsx      # Main page layout wrapper
│   │   │   ├── Sidebar.tsx     # Settings and navigation sidebar
│   │   │   └── Banner.tsx      # Site header banner
│   │   └── weather/            # Weather components
│   │       └── Weather.tsx     # Weather widget with NWS integration
│   ├── pages/                  # Route pages
│   │   ├── Home.tsx           # Main dashboard (uses Layout)
│   │   ├── Profile.tsx        # User profile and settings
│   │   └── Feedback.tsx       # User feedback form
│   ├── services/               # External API integrations
│   │   ├── briefingService.ts # Firebase Cloud Function client for AI summaries
│   │   ├── eventsService.ts   # OSU Events API integration
│   │   ├── quotesService.ts   # DummyJSON quotes API
│   │   └── weatherService.ts  # National Weather Service API
│   ├── lib/                    # Core libraries
│   │   └── firebase/           # Firebase configuration and utilities
│   │       ├── config.ts       # Firebase initialization (uses env vars)
│   │       ├── auth.ts         # Auth instance
│   │       ├── authService.ts  # Sign in/up/reset functions
│   │       ├── firestore.ts    # Firestore operations (users, favorites)
│   │       ├── feedbacks.ts    # Feedback storage
│   │       ├── storage.ts      # Firebase Storage instance
│   │       └── index.ts        # Exports
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.ts      # Auth context interface
│   │   └── AuthContext.tsx     # Auth state provider
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useFavorites.ts    # Favorites management hook
│   ├── styles/                 # Global styles
│   │   ├── App.css            # Main application styles
│   │   └── index.css          # Base styles and resets
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx               # Application entry point
│   └── vite-env.d.ts          # TypeScript declarations
├── functions/                  # Firebase Cloud Functions (server-side)
│   ├── src/
│   │   └── index.ts           # AI summary generation function
│   ├── package.json           # Functions dependencies
│   ├── tsconfig.json          # TypeScript config for functions
│   └── README.md              # Functions documentation
├── public/                     # Static assets
│   ├── banner.png             # Site banner image
│   ├── favicon.svg            # Browser icon (SVG)
│   └── favicon.jpg            # Browser icon (JPG fallback)
├── .github/workflows/          # CI/CD automation
│   ├── ci.yml                 # Build and test checks
│   ├── deploy-staging.yml     # Staging deployment
│   └── deploy-prod.yml        # Production deployment
├── firebase.json              # Firebase hosting & functions config
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
└── .env                       # Environment variables (gitignored)
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks and suspense
- **TypeScript** - Type-safe code throughout
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

### Styling
- **CSS3** - Custom styles with modern features
- **Dark Theme** - Black/gray palette with orange accents (#f97316)
- **Responsive Design** - Mobile-first approach

### Backend & Services
- **Firebase**
  - Firestore - NoSQL database for users, favorites, feedback
  - Authentication - Email/password auth
  - Cloud Functions - Server-side AI summary generation
  - Hosting - Static site hosting with CDN
- **National Weather Service API** - Real-time weather data
- **OSU Events API** - Oklahoma State University events
- **DummyJSON API** - Daily motivational quotes
- **Google Gemini 2.0 Flash** - AI-powered event summarization

### Development & Deployment
- **ESLint** - Code quality and consistency
- **TypeScript Strict Mode** - Maximum type safety
- **GitHub Actions** - CI/CD pipeline
- **Firebase CLI** - Deployment and functions management

## 🚦 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Firebase project with:
  - Firestore database enabled
  - Authentication (Email/Password) enabled
  - Cloud Functions enabled
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/stillwater-today-co/stillwater-today.git
   cd stillwater-today
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase Functions**
   ```bash
   cd functions
   npm install
   ```
   
   Create a `.env` file in the `functions/` directory:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_key
   ```
   
   Get your Gemini API key from: https://aistudio.google.com/app/apikey

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Functions Local Development (Optional)

To test Firebase Functions locally:

1. **Start the Firebase emulator**
   ```bash
   cd functions
   npm run serve
   ```

The emulator automatically loads environment variables from `.env` file.

See `functions/README.md` for detailed function documentation.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🌐 Deployment

This project uses automated deployment with GitHub Actions:

### Environments

- **Staging**: https://stillwater-today-staging.web.app
  - Deploys automatically on push to `develop` branch
  - Uses staging Firebase configuration

- **Production**: https://stillwater-today-prod.web.app
  - Deploys automatically on push to `main` branch
  - Uses production Firebase configuration

### Deployment Workflow

1. **Development**: Work on feature branches
2. **Staging**: Merge to `develop` → Auto-deploy to staging
3. **Production**: Merge to `main` → Auto-deploy to production

## 🌤️ Weather Integration

The application integrates with the National Weather Service API:

### Features
- **Current Conditions**: Temperature, weather conditions, wind speed/direction
- **Detailed Metrics**: Humidity, visibility, barometric pressure
- **7-Day Forecast**: Extended weather outlook with daily highs/lows
- **Smart Icon Mapping**: Automatic weather condition icon selection
- **Data Caching**: Client-side caching to minimize API calls

### Location
- **Stillwater, Oklahoma**
- Coordinates: 36.1156° N, 97.0584° W
- Grid: TLX 33,91
- Station: KSWO (Stillwater Regional Airport)

### API Details
- Base URL: `https://api.weather.gov`
- No API key required (public API)
- Data updated every hour
- Forecast updates twice daily

## 🎓 Events Integration

Events are sourced from Oklahoma State University's public events API:

### Features
- **Ranked Events**: Top events sorted by university ranking algorithm
- **Date Filtering**: View all events, today's events, or upcoming events
- **Category Filtering**: Filter by event categories (academic, athletic, cultural, etc.)
- **Event Favorites**: Save events to your personal list (requires login)
- **Search & Pagination**: Browse large event catalogs efficiently
- **Real-time Updates**: Events refresh automatically

### API Details
- Source: `https://events.okstate.edu/api/2/events`
- Filters: Date range, ranking, categories
- Limit: 20 events per fetch
- Caching: Client-side event cache for performance

## 🤖 AI Daily Summary

The application generates intelligent daily summaries using a **Firebase Cloud Function**:

### Features
- **Weather Lead**: 2-3 sentence weather summary with clothing suggestion
- **Events Summary**: Cohesive paragraph covering top 10 OSU events
- **Daily Quote**: Motivational quote from DummyJSON API (1,453 quotes available)
- **Server-side Generation**: Secure API key management
- **Automatic Caching**: Summaries cached for 1 hour in Firestore
- **Smart Bridging**: Natural transition between weather and events

### Technical Details
- **Model**: Google Gemini 2.0 Flash (experimental)
- **Implementation**: Firebase Cloud Function (`generateAISummary`)
- **Runtime**: Node.js 20
- **API**: `@google/generative-ai` npm package
- **Caching**: Firestore `briefings/{date}` collection
- **Events Source**: OSU Events API with ranking
- **Quotes Source**: DummyJSON deterministic quote selection

### Benefits
- 🔒 **Security**: API keys never exposed to clients
- 💰 **Cost Control**: Server-side caching reduces API calls
- 📊 **Monitoring**: Cloud Functions logging and metrics
- ⚡ **Performance**: Cached responses for instant loading
- 🔄 **Reliability**: Built-in retry and error handling

See `FIREBASE_FUNCTIONS_MIGRATION.md` for migration details and `functions/README.md` for function documentation.

## 📊 Firebase Data Structure

### Users Collection (`users/{uid}`)
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  favoriteEvents: number[];  // Array of event IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Briefings Collection (`briefings/{date}`)
```typescript
interface Briefing {
  date: string;              // YYYY-MM-DD format
  summaryText: string;       // Full AI-generated summary
  createdAt: Timestamp;
  eventCount: number;        // Number of events summarized
}
```

### Feedbacks Collection (`feedbacks/{id}`)
```typescript
interface Feedback {
  userId: string;
  message: string;
  createdAt: string;         // ISO timestamp
}
```

## 🎨 Design System

### Color Palette
- **Primary Background**: Black (#0a0a0a)
- **Secondary Background**: Dark Gray (#1a1a1a)
- **Accent**: Orange (#f97316) and variants
- **Text Primary**: Light gray (#f1f5f9)
- **Text Secondary**: Medium gray (#cbd5e1)
- **Borders**: Translucent gray (rgba(71, 85, 105, 0.3))

### Key UI Components
- **Glassmorphism Cards**: Frosted glass effect with backdrop blur
- **Gradient Overlays**: Subtle gradients for depth
- **Hover States**: Smooth transitions and scale effects
- **Loading States**: Shimmer animations and spinners
- **Responsive Grid**: Flexbox and grid layouts

### Typography
- **Headings**: Montserrat (800 weight)
- **Body**: Inter (400/600 weight)
- **Monospace**: Consolas, Monaco for code

## 🔐 Authentication & Security

### Firebase Authentication
- **Email/Password**: Primary authentication method
- **Password Reset**: Email-based recovery flow
- **Session Management**: Persistent sessions with auto-refresh
- **Protected Routes**: Route guards for authenticated content

### Security Measures
- ✅ Environment variables for all sensitive configuration
- ✅ Firebase Security Rules for Firestore access control
- ✅ HTTPS-only deployment via Firebase Hosting
- ✅ .gitignore protecting `.env` and sensitive files
- ✅ No hardcoded API keys or secrets in code
- ✅ Client-side validation with server-side enforcement
- ✅ Rate limiting and caching to prevent abuse

### Firestore Security Rules
- Users can only read/write their own profile data
- Favorites are scoped to authenticated users
- Briefings are read-only for clients
- Feedback can be created by authenticated users

## 📈 Performance Optimizations

- **Vite Build Tool**: Fast HMR and optimized production builds
- **Code Splitting**: Automatic chunking by route
- **Image Optimization**: Compressed banner and favicons
- **API Caching**: 
  - Weather data cached client-side (1 hour)
  - Events cached client-side (session)
  - AI summaries cached server-side (1 hour)
- **Firebase CDN**: Global content delivery network
- **Lazy Loading**: Components loaded on demand
- **Debounced Requests**: Prevent excessive API calls

## 🧪 Testing & Quality

- **TypeScript**: Full type coverage with strict mode
- **ESLint**: React and TypeScript linting rules
- **Build Verification**: CI checks on every push
- **Staging Environment**: Pre-production testing
- **Error Boundaries**: Graceful error handling
- **Console Logging**: Development debugging

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add TypeScript types for new code
   - Update documentation as needed
4. **Run quality checks**
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** to the `develop` branch

### Code Style Guidelines
- Use TypeScript for all new code
- Follow React functional component patterns
- Use hooks for state management
- Write descriptive variable and function names
- Add comments for complex logic
- Keep components focused and single-responsibility

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support & Troubleshooting

### Common Issues

**Build Failures**
- Ensure Node.js 20+ is installed
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check for TypeScript errors with `npm run build`

**Firebase Connection Issues**
- Verify `.env` file contains all required variables
- Check Firebase console for service status
- Ensure Firestore and Auth are enabled in Firebase project

**Function Deployment Issues**
- Verify `GEMINI_API_KEY` is set in Functions config
- Check Functions logs in Firebase console
- Ensure Node.js 20 runtime is specified

**Weather Data Not Loading**
- National Weather Service API is free but can be slow
- Check browser console for API errors
- Verify network connection

### Getting Help
- 📋 Check GitHub Issues for known problems
- 🔥 Review Firebase console for backend errors
- 🐛 Check browser console for client-side errors
- 📖 Read `FIREBASE_FUNCTIONS_MIGRATION.md` for function setup

## 🚀 Future Enhancements

- [ ] Real-time event submissions from community members
- [ ] Push notifications for important updates and favorites
- [ ] Advanced weather visualizations and radar maps
- [ ] Event calendar view with iCal export
- [ ] Social media sharing for events
- [ ] User event reviews and ratings
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for content moderation
- [ ] Email digest subscriptions
- [ ] Enhanced search with fuzzy matching
- [ ] Event categories and tags
- [ ] Location-based event recommendations

---

**Built with ❤️ for the Stillwater, Oklahoma community.**

**Team**: OSU CS Capstone Project 2025
