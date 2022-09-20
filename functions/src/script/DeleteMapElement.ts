/* eslint-disable no-console */
import { deleteFiled } from "../domain/repository/admin_firestore/FieldValue";
import { initialize } from "./InitializeFirebaseApp";
import * as admin from "firebase-admin";

async function deleteMapElement() {
  const ref = admin.firestore().doc("deleteMapElement/doc");
  await ref.set(
    {
      map: {
        a: 1,
        b: 2,
      },
    },
    { merge: true }
  );
  const data1 = (await ref.get()).data();
  console.log(data1);

  await ref.set(
    {
      map: {
        a: 1,
        b: deleteFiled(),
      },
    },
    { merge: true }
  );
  const data2 = (await ref.get()).data();
  console.log(data2);
}

async function main() {
  try {
    initialize();
    await deleteMapElement();
  } catch (e) {
    console.error(e);
  }
}

main();
