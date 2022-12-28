import * as functions from "firebase-functions";
import { AuthData } from "firebase-functions/lib/common/providers/https";

/**
 * CloudFunctions で利用する関数
 */
export class CloudFunctionsHelper {
  private constructor() {}

  static generateHttpsError(code: functions.https.FunctionsErrorCode, message: string, details?: unknown) {
    return new functions.https.HttpsError(code, message, details);
  }

  // Todo: ログの出力基準を明記
  /**
   * * debug
   * * log
   * * info
   * * error
   * * warn
   * * write
   */
  static functionsLogger = functions.logger;

  static isAuthenticated(context: functions.https.CallableContext): context is functions.https.CallableContext & {
    auth: AuthData;
  } {
    return context.auth !== undefined;
  }
}
