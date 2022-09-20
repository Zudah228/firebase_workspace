/* eslint-disable require-jsdoc */
import { firestore } from "firebase-admin";

export function isTimestamp(x: unknown): x is firestore.Timestamp {
  return typeof x === "object" && x !== null && "toDate" in x;
}

export function isGeoPoint(x: unknown): x is firestore.GeoPoint {
  return typeof x === "object" && x !== null && x.constructor.name === "GeoPoint";
}

export function isDocumentReference(x: unknown): x is firestore.DocumentReference {
  return typeof x === "object" && x !== null && x.constructor.name === "DocumentReference";
}

export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object";
}
