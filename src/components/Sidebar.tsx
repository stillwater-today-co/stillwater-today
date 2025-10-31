import { signOut } from 'firebase/auth';
import { Mail, Share2, X } from 'lucide-react';
import React, { useState } from 'react';
import { auth } from '../firebase/auth'; // Adjust the import path as necessary

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {

  const [copyMsg, setCopyMsg] = useState('');

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopyMsg('URL copied');
      setTimeout(() => setCopyMsg(''), 1500);
    } catch {
      setCopyMsg('Copy failed');
      setTimeout(() => setCopyMsg(''), 1500);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      onClose()
    }
    catch (error) {
      console.error("Error signing out:", error)
    }
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
          <X size={24} />
        </button>
      </div>
      <div className="sidebar-content">
        {/* Notifications removed as requested */}

        {/* Feedback Section */}
        <div className="sidebar-section">
          <h3>Feedback</h3>
          <a
            className="sidebar-btn"
            href="/feedback"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail size={18} style={{marginRight: 6, verticalAlign: 'middle'}} /> Send Feedback
          </a>
        </div>

        {/* Share Site Option */}
        <div className="sidebar-section">
          <h3>Share Our Site</h3>
          <button
            className="sidebar-btn"
            onClick={handleCopyUrl}
            style={{display: 'flex', alignItems: 'center'}}
          >
            <Share2 size={18} style={{marginRight: 6, verticalAlign: 'middle'}} /> Copy URL
          </button>
          {copyMsg && <div className="copy-msg">{copyMsg}</div>}
        </div>

        {/* Account Section */}
        <div className="sidebar-section">
          <h3>Account</h3>
          <button
            className="sidebar-btn"
            onClick={() => { window.location.href = '/profile' }}
          >
            Profile Settings
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
