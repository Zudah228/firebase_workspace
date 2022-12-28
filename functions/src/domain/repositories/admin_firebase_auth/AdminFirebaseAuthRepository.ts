import { Auth } from "firebase-admin/lib/auth/auth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

import { AuthCustomClaim } from "./CustomClaims";

/**
 * Admin Firebase Auth SDK を利用するためのクラス。
 */
export class AdminFirebaseAuthRepository {
  constructor(auth: Auth) {
    this.auth = auth;
  }

  private auth: Auth;

  async createUser(email: string, password: string): Promise<UserRecord> {
    return await this.auth.createUser({
      email: email,
      emailVerified: false,
      password: password,
      disabled: false,
    });
  }

  async setCustomClaim(uid: string, customClaim: AuthCustomClaim): Promise<void> {
    await this.auth.setCustomUserClaims(uid, customClaim);
  }

  async deleteAccount(uid: string): Promise<void> {
    try {
      // ユーザーが取得できたら削除する
      await this.auth.getUser(uid);
    } catch (e) {
      return;
    }
    await this.auth.deleteUser(uid);
  }

  async getUser(uid: string): Promise<UserRecord> {
    return this.auth.getUser(uid);
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }
}

export function getAdminAuthRepository(auth: Auth): AdminFirebaseAuthRepository {
  return new AdminFirebaseAuthRepository(auth);
}
