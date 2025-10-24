import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail,
  updatePassword
} from 'firebase/auth'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase/auth'

const Profile: React.FC = () => {
  const user = auth.currentUser
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [emailStatus, setEmailStatus] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [passwordStatus, setPasswordStatus] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const clearMessages = () => {
    setStatus('')
    setError('')
    setEmailStatus('')
    setEmailError('')
    setPasswordStatus('')
    setPasswordError('')
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
      // Send a verification email to the user's CURRENT email address to confirm
      // they want to change their account email. Do not require the current
      // password for this step.
      await sendEmailVerification(auth.currentUser)
      setEmailStatus('Verification sent to your current email. Please follow the link there to confirm. After confirming, return and click "Check Verification Status" to proceed.')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code === 'auth/requires-recent-login') {
        setEmailError('Recent login required. Please enter your current password above and try again.')
      } else {
        setEmailError(error?.message || 'Failed to update email')
      }
    }
  }

  const checkVerificationStatus = async () => {
    clearMessages()
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      await auth.currentUser.reload()
      if (auth.currentUser.emailVerified) {
        setEmailVerified(true)
        setEmailStatus('Email verified. You can now enter a new email to update your account.')
      } else {
        setEmailVerified(false)
        setEmailError('Email not verified yet. Please check your inbox and click the verification link.')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setEmailError(error?.message || 'Failed to check verification status')
    }
  }

  const handleApplyNewEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      if (!email) {
        setEmailError('Please enter the new email you want to use.')
        return
      }
      // Attempt to update. If action requires recent login, requireRecentLogin
      // will handle reauthentication if user has provided `currentPassword`.
      await requireRecentLogin(() => updateEmail(auth.currentUser!, email))
      setEmailStatus('Email updated successfully.')
      setEmail('')
      setEmailVerified(false)
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code === 'auth/requires-recent-login') {
        setEmailError('Recent login required. Please enter your current password below and try again.')
      } else {
        setEmailError(error?.message || 'Failed to update email')
      }
    }
  }

  // Removed send verification to current email per requirements

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      await requireRecentLogin(() => updatePassword(auth.currentUser!, newPassword))
      setNewPassword('')
      setConfirmPassword('')
      setPasswordStatus('Password updated')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setPasswordError(error?.message || 'Failed to update password')
    }
  }

  const handleDeleteAccount = async () => {
    clearMessages()
    try {
      if (!auth.currentUser) throw new Error('Not signed in')
      // require the user to enter their current password before deleting
      if (!currentPassword) {
        setError('Please enter your current password to delete your account.')
        return
      }
      // reauthenticate with provided current password
      const cred = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await deleteUser(auth.currentUser)
      setStatus('Account deleted')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code === 'auth/requires-recent-login') {
        setError('Recent login required. Please enter your current password above and try again.')
      } else {
        setError(error?.message || 'Failed to delete account')
      }
    }
  }

  return (
    <div className="profile-page">
      <header className="static-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title">Profile Settings</h1>
        <div>
          <button className="primary" onClick={() => navigate('/')}>Go back to home</button>
        </div>
      </header>

      <main className="scrollable-content">
        <div className="card profile-card">
          <h2>Change Email</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div className="hint">Click to send a verification link to your current account email. After clicking the link in your inbox, return and click "Check Verification Status".</div>
              <div className="actions" style={{ marginTop: 8 }}>
                <button className="primary" onClick={handleUpdateEmail}>Send Verification Email</button>
                <button style={{ marginLeft: 8 }} onClick={checkVerificationStatus}>Check Verification Status</button>
              </div>
            </div>

            {emailVerified && (
              <form onSubmit={handleApplyNewEmail}>
                <div className="field">
                  <label>New Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="field">
                  <label>Current Password (only if prompted)</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password if required"
                  />
                </div>
                <div className="actions">
                  <button type="submit" className="primary">Update Email</button>
                </div>
              </form>
            )}

            {(emailStatus || emailError) && (
              <div style={{ marginTop: 12 }}>
                {emailStatus && <div className="status success">{emailStatus}</div>}
                {emailError && <div className="status error">{emailError}</div>}
              </div>
            )}
          </div>
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
            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <div className="actions">
              <button type="submit" className="primary">Update Password</button>
            </div>
            {(passwordStatus || passwordError) && (
              <div style={{ marginTop: 12 }}>
                {passwordStatus && <div className="status success">{passwordStatus}</div>}
                {passwordError && <div className="status error">{passwordError}</div>}
              </div>
            )}
          </form>
        </div>

        {/* Current password input is prompted inline for sensitive actions (e.g. delete) */}

        <div className="card danger profile-card">
          <h2>Delete Account</h2>
          {!showDeleteConfirm ? (
            <>
              <button className="danger" onClick={() => { setShowDeleteConfirm(true); clearMessages(); }}>Delete Account</button>
              <div className="hint">Click delete to confirm. You will be prompted to enter your current password.</div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to confirm"
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="danger"
                  onClick={async () => {
                    await handleDeleteAccount()
                    setShowDeleteConfirm(false)
                  }}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setCurrentPassword(''); clearMessages(); }}
                >
                  Cancel
                </button>
              </div>
              <div className="hint">Your current password is required to permanently delete your account.</div>
            </div>
          )}
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


