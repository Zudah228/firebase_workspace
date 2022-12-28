import * as fs from "fs";

import { TestEnvironmentConfig } from "@firebase/rules-unit-testing";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin/app";

const dotenvConfig = dotenv.config().parsed;

const PROJECT_ID = dotenvConfig!.TEST_PROJECT_ID;

const adminConfig: admin.AppOptions = {
  projectId: PROJECT_ID,
  // storage の操作に、設定の必要がある
  storageBucket: `${PROJECT_ID}.appspot.com`,
};

const emulatorConfig: TestEnvironmentConfig = {
  projectId: PROJECT_ID,
  firestore: {
    rules: fs.readFileSync(`${__dirname}/../../../rules/firestore.rules`, "utf8"),
    host: "localhost",
    port: 8080,
  },
  storage: {
    rules: fs.readFileSync(`${__dirname}/../../../rules/storage.rules`, "utf8"),
    host: "localhost",
    port: 9199,
  },
};

export const testConfig = {
  adminConfig,
  emulatorConfig,
};
