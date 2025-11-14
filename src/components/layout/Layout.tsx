import React, { useState } from 'react'
import AISummary from '../ai/AISummary'
import Banner from './Banner'
import EventsSection from '../events/EventsSection'
import Sidebar from './Sidebar'
import Weather from '../weather/Weather'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {!sidebarOpen && (
        <button 
          className="menu-toggle-fixed"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      )}
      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Banner */}
        <Banner />

        {/* Scrollable content */}
        <main className="scrollable-content">
          {/* AI Summary Section */}
          <AISummary />
          
          {/* Weather Section */}
          <Weather />
          
          {/* Events Section */}
          <EventsSection />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
