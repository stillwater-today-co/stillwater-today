# Stillwater Today

A modern community information platform for Stillwater, Oklahoma, built with React and Firebase. This application provides residents with daily AI-generated summaries, real-time weather updates from the National Weather Service, and curated local events and activities.

## 🚀 Features

- **AI-Powered Daily Summaries** - Intelligent briefings of local news and happenings
  - Uses Google Gemini 2.0 Flash (exp) to summarize top-ranked OSU events for today
  - Prepends a concise, 2-sentence weather overview with a clothing suggestion
- **Real-Time Weather** - Integration with National Weather Service API for Stillwater
  - Current conditions with detailed metrics
  - 5-day forecast with hourly updates
  - Humidity, wind, visibility, and more
- **Events & Activities** - Curated local events with filtering options
- **User Profiles** - Personalized settings and preferences
- **Feedback System** - Community input and suggestions
- **Modern Dark Theme** - Black/gray color scheme with orange accents
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Firebase Integration** - Real-time database, authentication, and cloud storage
- **Automated CI/CD** - GitHub Actions deployment pipeline

## 📋 What This App Does

Stillwater Today serves as a community hub that:
1. **Daily Briefings**: AI-generated summaries of important local information
2. **Weather Updates**: Real-time weather data from the National Weather Service
3. **Event Discovery**: Find and explore local events and activities
4. **Community Engagement**: User feedback and profile management
5. **Secure Access**: Email/password authentication with account management
6. **Personalization**: Customizable preferences and display settings

## 🏗️ Architecture

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AISummary.tsx    # Daily AI-generated summary display
│   │   ├── Weather.tsx      # Weather widget with NWS integration
│   │   ├── EventsSection.tsx # Local events and activities
│   │   ├── Layout.tsx       # Main page layout with sidebar
│   │   ├── Sidebar.tsx      # Settings and preferences panel
│   │   ├── Banner.tsx       # Site banner/header
│   │   └── Auth.tsx         # Authentication forms
│   ├── pages/               # Application pages
│   │   ├── Home.tsx         # Main dashboard
│   │   ├── Profile.tsx      # User profile management
│   │   └── Feedback.tsx     # User feedback form
│   ├── services/            # External API integrations
│   │   └── weatherService.ts # National Weather Service API
│   ├── briefing/            # AI summary integration
│   │   └── briefingService.ts # Client for AI summary Cloud Function
│   ├── firebase/            # Firebase configuration
│   │   ├── config.ts        # Firebase initialization
│   │   ├── firestore.ts     # Database operations
│   │   ├── auth.ts          # Authentication
│   │   ├── users.ts         # User data management
│   │   ├── events.ts        # Events storage
│   │   ├── weather.ts       # Weather data caching
│   │   ├── briefs.ts        # Daily summaries
│   │   └── feedbacks.ts     # User feedback
│   ├── contexts/            # React context providers
│   │   └── AuthContext.tsx  # User authentication state
│   └── hooks/               # Custom React hooks
│       └── useAuth.ts       # Authentication hook
├── functions/               # Firebase Cloud Functions (server-side)
│   ├── src/
│   │   └── index.ts        # AI summary generation function
│   ├── package.json        # Functions dependencies
│   ├── tsconfig.json       # TypeScript config for functions
│   └── README.md           # Functions documentation
├── public/                  # Static assets
│   ├── banner.png          # Site banner image
│   ├── favicon.ico         # Browser icon
│   └── ...                 # Additional assets
├── .github/workflows/      # CI/CD automation
│   ├── ci.yml              # Build and test checks
│   ├── deploy-staging.yml  # Staging deployment
│   └── deploy-prod.yml     # Production deployment
└── firebase.json           # Firebase hosting & functions config
```

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS3 with modern dark theme (black/gray/orange)
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Functions)
- **APIs**: National Weather Service (NWS) for weather data
- **AI**: Google Gemini 2.0 Flash (experimental) for daily summaries
  - Server-side generation via Firebase Cloud Functions
  - Automatic caching and rate limiting
- **Build Tool**: Vite for fast development and builds
- **CI/CD**: GitHub Actions
- **Deployment**: Firebase Hosting & Cloud Functions
- **Code Quality**: ESLint, TypeScript strict mode

## 🚦 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Firebase project with Firestore enabled
- GitHub repository for CI/CD

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
   ```bash
   echo 'GEMINI_API_KEY="your_google_ai_studio_key"' > .env
   cd ..
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

1. **Ensure you have created the `.env` file** in `functions/` directory with your `GEMINI_API_KEY`

2. **Start the Firebase emulator**
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

The application integrates with the National Weather Service API to provide:

- **Current Conditions**: Temperature, conditions, wind, humidity
- **Hourly Forecast**: Detailed hourly predictions
- **7-Day Forecast**: Extended weather outlook
- **Severe Weather Alerts**: Real-time weather warnings
- **Location-Specific**: Data for Stillwater, Oklahoma (36.1156° N, 97.0584° W)

Weather data is cached in Firebase to improve performance and reduce API calls.

## 🤖 AI Daily Summary

The application generates intelligent daily summaries using a **Firebase Cloud Function** (server-side):

### Features
- Summarizes the top 10 ranked OSU events for the current day using the OSU Events API ranked query
- Adds a 2-sentence weather lead (temperature as an exact number; qualitative for other metrics) with a clothing suggestion
- **Server-side generation** ensures API key security and enables caching
- **Automatic caching** - Summaries are cached for 1 hour to reduce API costs
- **Force refresh** option available for users who want the latest data

### Technical Details
- Model: Google Gemini 2.0 Flash (experimental) via `@google/generative-ai`
- Implementation: Firebase Cloud Function (`generateAISummary`)
- Runtime: Node.js 20
- Configuration: Environment variables via `.env` file in `functions/` directory
- Caching: Stored in Firestore `briefings/{date}` collection
- Events source: `https://events.okstate.edu/api/2/events?start=YYYY-MM-DD&days=1&pp=20&sort=ranking&direction=desc&distinct=true&for=main`

### Benefits of Cloud Functions Approach
- 🔒 **Security**: API keys never exposed to clients
- 💰 **Cost Control**: Server-side caching reduces API calls
- 📊 **Monitoring**: Access to detailed logs and metrics
- ⚡ **Performance**: Cached responses for faster loading
- 🔄 **Reliability**: Built-in retry logic and error handling

See `FIREBASE_FUNCTIONS_MIGRATION.md` for migration details and `functions/README.md` for function documentation.

## 📊 Firebase Data Structure

### Users Collection
```typescript
interface User {
  email: string;
  displayName?: string;
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    notifications: 'all' | 'important' | 'none';
    summaryLength: 'short' | 'medium' | 'long';
    eventsLimit: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Events Collection
```typescript
interface Event {
  title: string;
  date: string;
  location: string;
  type: 'Community' | 'Government' | 'Arts & Culture' | 'Sports';
  description: string;
  createdAt: Date;
}
```

### Weather Cache
```typescript
interface WeatherData {
  current: CurrentConditions;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  lastUpdated: Date;
}
```

### Feedbacks Collection
```typescript
interface Feedback {
  userId: string;
  message: string;
  category: string;
  createdAt: Date;
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Black (#0a0a0a) and Dark Gray (#1a1a1a)
- **Accent**: Orange (#f97316) and variants
- **Text**: Light gray (#cbd5e1, #e2e8f0, #f1f5f9)
- **Borders**: Translucent gray (rgba(71, 85, 105, 0.3))

### Components
- **Banner**: 1000px wide responsive header with site branding
- **Content Cards**: Glassmorphism effect with backdrop blur
- **Sidebar**: Fixed position settings panel with preferences
- **Weather Widget**: Real-time data display with visual indicators
- **Event Cards**: Grid layout with filtering and categorization

## 🔐 Authentication

- **Sign In**: Email/password authentication
- **Sign Up**: New user account creation
- **Password Reset**: Email-based password recovery
- **User Profiles**: Customizable settings and preferences
- **Protected Routes**: Secure access to authenticated features

## 🧪 Testing

- **Type Safety**: Full TypeScript coverage
- **ESLint**: Strict code quality rules
- **Build Verification**: Automated CI checks
- **Staging Environment**: Pre-production testing

## 🔒 Security

- Environment variables for sensitive configuration
- Firebase Security Rules for data access control
- HTTPS-only deployment
- Input validation and sanitization
- Secure API key management

## 📈 Performance

- **Vite**: Lightning-fast development and optimized builds
- **Code Splitting**: Automatic chunking for faster loads
- **Image Optimization**: Compressed assets (banner, favicons)
- **API Caching**: Weather data cached to reduce API calls
- **Firebase CDN**: Global content delivery network

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Test thoroughly
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request to `develop` branch

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Check GitHub Issues for known problems
- Review Firebase console for backend errors
- Verify environment variables are set correctly
- Check browser console for client-side errors

## 🚀 Future Enhancements

- [ ] OpenAI integration for AI-generated summaries
- [ ] Real-time event submissions from community
- [ ] Push notifications for important updates
- [ ] Advanced weather visualizations and maps
- [ ] Community forum and discussions
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for content management
- [ ] Social media integration
- [ ] Email newsletter subscriptions
- [ ] Calendar integration for events

---

Built with ❤️ for the Stillwater, Oklahoma community.
