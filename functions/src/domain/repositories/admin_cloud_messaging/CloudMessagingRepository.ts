import { messaging } from "firebase-admin";
import { Messaging } from "firebase-admin/lib/messaging/messaging";
import { Message } from "firebase-admin/lib/messaging/messaging-api";

import { functionsLogger } from "@/utils/CloudFunctionsHelper";

export type FcmBatchMessage = messaging.Message;
export type FcmBatchMessageContent = messaging.Notification;
export type FcmMessageContent = messaging.NotificationMessagePayload;

/**
 * Firebase Cloud Messaging を利用するためのクラス。
 */
export class FirebaseMessagingRepository {
  constructor(messaging: Messaging) {
    this.messaging = messaging;
  }

  private messaging: Messaging;

  async sendToToken(token: string, content: FcmMessageContent, priority?: string): Promise<void> {
    try {
      const option = {
        priority: priority ?? "high",
      };

      await this.messaging.sendToDevice(
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

  maxBatchSize = 500;

  /**
   * messaging.sendAll() は 500 を上限としているが、この関数の中で分割しているので、
   * 500 以上の配列を渡しても良い。
   * @param messages
   * @returns
   */
  async sendBatchToToken(messages: FcmBatchMessage[]): Promise<void> {
    // sendAll() は 500以下までしか一気に送信できない
    // 500以下ならそのまま送信
    if (messages.length <= this.maxBatchSize) {
      await this.messaging.sendAll(messages);
      return;
    }
    // 500以上なら、Message の多重配列にして Promise の配列を生成する
    const msgs = messages.reduce(
      (acc: Message[][], value) => {
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
      this.messaging.sendAll(ms).catch((e) => {
        functionsLogger.error(e);
      })
    );
    await Promise.all(promises);
  }

  async sendToTopic(topic: string, content: FcmMessageContent, priority?: string): Promise<void> {
    try {
      const option = {
        priority: priority ?? "high",
      };

      await this.messaging.sendToTopic(topic, { notification: content }, option);
    } catch (e) {
      console.error(e);
      return;
    }
  }
}

export function getFirebaseMessagingRepository(messaging: Messaging) {
  return new FirebaseMessagingRepository(messaging);
}
