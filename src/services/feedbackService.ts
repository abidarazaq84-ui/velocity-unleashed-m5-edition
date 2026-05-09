import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const feedbackService = {
  async submitFeedback(uid: string, displayName: string, message: string, rating: number) {
    const feedbackCol = collection(db, 'feedback');
    try {
      await addDoc(feedbackCol, {
        uid,
        displayName,
        message,
        rating,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    }
  }
};
