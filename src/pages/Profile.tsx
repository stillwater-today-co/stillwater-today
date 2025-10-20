import React, { useState } from 'react'
import { auth } from '../firebase/auth'
import {
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail
} from 'firebase/auth'

const Profile: React.FC = () => {
  const user = auth.currentUser

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const clearMessages = () => {
    setStatus('')
    setError('')
  }

  const requireRecentLogin = async <T,>(action: () => Promise<T>) => {
    try {
      return await action()
    } catch (e: unknown) {
      const error = e as { code?: string }
      if (error?.code === 'auth/requires-recent-login') {
        if (!user?.email || !currentPassword) {
          throw e
        }
        const cred = EmailAuthProvider.credential(user.email, currentPassword)
        await reauthenticateWithCredential(user, cred)
        return await action()
      }
      throw e
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      // Send verification to the new email and apply change after verification
      await requireRecentLogin(() => verifyBeforeUpdateEmail(auth.currentUser!, email))
      setStatus('Verification sent to new email. Follow the link to confirm.')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code === 'auth/requires-recent-login' && !currentPassword) {
        setError('Please enter your current password above and try again to confirm this change.')
      } else {
        setError(error?.message || 'Failed to update email')
      }
    }
  }

  // Removed send verification to current email per requirements

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      await requireRecentLogin(() => updatePassword(auth.currentUser!, newPassword))
      setNewPassword('')
      setStatus('Password updated')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error?.message || 'Failed to update password')
    }
  }

  const handleDeleteAccount = async () => {
    clearMessages()
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      await requireRecentLogin(() => deleteUser(auth.currentUser!))
      setStatus('Account deleted')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code === 'auth/requires-recent-login' && !currentPassword) {
        setError('Please enter your current password above and try again to delete your account.')
      } else {
        setError(error?.message || 'Failed to delete account')
      }
    }
  }

  return (
    <div className="profile-page">
      <header className="static-header">
        <h1 className="page-title">Profile Settings</h1>
      </header>

      <main className="scrollable-content">
        <div className="card profile-card">
          <h2>Change Email</h2>
          <form onSubmit={handleUpdateEmail}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="actions">
              <button type="submit" className="primary">Send Verification to New Email</button>
            </div>
            <div className="hint">This sends a verification to the entered email and updates after confirmation. Your current password is required for this change.</div>
          </form>
        </div>

        <div className="card profile-card">
          <h2>Change Password</h2>
          <form onSubmit={handleUpdatePassword}>
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="actions">
              <button type="submit" className="primary">Update Password</button>
            </div>
          </form>
        </div>

        <div className="card profile-card">
          <h2>Current Password</h2>
          <div className="field">
            <label>Current Password (for sensitive actions)</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
        </div>

        <div className="card danger profile-card">
          <h2>Delete Account</h2>
          <button className="danger" onClick={handleDeleteAccount}>Delete Account</button>
          <div className="hint">Your current password is required to permanently delete your account.</div>
        </div>

        {(status || error) && (
          <div className="status-area">
            {status && <div className="status success">{status}</div>}
            {error && <div className="status error">{error}</div>}
          </div>
        )}
      </main>
    </div>
  )
}
export default Profile


