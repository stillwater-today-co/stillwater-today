// src/events.js
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./config"; // make sure config.ts exports `db`

const eventsCol = collection(db, "events");

/**
 * Get all events
 */
export async function getAllEvents() {
  const snapshot = await getDocs(eventsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Add a new event
 * @param {Object} eventData 
 */
export async function addEvent(eventData) {
  // You might want to enforce updatedAt automatically
  return await addDoc(eventsCol, {
    ...eventData,
    updatedAt: new Date()
  });
}

/**
 * Update an event by id
 */
export async function updateEvent(id, eventData) {
  const eventRef = doc(db, "events", id);
  return await updateDoc(eventRef, {
    ...eventData,
    updatedAt: new Date()
  });
}

/**
 * Delete an event by id
 */
export async function deleteEvent(id) {
  const eventRef = doc(db, "events", id);
  return await deleteDoc(eventRef);
}
