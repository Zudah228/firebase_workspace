import { firestore } from "firebase-admin";

export function isTimestamp(x: unknown): x is firestore.Timestamp {
  return isObject(x) && "toDate" in x;
}

export function isGeoPoint(x: unknown): x is firestore.GeoPoint {
  return isObject(x) && x.constructor.name === "GeoPoint";
}

export function isDocumentReference(x: unknown): x is firestore.DocumentReference {
  return isObject(x) && x.constructor.name === "DocumentReference";
}

export function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}
