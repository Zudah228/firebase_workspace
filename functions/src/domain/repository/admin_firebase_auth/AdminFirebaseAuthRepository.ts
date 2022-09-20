import * as admin from "firebase-admin";

import { auth } from "firebase-admin";
import * as functions from "firebase-functions";
import { authCustomClaim } from "./CustomClaims";

export const adminAuth = admin.auth();

/**
 * Admin Firebase Auth SDK を利用するためのクラス。
 */
export class AdminFirebaseAuthRepository {
  private constructor() {}
  static async createUser(email: string, password: string): Promise<auth.UserRecord> {
    return await adminAuth.createUser({
      email: email,
      emailVerified: false,
      password: password,
      disabled: false,
    });
  }

  static async setCustomClaim(uid: string, customClaim: authCustomClaim): Promise<void> {
    await adminAuth.setCustomUserClaims(uid, customClaim);
  }

  static async deleteAccount(uid: string): Promise<void> {
    try {
      // ユーザーが取得できたら削除する
      await adminAuth.getUser(uid);
    } catch (e) {
      functions.logger.log(e);
      return;
    }
    await adminAuth.deleteUser(uid);
  }

  static async getUser(uid: string): Promise<auth.UserRecord> {
    return adminAuth.getUser(uid);
  }

  static async verifyIdToken(token: string): Promise<auth.DecodedIdToken> {
    return adminAuth.verifyIdToken(token);
  }
}
