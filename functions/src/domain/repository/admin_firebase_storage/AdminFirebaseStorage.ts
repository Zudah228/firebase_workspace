import * as admin from "firebase-admin";

export const adminStorage = admin.storage().bucket();
/**
 * Admin Firebase Cloud Storage SDK を利用するためのクラス。
 */
export class AdminFirebaseStorageRepository {
  private constructor() {}

  static async delete(path: string) {
    await adminStorage.file(path).delete();
  }
}
