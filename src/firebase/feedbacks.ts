import { addDoc, collection } from 'firebase/firestore';
import { firestore } from './firestore';

export interface SubmitFeedbackResult {
  success: boolean;
  id?: string;
  error?: unknown;
}

export async function submitFeedback(message: string): Promise<SubmitFeedbackResult> {
  try {
    const docRef = await addDoc(collection(firestore, 'feedbacks'), {
      message,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    return { success: false, error };
  }
}
