import { firestore } from "firebase-admin";

// read
export type FirestoreDocument<T> = { entity: T } & {
  ref: FirestoreDocumentReference;
};

// write
export type FirestoreWriteType<T> = Omit<
  {
    [K in keyof T]: T[K] | firestore.FieldValue;
  },
  {
    [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
  }[keyof T]
>;

export type QueryBuilder<T = firestore.DocumentData> = (
  getReference: (collectionPath: string) => firestore.CollectionReference<T>
) => firestore.Query<T>;

// Firestore の型をそのまま使用する
export type FirestoreGeo = firestore.GeoPoint;
export type FirestoreDocumentReference = firestore.DocumentReference;
