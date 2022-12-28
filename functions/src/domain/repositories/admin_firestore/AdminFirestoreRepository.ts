import { SetOptions } from "@google-cloud/firestore";
import { ClassConstructor } from "class-transformer";
import { firestore } from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";

import { FirestoreDocument, FirestoreDocumentReference, FirestoreWriteType, QueryBuilder } from "./types";
import { AdminFirestoreRepositoryJsonConverter } from "./utils/AdminFirestoreRepositoryJsonConverter";

/**
 * JavaScript の class と Firestore のデータをやり取りさせるためのクラス。
 * Timestamp を Date に加工したりする。
 *
 * インスタンスを無駄に生成しないように、関数呼び出しの度に path を設定するようにしている。
 * path を class の static に設定するなど、path の変更容易性を担保すること。
 */
export class AdminFirestoreRepository<
  T,
  WriteType extends firestore.DocumentData = FirestoreWriteType<T>
> extends AdminFirestoreRepositoryJsonConverter<T> {
  constructor(entityConstructor: ClassConstructor<T>, firestore: Firestore) {
    super(entityConstructor);
    this.firestore = firestore;
  }

  private firestore: Firestore;

  // reference

  /**
   * transaction などで使用するために public に設定している。
   * @param documentPath
   * @returns
   */
  public getDocumentReference(documentPath: string): firestore.DocumentReference {
    return this.firestore.doc(documentPath);
  }

  /**
   * transaction で使用するために public に設定している。
   * @param collectionPath
   * @returns
   */
  public getCollectionReference(collectionPath: string) {
    return this.firestore.collection(collectionPath);
  }

  // write

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
  public async set(documentPath: string, item: WriteType, options?: SetOptions): Promise<void> {
    await this.getDocumentReference(documentPath).set(this.toJson(item), options ?? { merge: true });
  }

  /**
   * add で自動生成のドキュメントを作成。
   *
   * バックグラウンド関数では、冪等性が担保されないため、あまり推奨しない。
   *
   * 内部的に toJson が行われ、
   * getter やその他関数は除外される。FieldValue の使用が可能。
   * @param collectionPath
   * @param item
   * @returns {string} - 自動生成した id を含んだ DocumentReference
   */
  public async add(collectionPath: string, item: WriteType): Promise<FirestoreDocumentReference> {
    const ref = await this.firestore.collection(collectionPath).add(this.toJson(item));
    return ref;
  }

  /**
   * update で一部のフィールドのみを更新。
   *
   * 内部的に toJson が行われ、
   * getter やその他関数は除外される。FieldValue の使用が可能。
   * @param documentPath
   * @param item
   */
  public async updateSomeField(documentPath: string, item: Partial<WriteType>): Promise<void> {
    await this.getDocumentReference(documentPath).update(this.toJson(item));
  }

  /**
   * ドキュメントの消去
   * @param documentPath
   */
  public async delete(documentPath: string): Promise<void> {
    await this.getDocumentReference(documentPath).delete();
  }

  // read

  /**
   * Timestamp は Date に変換される。
   * @param documentPath
   * @returns
   */
  public async fetchDocument(documentPath: string): Promise<FirestoreDocument<T> | undefined> {
    const snapshot = await this.getDocumentReference(documentPath).get();
    return this.fromSnapshot(snapshot);
  }

  /**
   * ドキュメントを Read して、存在の有無を確認する。
   *
   * fetchDocument と、取得の処理が変わるわけではない。
   * @param documentPath
   * @returns
   */
  public async exists(documentPath: string): Promise<boolean> {
    const snapshot = await this.getDocumentReference(documentPath).get();
    return snapshot.exists;
  }

  /**
   * Collection、CollectionGroup の取得。
   *
   * Timestamp は Date に変換される。
   * @param query
   * @returns
   */
  public async fetchCollection(queryBuilder: QueryBuilder): Promise<FirestoreDocument<T>[]> {
    const snapshot = await queryBuilder(this.getCollectionReference).get();

    if (snapshot.docs.length === 0) {
      return [];
    }
    return snapshot.docs.map((snapshot) => {
      return this.fromSnapshot(snapshot);
    });
  }
}
/**
 * クラスごとの AdminFirestoreRepository のインスタンス生成
 *
 * ### Type Param
 * * T - やりとりする class 。
 * * WriteType - デフォルトは FirestoreWriteType<T>。map を含むフィールドの場合、渡す必要がある。
 *    * ex.)
 *    *     type EntityWriteType = FirestoreWriteType<Omit<Entity, "mapField">> &
 *    *       { mapField?: FirestoreWriteType<MapField> };
 *
 * @param entityConstructor
 * @returns
 */
export function getAdminFirestoreRepository<T, WriteType extends firestore.DocumentData = FirestoreWriteType<T>>(
  entityConstructor: ClassConstructor<T>,
  firestore: Firestore
): AdminFirestoreRepository<T, WriteType> {
  return new AdminFirestoreRepository<T, WriteType>(entityConstructor, firestore);
}
