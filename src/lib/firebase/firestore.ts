import type { User } from 'firebase/auth'
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { app } from './config'

// Firebase error interface
interface FirebaseError extends Error {
  code?: string
  message: string
}

export const firestore = getFirestore(app)

// User profile interface
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  favoriteEvents: number[] // Array of event IDs
  createdAt: Date
  updatedAt: Date
}

// Create or update user profile
export async function createUserProfile(user: User): Promise<UserProfile> {
  try {
    
    if (!user.uid) {
      throw new Error('User UID is required')
    }

    const userRef = doc(firestore, 'users', user.uid)
    const userDoc = await getDoc(userRef)

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      favoriteEvents: userDoc.exists() ? (userDoc.data().favoriteEvents || []) : [],
      createdAt: userDoc.exists() ? userDoc.data().createdAt.toDate() : new Date(),
      updatedAt: new Date()
    }

    
    // Create document data without undefined values
    const docData: Record<string, unknown> = {
      uid: profile.uid,
      email: profile.email,
      favoriteEvents: profile.favoriteEvents,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
    
    // Only add displayName if it exists
    if (profile.displayName) {
      docData.displayName = profile.displayName
    }
    
    await setDoc(userRef, docData, { merge: true })
    
    return profile
  } catch (error) {
    console.error('Error creating user profile:', error)
    const firebaseError = error as FirebaseError
    console.error('Error details:', {
      code: firebaseError.code,
      message: firebaseError.message
    })
    throw new Error(`Failed to create user profile: ${firebaseError.message}`)
  }
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(firestore, 'users', uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return null
    }

    const data = userDoc.data()
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      favoriteEvents: data.favoriteEvents || [],
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw new Error('Failed to get user profile')
  }
}

// Add event to user favorites
export async function addEventToFavorites(uid: string, eventId: number): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', uid)
    
    // Check if document exists first
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      // Create the document with the favorite event
      await setDoc(userRef, {
        uid: uid,
        favoriteEvents: [eventId],
        updatedAt: new Date(),
        createdAt: new Date()
      })
    } else {
      // Update existing document
      await updateDoc(userRef, {
        favoriteEvents: arrayUnion(eventId),
        updatedAt: new Date()
      })
    }
  } catch (error) {
    console.error('Error adding event to favorites:', error)
    const firebaseError = error as FirebaseError
    console.error('Error details:', {
      code: firebaseError.code,
      message: firebaseError.message,
      stack: firebaseError.stack
    })
    throw new Error(`Failed to add event to favorites: ${firebaseError.message}`)
  }
}

// Remove event from user favorites
export async function removeEventFromFavorites(uid: string, eventId: number): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', uid)
    
    // Check if document exists first
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return // Nothing to remove if document doesn't exist
    }
    
    await updateDoc(userRef, {
      favoriteEvents: arrayRemove(eventId),
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error removing event from favorites:', error)
    const firebaseError = error as FirebaseError
    console.error('Error details:', {
      code: firebaseError.code,
      message: firebaseError.message,
      stack: firebaseError.stack
    })
    throw new Error(`Failed to remove event from favorites: ${firebaseError.message}`)
  }
}

// Get user's favorite events
export async function getUserFavoriteEvents(uid: string): Promise<number[]> {
  try {
    const userRef = doc(firestore, 'users', uid)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return []
    }
    
    const data = userDoc.data()
    const favorites = data.favoriteEvents || []
    return favorites
  } catch (error) {
    console.error('Error getting user favorites:', error)
    const firebaseError = error as FirebaseError
    console.error('Error details:', {
      code: firebaseError.code,
      message: firebaseError.message
    })
    return []
  }
}

// Check if event is in user's favorites
export async function isEventFavorited(uid: string, eventId: number): Promise<boolean> {
  try {
    const favorites = await getUserFavoriteEvents(uid)
    return favorites.includes(eventId)
  } catch (error) {
    console.error('Error checking if event is favorited:', error)
    return false
  }
}

// Clean up duplicate favorites for a user
export async function cleanupDuplicateFavorites(uid: string): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', uid)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return
    }
    
    const data = userDoc.data()
    const favorites = data.favoriteEvents || []
    
    // Remove duplicates
    const uniqueFavorites = Array.from(new Set(favorites))
    
    if (uniqueFavorites.length !== favorites.length) {
      await updateDoc(userRef, {
        favoriteEvents: uniqueFavorites,
        updatedAt: new Date()
      })
    }
  } catch (error) {
    console.error('Error cleaning up duplicate favorites:', error)
  }
}
