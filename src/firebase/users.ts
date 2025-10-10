import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Create or update a user document in Firestore.
 * Usually called right after sign-up or login.
 */
export async function saveUser(
  uid: string,
  email: string,
  name: string,
  interests: string[] = []
) {
  try {
    await setDoc(doc(db, "users", uid), {
      email,
      name,
      interests,
      lastLogin: serverTimestamp()
    }, { merge: true });  // merge = keep existing fields if doc exists
  console.log("User saved/updated:", uid);
  } catch (error) {
  console.error("Error saving user:", error);
    throw error;
  }
}

/**
 * Fetch a user document from Firestore by UID.
 */
export async function getUser(uid: string) {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    } else {
  console.warn("No user found with UID:", uid);
      return null;
    }
  } catch (error) {
  console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Update specific fields for a user.
 */
export async function updateUser(uid: string, fields: Record<string, any>) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...fields,
      lastLogin: serverTimestamp()
    });
  console.log("User updated:", uid);
  } catch (error) {
  console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete a user document from Firestore.
 * Be careful! This removes profile data, not the Firebase Auth account.
 */
export async function deleteUser(uid: string) {
  try {
    await deleteDoc(doc(db, "users", uid));
  console.log("User deleted:", uid);
  } catch (error) {
  console.error("Error deleting user:", error);
    throw error;
  }
}

