import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp(functions.config().firebase);

// undefined の値を Firestore に追加しない設定。
admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

/**
 * トリガーの種類ごとにプレフィックスをつけて export。
 * Http は、1 つのパスごとに export する。
 *
 * Cloud Functions の region は、./config.ts に設定している。
 */
// export {
//   FirestoreTrigger,
//   AuthTrigger,
//   PubSub
//  } from "./presentation/";
