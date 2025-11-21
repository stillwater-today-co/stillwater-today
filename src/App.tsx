import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Auth from './components/auth/Auth'
import { AuthProvider } from './contexts/auth'
import { useAuth } from './hooks/useAuth'
import Feedback from './pages/Feedback'
import Home from './pages/Home'
import Profile from './pages/Profile'
import './styles/App.css'


function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/profile" element={user ? <Profile /> : <Auth />} />
      <Route path="/*" element={user ? <Home /> : <Auth />} />
    </Routes>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
