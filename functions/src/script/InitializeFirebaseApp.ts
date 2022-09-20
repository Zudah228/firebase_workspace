/* eslint-disable no-console */
import * as admin from "firebase-admin";

/**
 * Cloud Functions ではなく、ローカルで実行するスクリプト。
 * firebase-admin の初期化。
 */
export function initialize(): void {
  const dbUrl = "https://zudah-workspace-default-rtdb.firebaseio.com";
  const storageBucket = "zudah-workspace.appspot.com";
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require("../../keys/sa-key.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: dbUrl,
    storageBucket: storageBucket,
  });
  console.log("FirebaseProject:", admin.app().options.projectId);
}
