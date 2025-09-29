import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './auth'

/**
 * Sign in a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with success status and user data or error
 */
export async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: unknown) {
    console.error("Sign-in error:", error)
    const errorCode = (error as { code?: string }).code || 'unknown'
    const userMessage = getAuthErrorMessage(errorCode)
    return { success: false, error: { ...(error as object), userMessage, code: errorCode } }
  }
}

/**
 * Create a new user account with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with success status and user data or error
 */
export async function createUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: unknown) {
    console.error("User creation error:", error)
    const errorCode = (error as { code?: string }).code || 'unknown'
    const userMessage = getAuthErrorMessage(errorCode)
    return { success: false, error: { ...(error as object), userMessage, code: errorCode } }
  }
}

/**
 * Send password reset email to user
 * @param email - User's email address
 * @returns Promise with success status and message
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { 
      success: true, 
      message: "Password reset email sent! Please check your inbox and follow the instructions to reset your password." 
    }
  } catch (error: unknown) {
    console.error("Password reset error:", error)
    const errorCode = (error as { code?: string }).code || 'unknown'
    const userMessage = getPasswordResetErrorMessage(errorCode)
    return { success: false, error: { ...(error as object), userMessage, code: errorCode } }
  }
}

// Function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    // Sign-in errors
    case 'auth/wrong-password':
      return "Incorrect password. Please try again or reset your password."
    case 'auth/user-not-found':
      return "No account found with this email address. Please check your email or create a new account."
    case 'auth/invalid-email':
      return "Please enter a valid email address."
    case 'auth/user-disabled':
      return "This account has been disabled. Please contact support."
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please try again later."
    case 'auth/network-request-failed':
      return "Network error. Please check your connection and try again."
    
    // Account creation errors
    case 'auth/email-already-in-use':
      return "An account with this email already exists. Please sign in instead."
    case 'auth/weak-password':
      return "Password is too weak. Please ensure your password includes at least 8 characters with a mix of uppercase letters, lowercase letters, numbers, and special characters."
    case 'auth/invalid-password':
      return "Password doesn't meet requirements. Please ensure your password includes at least 8 characters with a mix of uppercase letters, lowercase letters, numbers, and special characters."
    case 'auth/password-does-not-meet-requirements':
      return "Password doesn't meet the security requirements. Please ensure your password includes at least 8 characters with a mix of uppercase letters, lowercase letters, numbers, and special characters."
    case 'auth/password-too-short':
      return "Password is too short. Please use at least 8 characters."
    case 'auth/password-too-long':
      return "Password is too long. Please use no more than 30 characters."
    case 'auth/password-missing-uppercase':
      return "Password must contain at least one uppercase letter."
    case 'auth/password-missing-lowercase':
      return "Password must contain at least one lowercase letter."
    case 'auth/password-missing-number':
      return "Password must contain at least one number."
    case 'auth/password-missing-special':
      return "Password must contain at least one special character."
    
    // General errors
    case 'auth/operation-not-allowed':
      return "This sign-in method is not enabled. Please contact support."
    case 'auth/requires-recent-login':
      return "Please sign in again to complete this action."
    case 'auth/credential-already-in-use':
      return "This credential is already associated with a different account."
    case 'auth/invalid-credential':
      return "The provided credentials are invalid. Please check your information."
    case 'auth/account-exists-with-different-credential':
      return "An account already exists with this email but different sign-in method."
    case 'auth/timeout':
      return "Request timed out. Please try again."
    case 'auth/invalid-verification-code':
      return "Invalid verification code. Please try again."
    case 'auth/invalid-verification-id':
      return "Invalid verification. Please try again."
    case 'auth/missing-verification-code':
      return "Please enter the verification code."
    case 'auth/missing-verification-id':
      return "Verification failed. Please try again."
    case 'auth/quota-exceeded':
      return "Too many requests. Please try again later."
    case 'auth/cancelled-popup-request':
      return "Sign-in was cancelled. Please try again."
    case 'auth/popup-blocked':
      return "Sign-in popup was blocked. Please allow popups and try again."
    case 'auth/popup-closed-by-user':
      return "Sign-in was cancelled. Please try again."
    case 'auth/unauthorized-domain':
      return "This domain is not authorized. Please contact support."
    case 'auth/user-token-expired':
      return "Your session has expired. Please sign in again."
    case 'auth/web-storage-unsupported':
      return "Your browser doesn't support required features. Please try a different browser."
    case 'auth/invalid-action-code':
      return "Invalid action code. Please request a new password reset email."
    case 'auth/expired-action-code':
      return "The password reset link has expired. Please request a new one."
    case 'auth/missing-email':
      return "Please enter your email address."
    case 'auth/missing-password':
      return "Please enter your password."
    case 'auth/invalid-phone-number':
      return "Please enter a valid phone number."
    case 'auth/phone-number-already-exists':
      return "This phone number is already in use."
    case 'auth/email-change-needs-verification':
      return "Please verify your new email address before signing in."
    case 'auth/email-change-rate-limited':
      return "Too many email change requests. Please try again later."
    case 'auth/invalid-email-verified':
      return "Please verify your email address before signing in."
    
    // Default fallback
    default:
      return "An unexpected error occurred. Please try again or contact support if the problem persists."
  }
}

// Function to convert Firebase password reset error codes to user-friendly messages
function getPasswordResetErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return "No account found with this email address. Please check your email or create a new account."
    case 'auth/invalid-email':
      return "Please enter a valid email address."
    case 'auth/user-disabled':
      return "This account has been disabled. Please contact support."
    case 'auth/too-many-requests':
      return "Too many password reset attempts. Please try again later."
    case 'auth/network-request-failed':
      return "Network error. Please check your connection and try again."
    case 'auth/operation-not-allowed':
      return "Password reset is not enabled. Please contact support."
    case 'auth/invalid-credential':
      return "Invalid email address. Please check your email and try again."
    case 'auth/timeout':
      return "Request timed out. Please try again."
    case 'auth/quota-exceeded':
      return "Too many requests. Please try again later."
    case 'auth/unauthorized-domain':
      return "This domain is not authorized. Please contact support."
    case 'auth/web-storage-unsupported':
      return "Your browser doesn't support required features. Please try a different browser."
    case 'auth/invalid-action-code':
      return "Invalid password reset link. Please request a new one."
    case 'auth/expired-action-code':
      return "The password reset link has expired. Please request a new one."
    case 'auth/missing-email':
      return "Please enter your email address."
    case 'auth/email-change-needs-verification':
      return "Please verify your email address before requesting a password reset."
    case 'auth/email-change-rate-limited':
      return "Too many password reset requests. Please try again later."
    
    // Default fallback
    default:
      return "Failed to send password reset email. Please try again or contact support if the problem persists."
  }
}
