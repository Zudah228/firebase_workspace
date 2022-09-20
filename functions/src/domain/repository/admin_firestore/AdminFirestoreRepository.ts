import * as admin from "firebase-admin";

import { ClassConstructor } from "class-transformer";
import { firestore } from "firebase-admin";
import { AdminFirestoreRepositoryJsonConverter } from "./utils/AdminFirestoreRepositoryJsonConverter";
import { FirestoreDocument, FirestoreUpdateType, FirestoreWriteType } from "./types";
import { SetOptions } from "@google-cloud/firestore";

export const adminDb = admin.firestore();
/**
 * JavaScript の class と Firestore のデータをやり取りさせるためのクラス。
 *
 * Timestamp を Date に加工したりする。
 *
 * インスタンスを無駄に生成しないように、関数呼び出しの度に path を設定するようにしている。
 * path を class の static に設定するなど、path の変更容易性を担保すること。
 */
export class AdminFirestoreRepository<T> extends AdminFirestoreRepositoryJsonConverter<T> {
  constructor(entityConstructor: ClassConstructor<T>) {
    super(entityConstructor);
  }

  /**
   * transaction などで使用するために public に設定している。
   * @param documentPath
   * @returns
   */
  public getDocumentRef(documentPath: string): firestore.DocumentReference {
    return adminDb.doc(documentPath);
  }

  /**
   * transaction で使用するために public に設定している。
   * @param collectionPath
   * @returns
   */
  public getCollectionRef(collectionPath: string) {
    return adminDb.collection(collectionPath);
  }

  /**
   * set でドキュメントを指定して保存。
   *
   * 一部フィールドの更新に関しては、updateSomeField の使用を推奨。
   *
   * 内部的に toJson が行われ、
   * getter やその他関数は除外される。FieldValue の使用が可能。
   * @param documentPath
   * @param item
   * @param options
   */
  public async set(documentPath: string, item: FirestoreWriteType<T>, options?: SetOptions): Promise<void> {
    await this.getDocumentRef(documentPath).set(this.toJson(item), options ?? { merge: true });
  }

  /**
   * add で自動生成のドキュメントを作成。
   *
   * 返り値は生成した id
   *
   * バックグラウンド関数では、冪等性が担保されないため、あまり推奨しない。
   *
   * 内部的に toJson が行われ、
   * getter やその他関数は除外される。FieldValue の使用が可能。
   * @param collectionPath
   * @param item
   * @returns {string} - 自動生成した id
   */
  public async saveWithAutoDocumentId(collectionPath: string, item: FirestoreWriteType<T>): Promise<string> {
    const ref = await adminDb.collection(collectionPath).add(this.toJson(item));
    return ref.id;
  }

  /**
   * update で一部のフィールドのみを更新。
   *
   * 内部的に toJson が行われ、
   * getter やその他関数は除外される。FieldValue の使用が可能。
   * @param documentPath
   * @param item
   */
  public async updateSomeField(documentPath: string, item: FirestoreUpdateType<T>): Promise<void> {
    await this.getDocumentRef(documentPath).update(this.toJson(item));
  }

  /**
   * ドキュメントの消去
   * @param documentPath
   */
  public async delete(documentPath: string): Promise<void> {
    await this.getDocumentRef(documentPath).delete();
  }

  /**
   * Timestamp は Date に変換される。
   * @param documentPath
   * @returns
   */
  public async fetchDocument(documentPath: string): Promise<FirestoreDocument<T> | undefined> {
    const snapshot = await this.getDocumentRef(documentPath).get();
    if (!snapshot.exists) {
      return undefined;
    }
    return {
      ref: snapshot.ref,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entity: this.fromJson(snapshot.data()!),
    };
  }

  /**
   * ドキュメントを Read して、存在の有無を確認する。
   *
   * fetchDocument と、取得の処理が変わるわけではない。
   * @param documentPath
   * @returns
   */
  public async exists(documentPath: string): Promise<boolean> {
    const snapshot = await this.getDocumentRef(documentPath).get();
    return snapshot.exists;
  }

  /**
   * Collection、CollectionGroup の取得。
   *
   * Timestamp は Date に変換される。
   * @param query
   * @returns
   */
  public async fetchCollection(query: firestore.Query): Promise<FirestoreDocument<T>[]> {
    const snapshot = await query.get();

    if (snapshot.docs.length === 0) {
      return [];
    }
    return snapshot.docs.map((snapshot) => {
      return {
        ref: snapshot.ref,
        entity: this.fromJson(snapshot.data()),
      };
    });
  }
}
/**
 * クラスごとの AdminFirestoreRepository のインスタンス生成
 * @param entityConstructor
 * @returns
 */
export function getFirestoreDocumentRepository<T>(entityConstructor: ClassConstructor<T>): AdminFirestoreRepository<T> {
  return new AdminFirestoreRepository<T>(entityConstructor);
}
