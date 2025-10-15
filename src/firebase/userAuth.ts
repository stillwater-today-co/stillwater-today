import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "./firebase";


// Sign up
async function register(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    if (error instanceof Error && typeof ((error as unknown as { code?: unknown }).code) === 'string') {
      const code = (error as unknown as { code: string }).code;
      switch (code) {
        case "auth/weak-password":
          throw new Error("Password must be at least 8 characters, contain one uppercase letter, one special character (!@#$&*), and one number.");
        case "auth/email-already-in-use":
          throw new Error("This email is already in use.");
        case "auth/invalid-email":
          throw new Error("Invalid email address.");
        default:
          throw new Error("Registration failed: " + error.message);
      }
    }
    throw error;
  }
}

// Sign in
async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    if (error instanceof Error && typeof ((error as unknown as { code?: unknown }).code) === 'string') {
      const code = (error as unknown as { code: string }).code;
      switch (code) {
        case "auth/wrong-password":
          throw new Error("Incorrect password.");
        case "auth/user-not-found":
          throw new Error("No account found with this email.");
        case "auth/invalid-email":
          throw new Error("Invalid email address.");
        default:
          throw new Error("Login failed: " + error.message);
      }
    }
    throw error;
  }
}

// Sign out
async function logout() {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Logout failed: " + error.message);
    }
    throw error;
  }
}

export { auth, login, logout, register };
