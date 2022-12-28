import {
  assertFails,
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
  TokenOptions,
} from "@firebase/rules-unit-testing";
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import {
  AdminCloudStorageRepository,
  getAdminCloudStorageRepository,
} from "../domain/repositories/admin_cloud_storage/AdminCloudStorageRepository";
import {
  AdminFirebaseAuthRepository,
  getAdminAuthRepository,
} from "../domain/repositories/admin_firebase_auth/AdminFirebaseAuthRepository";
import { testConfig } from "./config";

// Todo: ユーザーの種類をあらかじめ入れられるようにする
/**
 * Firebase の unit テストを行うための class
 */
export class FirebaseUnitTest {
  constructor(testEnv: RulesTestEnvironment) {
    this.#testEnv = testEnv;
  }

  #testEnv: RulesTestEnvironment;

  /**
   * 非同期でコンストラクタに必要な値を取得
   */
  static async setUp(): Promise<FirebaseUnitTest> {
    const testEnv = await initializeTestEnvironment(testConfig.emulatorConfig);

    // Firebase Admin sdk を emulator に接続
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199";

    // Firebase Admin sdk の初期化
    admin.initializeApp(testConfig.adminConfig);

    return new FirebaseUnitTest(testEnv);
  }

  /**
   * 非認証ユーザー
   * @returns {RulesTestContext}
   */
  public get unauthenticatedUser(): RulesTestContext {
    return this.#testEnv.unauthenticatedContext();
  }

  /**
   * 認証ユーザー
   * @param uid - uid
   * @param tokenOptions - カスタムトークン
   * @returns {RulesTestContext}
   */
  public getAuthenticatedUser(uid: string, tokenOptions?: TokenOptions | undefined): RulesTestContext {
    return this.#testEnv.authenticatedContext(uid, tokenOptions);
  }

  /**
   * Firebase Admin SDK
   * Admin Firestore Repository の利用は、 getAdminFirestoreRepository に getFirestore() を渡す
   * @param test
   * @returns
   */
  public withAdminSdk<T>(
    test: (
      getFirestore: Firestore,
      storageRepository: AdminCloudStorageRepository,
      authRepository: AdminFirebaseAuthRepository
    ) => Promise<void>
  ): Promise<void> {
    const storageRepository = getAdminCloudStorageRepository(getStorage());
    const authRepository = getAdminAuthRepository(getAuth());

    return test(getFirestore(), storageRepository, authRepository);
  }

  /**
   * ルール適応外テスト
   *
   *
   * コールバック内でしか行うことができない
   * > When using withSecurityRulesDisabled,
   * > make sure to perform all operations on the context within the callback function and return a Promise
   * > that resolves when the operations are done.
   */
  public withSecurityRulesDisabled(
    test: (
      firestore: firebase.default.firestore.Firestore,
      storage: firebase.default.storage.Storage,
      database?: firebase.default.database.Database
    ) => void
  ): Promise<void> {
    return this.#testEnv.withSecurityRulesDisabled(async function (c) {
      let firestore: firebase.default.firestore.Firestore | undefined;
      let storage: firebase.default.storage.Storage | undefined;
      let database: firebase.default.database.Database | undefined;
      try {
        firestore = c.firestore();
        storage = c.storage(testConfig.adminConfig.storageBucket);
        database = c.database();
      } catch (_) {
        // ignore error
      }
      return test(firestore!, storage!, database);
    });
  }

  /**
   * 処理を失敗させるテスト
   *
   * @param pr - 失敗させる処理
   * @returns {Promise<void>}
   */
  public permissionDeniedTest(pr: Promise<unknown>): Promise<void> {
    return assertFails(pr);
  }

  /**
   * @param pr - 失敗させたい処理
   * @returns {boolean} - true: 正常に失敗
   */
  public async causeError(pr: () => Promise<unknown>): Promise<boolean> {
    try {
      await pr();
      return false;
    } catch (e) {
      return true;
    }
  }

  async dispose(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Firestore の削除
    const clearFirestore = async () => {
      try {
        await this.#testEnv.clearFirestore();
      } catch (e) {
        // emulator を起動してない場合
        if (e instanceof Error && e.message.includes("emulator must be specified.")) {
          return;
        }
        console.error(e);
      }
    };
    promises.push(clearFirestore());

    // Cloud Storage の削除
    const clearCloudStorage = async () => {
      try {
        await this.#testEnv.clearStorage();
      } catch (e) {
        // emulator を起動してない場合
        if (e instanceof Error && e.message.includes("emulator must be specified.")) {
          // ignore error
          return;
        }
        console.error(e);
      }
    };
    promises.push(clearCloudStorage());

    // Realtime Database の削除
    const clearDatabase = async () => {
      try {
        await this.#testEnv.clearDatabase();
      } catch (e) {
        if (e instanceof Error && e.message.includes("emulator must be specified.")) {
          return;
        }
        console.error(e);
      }
    };
    promises.push(clearDatabase());

    await Promise.all(promises);
  }
}
