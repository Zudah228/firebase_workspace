import { firestore } from "firebase-admin";

import { getAdminFirestoreRepository } from "../../../../../domain/repositories/admin_firestore/AdminFirestoreRepository";
import { FirestoreFieldValue } from "../../../../../domain/repositories/admin_firestore/FieldValue";
import { OmitFunction } from "../../../../../utils/ClassHelper";
import { FirebaseUnitTest } from "../../../../index";
import {
  getTestEntityFirestoreRepository,
  TestEntity,
  FirestoreTestEntityWriteType,
  TestNestedClass,
} from "../TestEntity";

/**
 * AdminFirestoreRepository 経由で関数の実行 => パッケージの正規の使い方で確認
 * Firestore からのデータの取得には、AdminFirestoreRepository を使用しない
 */
describe("Admin Firestore Repository の書き込みテスト", () => {
  let firebaseUnitTest: FirebaseUnitTest;

  const documentPath = TestEntity.documentPath;

  beforeAll(async () => {
    firebaseUnitTest = await FirebaseUnitTest.setUp();
  });

  afterEach(async () => {
    await firebaseUnitTest.dispose();
  });

  test("プリミティブ型の保存", async () => {
    let data: firestore.DocumentData | undefined;

    const item: OmitFunction<TestEntity> = {
      stringField: "string",
      numberField: 1,
      booleanField: true,
      nullField: null,
    };

    // Repository の使用
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getAdminFirestoreRepository(TestEntity, firestore);
      const entity = new TestEntity(item);

      await testEntityRepository.set(documentPath, entity);
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect(data).toEqual(item);
  });

  test("配列の保存", async () => {
    let data: firestore.DocumentData | undefined;

    const item: OmitFunction<TestEntity> = { arrayField: ["element1", "element2"] };

    // Repository の使用
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);
      const entity = new TestEntity(item);

      await testEntityRepository.set(documentPath, entity);
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect(data).toEqual(item);
  });

  test("Mapの保存", async () => {
    let data: firestore.DocumentData | undefined;

    const item: OmitFunction<TestEntity> = { mapField: { key1: "value1", key2: "value2" } };

    // Repository の使用
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);
      const entity = new TestEntity(item);

      await testEntityRepository.set(documentPath, entity);
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect(data).toEqual(item);
  });

  test("各 FieldValue のテスト", async () => {
    let data: firestore.DocumentData | undefined;

    const item: FirestoreTestEntityWriteType = {
      stringField: "string",
      numberField: 0,
      arrayField: ["element1", "element2"],
      anotherArrayField: [0, 1, 2],
    };

    const increment = 2;
    const unionToBePushed = "element3";
    const unionToBeRemoved = 2;

    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);
      // 初期値を挿入
      await testEntityRepository.set(documentPath, item);

      // FieldValue で更新
      await testEntityRepository.set(documentPath, {
        stringField: FirestoreFieldValue.deleteFiled(),
        numberField: FirestoreFieldValue.increment(increment),
        arrayField: FirestoreFieldValue.arrayUnion(unionToBePushed),
        anotherArrayField: FirestoreFieldValue.arrayRemove(unionToBeRemoved),
        dateField: FirestoreFieldValue.serverTimestamp(),
      });
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect("stringField" in data!).toEqual(false);
    expect(data!.numberField).toEqual((item.numberField as number)! + increment);
    expect(data!.arrayField).toEqual([...(item.arrayField as string[]), unionToBePushed]);
    expect(data!.anotherArrayField).toEqual((item.anotherArrayField as number[]).filter((e) => e !== unionToBeRemoved));
    expect("toDate" in (data!.dateField as firestore.Timestamp)).toEqual(true);
  });

  test("Map フィールド内の FieldValue の保存", async () => {
    let data: firestore.DocumentData | undefined;

    // Map 内のフィールド x Map ではないフィールドの比較
    const item: FirestoreTestEntityWriteType = {
      dateField: FirestoreFieldValue.serverTimestamp(),
      mapField: {
        key1: "value1",
        key2: FirestoreFieldValue.serverTimestamp(),
      },
    };

    // Repository の使用
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.set(documentPath, item);
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect(data!.mapField.key2).toMatchObject(data!.dateField);
  });

  test("class のフィールドの保存", async () => {
    let data: firestore.DocumentData | undefined;

    const classField: OmitFunction<TestNestedClass> = {
      stringField: "string",
      arrayField: ["element1", "element2", undefined],
      mapField: {
        key1: "value1",
        key2: "value2",
        key3: undefined,
      },
    };

    const item: FirestoreTestEntityWriteType = {
      classField: new TestNestedClass(classField),
    };
    // Repository の使用
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.set(documentPath, item);
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect(data).toEqual({ classField });
  });
  test("class 配列のフィールドの保存", async () => {
    let data: firestore.DocumentData | undefined;

    const classField: OmitFunction<TestNestedClass> = {
      stringField: "string",
      arrayField: ["element1", "element2", undefined],
      mapField: {
        key1: "value1",
        key2: "value2",
        key3: undefined,
      },
    };
    const classArrayField = [classField, classField];

    const item: FirestoreTestEntityWriteType = {
      classArrayField: [new TestNestedClass(classField), new TestNestedClass(classField)],
    };
    // Repository の使用
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.set(documentPath, item);
    });

    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect(data).toEqual({ classArrayField });
  });

  test("Date の保存", async () => {
    let data: firestore.DocumentData | undefined;

    const dateField = new Date();

    const item: FirestoreTestEntityWriteType = {
      dateField,
    };

    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.set(documentPath, item);
    });
    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect((data!.dateField as firestore.Timestamp).toDate()).toEqual(dateField);
  });

  test("DocumentReference の保存", async () => {
    let data: firestore.DocumentData | undefined;
    let docRef: firestore.DocumentReference;
    let item: FirestoreTestEntityWriteType;

    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);
      docRef = testEntityRepository.getDocumentReference(documentPath);
      item = {
        documentRefField: docRef,
      };
      await testEntityRepository.set(documentPath, item);
    });
    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect((data!.documentRefField as firestore.DocumentReference).path).toEqual(docRef!.path);
  });

  test("GeoPoint の保存", async () => {
    let data: firestore.DocumentData | undefined;

    const geoField = new firestore.GeoPoint(90, 135);

    const item: FirestoreTestEntityWriteType = {
      geoField,
    };

    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.set(documentPath, item);
    });
    // 取得して確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data).toBeDefined();
    expect((data!.geoField as firestore.GeoPoint).latitude).toEqual(geoField!.latitude);
    expect((data!.geoField as firestore.GeoPoint).longitude).toEqual(geoField!.longitude);
  });

  test("add で保存", async () => {
    let addTestDocumentPath: firestore.DocumentReference;
    let exists: boolean;

    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      addTestDocumentPath = await testEntityRepository.add("test", {
        stringField: "string",
      });
    });

    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      exists = (await addTestDocumentPath.get()).exists;
    });

    expect(exists!).toEqual(true);
  });

  test("updateSomeField で保存", async () => {
    let data: firestore.DocumentData | undefined;

    const item: FirestoreTestEntityWriteType = {
      stringField: "string1",
      numberField: 0,
    };

    const updateMap: Partial<FirestoreTestEntityWriteType> = {
      stringField: "string2",
    };

    // あらかじめ保存
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      await firestore.doc(documentPath).set(item);
    });

    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.updateSomeField(documentPath, updateMap);
    });

    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      const doc = await firestore.doc(documentPath).get();
      data = doc.data();
    });

    expect(data!).toEqual({
      ...item,
      ...updateMap,
    });
  });

  test("delete で削除", async () => {
    let exists: boolean;

    const item: FirestoreTestEntityWriteType = {
      stringField: "string1",
      numberField: 0,
    };

    // あらかじめ保存
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      await firestore.doc(documentPath).set(item);
    });

    // Repository 経由で削除
    await firebaseUnitTest.withAdminSdk(async (firestore) => {
      const testEntityRepository = getTestEntityFirestoreRepository(firestore);

      await testEntityRepository.delete(documentPath);
    });

    // document が存在するか確認
    await firebaseUnitTest.withSecurityRulesDisabled(async (firestore) => {
      exists = (await firestore.doc(documentPath).get()).exists;
    });

    expect(exists!).toEqual(false);
  });
});
