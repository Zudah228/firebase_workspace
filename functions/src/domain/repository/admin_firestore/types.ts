import { firestore } from "firebase-admin";

export type FirestoreDocument<T> = { entity: T } & { ref: firestore.DocumentReference };
export type FirestoreWriteType<T> = {
  [K in keyof T]: T[K] | firestore.FieldValue;
};
export type FirestoreUpdateType<T> = Partial<FirestoreWriteType<T>>;
