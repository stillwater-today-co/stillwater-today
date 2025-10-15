import { addDoc, collection } from 'firebase/firestore';
import { firestore } from './firestore';

export async function submitFeedback(message: string) {
  try {
    const docRef = await addDoc(collection(firestore, 'feedbacks'), {
      message,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error };
  }
}
