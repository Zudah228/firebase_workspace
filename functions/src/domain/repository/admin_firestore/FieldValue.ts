import { firestore } from "firebase-admin";

const fieldValue = firestore.FieldValue;

export const deleteFiled = () => fieldValue.delete();
export const serverTimestamp = () => fieldValue.serverTimestamp();
export const arrayUnion = (...elements: unknown[]) => fieldValue.arrayUnion(elements);
export const arrayRemove = (...elements: unknown[]) => fieldValue.arrayRemove(elements);
export const increment = (n: number) => fieldValue.increment(n);
