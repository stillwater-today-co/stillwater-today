import * as firebaseui from 'firebaseui'
import { EmailAuthProvider } from 'firebase/auth'
import { auth } from './auth'

// Configure FirebaseUI
export const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/',
  signInOptions: [
    {
      provider: EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
    }
  ],
  callbacks: {
    signInSuccessWithAuthResult: function() {
      // User successfully signed in
      return true
    },
    uiShown: function() {
      // The widget is rendered
    }
  }
}

// Initialize FirebaseUI
export const ui = new firebaseui.auth.AuthUI(auth)
