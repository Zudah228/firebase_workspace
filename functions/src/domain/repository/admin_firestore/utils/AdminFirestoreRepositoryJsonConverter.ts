import { ClassConstructor, plainToInstance } from "class-transformer";
import { isDocumentReference, isGeoPoint, isObject, isTimestamp } from "./TypeGuards";
import { firestore } from "firebase-admin";
import { FirestoreWriteType } from "../types";

/**
 * Firestore と JS の class を上手くデータのやり取りをさせるための class。
 * FirestoreRepository の class を分割したいときのために、抽象 class で定義させている。
 */
export abstract class AdminFirestoreRepositoryJsonConverter<T> {
  constructor(entityConstructor: ClassConstructor<T>) {
    entityConstructor;
    this.entityConstructor = entityConstructor;
  }

  private entityConstructor: ClassConstructor<T>;

  /**
   * transaction で使用するために public に設定している。
   */
  public toJson(item: Partial<FirestoreWriteType<T>>): Record<string, unknown> {
    const objectGetters = this.extractAllGetters(item as Record<string, unknown>);

    const serializableObj = { ...item, ...objectGetters };
    return serializableObj;
  }

  /**
   * transaction 、バックグラウンド関数で取得した snapshot を加工するために、public にしている。
   */
  public fromJson(data: firestore.DocumentData): T {
    return plainToInstance<T, Record<string, unknown>>(this.entityConstructor, this.encodeFirestoreTypes(data));
  }

  private encodeFirestoreTypes(obj: Record<string, unknown>) {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (!obj[key]) return;
      if (isTimestamp(val)) {
        obj[key] = val.toDate();
      } else if (isGeoPoint(val)) {
        const { latitude, longitude } = val;
        obj[key] = { latitude, longitude };
      } else if (isDocumentReference(val)) {
        const { id, path } = val;
        obj[key] = { id, path };
      } else if (isObject(val)) {
        this.encodeFirestoreTypes(val);
      }
    });
    return obj;
  }

  private extractAllGetters(obj: Record<string, unknown>) {
    const prototype = Object.getPrototypeOf(obj);
    const fromInstanceObj = Object.keys(obj);
    const fromInstance = Object.getOwnPropertyNames(obj);
    const fromPrototype = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));

    const keys = [...fromInstanceObj, ...fromInstance, ...fromPrototype];

    const getters = keys
      .map((key) => Object.getOwnPropertyDescriptor(prototype, key))
      .map((descriptor, index) => {
        // function を除外してしまうと、FieldValue ものぞいてしまうので、ここでブロック
        if (descriptor instanceof firestore.FieldValue) {
          return keys[index];
        }
        if (descriptor && typeof descriptor.get === "function") {
          return keys[index];
        } else {
          return undefined;
        }
      })
      .filter((d) => d !== undefined);

    return getters.reduce<Record<string, unknown>>((accumulator, currentValue) => {
      if (typeof currentValue === "string" && obj[currentValue]) {
        accumulator[currentValue] = obj[currentValue];
      }
      return accumulator;
    }, {});
  }
}
