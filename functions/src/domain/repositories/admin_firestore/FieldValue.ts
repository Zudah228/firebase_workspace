import { firestore } from "firebase-admin";

const fieldValue = firestore.FieldValue;

/**
 * FieldValue の利用
 */
export class FirestoreFieldValue {
  private constructor() {}

  static deleteFiled = () => fieldValue.delete();
  static serverTimestamp = () => fieldValue.serverTimestamp();
  static arrayUnion = (...elements: unknown[]) => fieldValue.arrayUnion(...elements);
  static arrayRemove = (...elements: unknown[]) => fieldValue.arrayRemove(...elements);
  static increment = (n: number) => fieldValue.increment(n);
}
