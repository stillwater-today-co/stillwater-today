// src/briefings.js
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase"; // make sure config.ts exports `db`

const briefingsCol = collection(db, "briefings");

interface BriefingData {
  date: string;
  summaryText: string;
  // add other fields as needed
}

/**
 * Get all briefings
 */
export async function getAllBriefings() {
  const snapshot = await getDocs(briefingsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Add a new briefing
 * @param {Object} briefingData
 *   { date: "YYYY-MM-DD", summaryText: "..." }
 */

export async function addBriefing(briefingData: BriefingData) {
  return await addDoc(briefingsCol, {
    ...briefingData,
    createdAt: new Date() // auto timestamp
  });
}

/**
 * Update a briefing by id
 */
export async function updateBriefing(id: string, briefingData: BriefingData) {
  const briefingRef = doc(db, "briefings", id);
  return await updateDoc(briefingRef, {
    ...briefingData,
    // don’t overwrite createdAt, only update fields you want
  });
}

/**
 * Delete a briefing by id
 */
export async function deleteBriefing(id: string) {
  const briefingRef = doc(db, "briefings", id);
  return await deleteDoc(briefingRef);
}
