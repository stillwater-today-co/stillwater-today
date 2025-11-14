import { addDoc, collection } from 'firebase/firestore';
import { firestore } from './firestore';

export interface SubmitFeedbackResult {
  success: boolean;
  id?: string;
  error?: unknown;
}

export async function submitFeedback(message: string, userId: string): Promise<SubmitFeedbackResult> {
  try {
    const docRef = await addDoc(collection(firestore, 'feedbacks'), {
      message,
      userId,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    return { success: false, error };
  }
}
