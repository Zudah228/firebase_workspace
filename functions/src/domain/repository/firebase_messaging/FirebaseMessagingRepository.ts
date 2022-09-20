import * as admin from "firebase-admin";
import { messaging } from "firebase-admin";
import * as functions from "firebase-functions";

export const adminMessaging = admin.messaging();

export type FcmBatchMessage = messaging.Message;
export type FcmBatchMessageContent = messaging.Notification;
export type FcmMessageContent = messaging.NotificationMessagePayload;

/**
 * Firebase Cloud Messaging を利用するためのクラス。
 */
export class FirebaseMessagingRepository {
  private constructor() {}
  static async sendToToken(token: string, content: FcmMessageContent, priority?: string): Promise<void> {
    try {
      const option = {
        priority: priority ?? "high",
      };

      await adminMessaging.sendToDevice(
        token,
        {
          notification: content,
        },
        option
      );
    } catch (e) {
      console.error(e);
    }
  }

  static async sendToTopic(topic: string, content: FcmMessageContent, priority?: string): Promise<void> {
    try {
      const option = {
        priority: priority ?? "high",
      };

      await adminMessaging.sendToTopic(topic, { notification: content }, option);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  static maxBatchSize = 500;

  /**
   * messaging.sendAll() は 500 を上限としているが、この関数の中で分割しているので、
   * 500 以上の配列を渡しても良い。
   * @param messages
   * @returns
   */
  static async sendBatchToToken(messages: FcmBatchMessage[]): Promise<void> {
    // sendAll() は 500以下までしか一気に送信できない
    // 500以下ならそのまま送信
    if (messages.length <= this.maxBatchSize) {
      await adminMessaging.sendAll(messages);
      return;
    }
    // 500以上なら、Message の多重配列にして Promise の配列を生成する
    const msgs = messages.reduce(
      (acc: admin.messaging.Message[][], value) => {
        const last = acc[acc.length - 1];
        if (last.length === this.maxBatchSize) {
          acc.push([value]);
          return acc;
        }
        last.push(value);
        return acc;
      },
      [[]]
    );

    const promises = msgs.map((ms) =>
      admin
        .messaging()
        .sendAll(ms)
        .catch((e) => {
          functions.logger.error(e);
        })
    );
    await Promise.all(promises);
  }
}
