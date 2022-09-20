// import * as functions from "firebase-functions"
// import { FirebaseMessaging } from "../../../domain/repository/firebase_messaging/FirebaseMessagingRepository";

// const endpoint = functions
// .region("asia-northeast1")
// .runWith({ memory: "512MB", timeoutSeconds: 120 });

// export const everyOneMinute = endpoint.pubsub
//   .schedule("* * * * *")
//   .timeZone("Asia/Tokyo")
//   .onRun(async (_) => {
//     FirebaseMessaging.sendToTopic("all", {
//       notification: {
//       title: "タイトル",
//       body: "あああ"
//     }})
//   });
