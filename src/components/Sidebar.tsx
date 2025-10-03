import React, { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    notifications: 'all',
    summaryLength: 'medium',
    eventsLimit: '10',
    dataSources: {
      localNews: true,
      events: true,
      weather: false
    }
  })

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    if (key === 'dataSources') {
      setPreferences(prev => ({
        ...prev,
        dataSources: {
          ...prev.dataSources,
          [value as string]: !prev.dataSources[value as keyof typeof prev.dataSources]
        }
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  const handleSignOut = () => {
    // This would typically call a sign out function from your auth context
    console.log('Sign out clicked')
    onClose()
  }
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Settings & Preferences</h2>
        <button 
          className="close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>User Preferences</h3>
          <div className="preference-item">
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme" 
              className="preference-select"
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div className="preference-item">
            <label htmlFor="notifications">Notifications</label>
            <select 
              id="notifications" 
              className="preference-select"
              value={preferences.notifications}
              onChange={(e) => handlePreferenceChange('notifications', e.target.value)}
            >
              <option value="all">All</option>
              <option value="important">Important Only</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Display Settings</h3>
          <div className="preference-item">
            <label htmlFor="summary-length">Summary Length</label>
            <select 
              id="summary-length" 
              className="preference-select"
              value={preferences.summaryLength}
              onChange={(e) => handlePreferenceChange('summaryLength', e.target.value)}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          
          <div className="preference-item">
            <label htmlFor="events-limit">Events to Show</label>
            <select 
              id="events-limit" 
              className="preference-select"
              value={preferences.eventsLimit}
              onChange={(e) => handlePreferenceChange('eventsLimit', e.target.value)}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Data Sources</h3>
          <div className="preference-item">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={preferences.dataSources.localNews}
                onChange={() => handlePreferenceChange('dataSources', 'localNews')}
              />
              <span className="checkmark"></span>
              Local News
            </label>
          </div>
          
          <div className="preference-item">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={preferences.dataSources.events}
                onChange={() => handlePreferenceChange('dataSources', 'events')}
              />
              <span className="checkmark"></span>
              Events
            </label>
          </div>
          
          <div className="preference-item">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={preferences.dataSources.weather}
                onChange={() => handlePreferenceChange('dataSources', 'weather')}
              />
              <span className="checkmark"></span>
              Weather
            </label>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Account</h3>
          <button className="sidebar-btn" onClick={() => console.log('Profile Settings clicked')}>
            Profile Settings
          </button>
          <button className="sidebar-btn" onClick={() => console.log('Privacy Settings clicked')}>
            Privacy Settings
          </button>
          <button className="sidebar-btn danger" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
