// weather.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

const weatherCollection = collection(db, "weather");

export interface WeatherData {
  humidity: number;
  condition: string;
  city: string;
  state: string;
  temperature: number;
}

// CREATE - add a new weather entry
export async function addWeather({ humidity, condition, city, state, temperature }: WeatherData): Promise<string | undefined> {
  try {
    const docRef = await addDoc(weatherCollection, {
      "%humidity": humidity,
      condition,
      location: { city, state },
      temperature,
      timestamp: serverTimestamp() // Firestore sets this automatically
    });
    console.log("Weather entry added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding weather entry:", error);
  }
}

// READ - get all weather entries
export async function getAllWeather() {
  try {
    const snapshot = await getDocs(weatherCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// READ - get a single weather entry by ID
export async function getWeatherById(id: string) {
  try {
    const docRef = doc(db, "weather", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      console.log("No such weather document!");
    }
  } catch (error) {
    console.error("Error fetching weather entry:", error);
  }
}

// UPDATE - update a weather entry
export async function updateWeather(id: string, updatedData: Partial<WeatherData>) {
  try {
    const docRef = doc(db, "weather", id);
    await updateDoc(docRef, updatedData);
    console.log("Weather entry updated:", id);
  } catch (error) {
    console.error("Error updating weather entry:", error);
  }
}

// DELETE - delete a weather entry
export async function deleteWeather(id: string) {
  try {
    const docRef = doc(db, "weather", id);
    await deleteDoc(docRef);
    console.log("Weather entry deleted:", id);
  } catch (error) {
    console.error("Error deleting weather entry:", error);
  }
}
