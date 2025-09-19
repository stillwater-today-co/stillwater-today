# Stillwater Today

A modern React application with Firebase integration and automated CI/CD deployment pipeline. This project demonstrates a complete full-stack web application with message submission functionality, real-time database storage, and production-ready deployment workflows.

## 🚀 Features

- **React 19** with TypeScript for type-safe development
- **Firebase Integration** with Firestore database, Authentication, Storage, and Analytics
- **Automated CI/CD Pipeline** with GitHub Actions
- **Multi-Environment Deployments** (Staging & Production)
- **Modern UI** with responsive design and loading states
- **Code Quality** with ESLint, TypeScript strict mode, and proper error handling

## 📋 What This App Does

This application provides a simple message submission form that:
1. Accepts user input through a clean, accessible form
2. Validates and submits messages to Firebase Firestore
3. Provides real-time feedback on submission status
4. Stores messages with timestamps for future retrieval

## 🏗️ Architecture

```
├── src/
│   ├── components/          # Reusable UI components (future)
│   ├── firebase/           # Firebase configuration and services
│   │   ├── config.ts       # Firebase app initialization
│   │   ├── firestore.ts    # Firestore database instance
│   │   ├── auth.ts         # Authentication service
│   │   ├── storage.ts      # Cloud Storage service
│   │   └── index.ts        # Centralized exports
│   ├── pages/              # Application pages/views
│   │   └── Home.tsx        # Main message submission page
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entry point
├── .github/workflows/      # CI/CD automation
│   ├── ci.yml              # Code quality and build checks
│   ├── deploy-staging.yml  # Staging environment deployment
│   └── deploy-prod.yml     # Production environment deployment
├── firebase.json           # Firebase Hosting configuration
└── .firebaserc            # Firebase project and target mapping
```

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Firestore, Auth, Storage, Analytics)
- **Styling**: CSS3 with modern design patterns
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
3. Enable Authentication (optional, for future features)
4. Enable Analytics (optional)
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
}
```

Collection: `messages`

## 🧪 Testing

The application includes:
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint with strict rules
- **Build Verification**: Automated build checks in CI
- **Deployment Testing**: Staging environment for validation

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

- User authentication and profiles
- Message editing and deletion
- Real-time message updates
- Message categories and filtering
- Admin dashboard
- Mobile app with React Native

---

Built with ❤️ using React, Firebase, and modern web technologies.