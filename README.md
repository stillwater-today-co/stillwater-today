# Stillwater Today

A modern React application with Firebase integration and automated CI/CD deployment pipeline. This project demonstrates a complete full-stack web application with user authentication, message submission functionality, real-time database storage, and production-ready deployment workflows.

## 🚀 Features

- **React 19** with TypeScript for type-safe development
- **Firebase Integration** with Firestore database and Authentication
- **User Authentication** with email/password sign-in, account creation, and password reset
- **Modern Dark UI** with glassmorphism effects and responsive design
- **Automated CI/CD Pipeline** with GitHub Actions
- **Multi-Environment Deployments** (Staging & Production)
- **User-Friendly Error Messages** with production-ready feedback
- **Code Quality** with ESLint, TypeScript strict mode, and proper error handling

## 📋 What This App Does

This application provides a complete user experience that:
1. **User Authentication**: Secure sign-in, account creation, and password reset functionality
2. **Message Submission**: Authenticated users can submit messages to Firebase Firestore
3. **Real-time Feedback**: Immediate status updates and user-friendly error messages
4. **Data Storage**: Messages are stored with timestamps and user association
5. **Modern UI**: Beautiful dark theme with responsive design and smooth animations
6. **Password Recovery**: Users can reset their passwords via email when needed

## 🏗️ Architecture

```
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Auth.tsx         # Authentication form component with password reset
│   ├── contexts/            # React context providers
│   │   └── AuthContext.tsx  # User authentication state management
│   ├── firebase/            # Firebase configuration and services
│   │   ├── config.ts        # Firebase app initialization
│   │   ├── firestore.ts     # Firestore database instance
│   │   ├── auth.ts          # Firebase Auth instance
│   │   ├── authService.ts   # Authentication service functions
│   │   └── index.ts         # Centralized exports
│   ├── pages/               # Application pages/views
│   │   └── Home.tsx         # Main message submission page
│   ├── App.tsx              # Root application component
│   └── main.tsx             # Application entry point
├── .github/workflows/      # CI/CD automation
│   ├── ci.yml              # Code quality and build checks
│   ├── deploy-staging.yml  # Staging environment deployment
│   └── deploy-prod.yml     # Production environment deployment
├── firebase.json           # Firebase Hosting configuration
└── .firebaserc            # Firebase project and target mapping
```

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Firestore, Auth)
- **Styling**: CSS3 with modern design patterns and responsive design
- **Build Tool**: Vite for fast development and optimized builds
- **CI/CD**: GitHub Actions
- **Deployment**: Firebase Hosting
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
   git clone <repository-url>
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

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

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
  - Requires manual approval (configurable)
  - Uses production Firebase configuration

### Deployment Workflow

1. **Development**: Work on feature branches
2. **Staging**: Merge to `develop` → Auto-deploy to staging
3. **Production**: Merge to `main` → Auto-deploy to production

### Setting Up Deployment

1. **Create Firebase Hosting sites**
   ```bash
   firebase hosting:sites:create your-staging-site-id
   firebase hosting:sites:create your-prod-site-id
   firebase target:apply hosting staging your-staging-site-id
   firebase target:apply hosting prod your-prod-site-id
   ```

2. **Configure GitHub Environments**
   - Create `staging` and `production` environments
   - Add required secrets for each environment:
     - `FIREBASE_SERVICE_ACCOUNT`
     - `STAGING_FIREBASE_*` / `PRODUCTION_FIREBASE_*` variables

3. **Enable GitHub Actions**
   - Ensure Actions are enabled in repository settings
   - Workflows will run automatically on branch pushes

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication with Email/Password provider
4. Configure password policy in Authentication settings
5. Get your configuration from Project Settings

### Environment Variables

All Firebase configuration is managed through environment variables:

- **Development**: Use `.env` file (not committed to git)
- **CI/CD**: Managed through GitHub Secrets
- **Production**: Injected during build process

## 📊 Firebase Data Structure

Messages are stored in Firestore with the following structure:

```typescript
interface Message {
  text: string;           // The user's message
  createdAt: Date;        // Timestamp of submission
  userId?: string;        // Associated user ID (if authenticated)
}
```

Collection: `messages`

## 🔐 Authentication

The application includes a complete authentication system:

- **Sign In**: Existing users can sign in with email and password
- **Sign Up**: New users can create accounts with email and password
- **Password Reset**: Users can reset their passwords via email when needed
- **Password Policy**: Enforced through Firebase Authentication
- **User State**: Managed through React Context for app-wide access
- **Error Handling**: User-friendly error messages for all authentication scenarios

## 🧪 Testing

The application includes:
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint with strict rules
- **Build Verification**: Automated build checks in CI
- **Deployment Testing**: Staging environment for validation

## 🧹 Code Quality & Cleanup

The codebase has been optimized for maintainability and performance:
- **Removed Unused Dependencies**: Eliminated unused Firebase services (Storage, Analytics)
- **Clean Architecture**: Streamlined Firebase configuration and exports
- **Consistent Styling**: Replaced inline styles with CSS classes for better maintainability
- **Optimized Imports**: Only importing what's actually used
- **Modern Patterns**: Following React best practices and TypeScript strict mode

## 🔒 Security

- Environment variables for sensitive configuration
- Firebase Security Rules (configure in Firebase Console)
- HTTPS-only deployment through Firebase Hosting
- Input validation and sanitization

## 📈 Performance

- **Vite**: Fast development and optimized production builds
- **Code Splitting**: Automatic with Vite
- **Firebase**: Global CDN for fast content delivery
- **Modern JavaScript**: Tree-shaking for minimal bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the GitHub Actions logs for deployment errors
2. Verify Firebase configuration and permissions
3. Ensure all environment variables are set correctly
4. Check browser console for client-side errors

## 🚀 Future Enhancements

- Message editing and deletion
- Real-time message updates
- Message categories and filtering
- User profiles and settings
- Admin dashboard
- Mobile app with React Native
- Social features (likes, comments)

---

Built with ❤️ using React, Firebase, and modern web technologies.