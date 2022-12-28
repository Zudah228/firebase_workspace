import * as functions from "firebase-functions";

const CLOUD_FUNCTIONS_REGION = "asia-northeast1";
const enforceAppCheck = true;

export const endpoint = functions.region(CLOUD_FUNCTIONS_REGION).runWith({ enforceAppCheck });
