import * as functions from "firebase-functions";
import { FunctionsErrorCode } from "firebase-functions/v1/https";

/**
 * firebase-functions を import しなくても使えるようにする Helper クラス。
 */
export class CloudFunctionsHelper {
  private constructor() {}

  static logger = functions.logger;

  static httpError = (code: FunctionsErrorCode, message: string, details?: unknown) =>
    new functions.https.HttpsError(code, message, details);
}
