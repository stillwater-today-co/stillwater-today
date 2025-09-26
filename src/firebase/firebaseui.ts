import * as firebaseui from 'firebaseui'
import { EmailAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
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
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  callbacks: {
    signInSuccessWithAuthResult: function(authResult: any) {
      console.log('FirebaseUI Sign-in Success:', authResult)
      return true
    },
    uiShown: function() {
      console.log('FirebaseUI widget is now visible')
    },
    signInFailure: function(error: any) {
      console.error('FirebaseUI Sign-in Failure:', error)
      console.error('Error Code:', error.code)
      console.error('Error Message:', error.message)
    }
  }
}

// Initialize FirebaseUI
export const ui = new firebaseui.auth.AuthUI(auth)

// Debug: Check if FirebaseUI is properly initialized
console.log('FirebaseUI initialized:', ui)
console.log('Auth instance:', auth)
console.log('UI Config:', uiConfig)

// Test function to verify Firebase Auth is working
export async function testFirebaseAuth(email: string, password: string) {
  console.log('Testing Firebase Auth with:', email)
  
  try {
    // Try to sign in first
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("✅ Sign-in successful:", userCredential.user)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    console.error("❌ Sign-in error:", error)
    console.error("Error Code:", error.code)
    console.error("Error Message:", error.message)

    // Handle specific error cases
    switch (error.code) {
      case 'auth/wrong-password':
        console.log("🔑 The password you entered is incorrect. Please try again.")
        break
      case 'auth/user-not-found':
        console.log("👤 No user found with that email address.")
        break
      case 'auth/invalid-email':
        console.log("📧 The email address format is invalid.")
        break
      case 'auth/user-disabled':
        console.log("🚫 Your account has been disabled. Please contact support.")
        break
      case 'auth/too-many-requests':
        console.log("⏰ Too many failed attempts. Please try again later.")
        break
      case 'auth/network-request-failed':
        console.log("🌐 Network error. Please check your connection.")
        break
      default:
        console.log("❓ An unknown error occurred during sign-in:", error.code)
        break
    }
    
    return { success: false, error: error }
  }
}

// Test function to create a new user
export async function testCreateUser(email: string, password: string) {
  console.log('Testing user creation with:', email)
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log("✅ User creation successful:", userCredential.user)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    console.error("❌ User creation error:", error)
    console.error("Error Code:", error.code)
    console.error("Error Message:", error.message)
    return { success: false, error: error }
  }
}
