/* eslint-disable require-jsdoc */
import { initialize } from "@/script/InitializeFirebaseApp";

class Sample {
  constructor(id: string) {
    this.id = id;
  }
  id: string;
}

async function saveClassToFirestore() {
  const instance = new Sample("id");
}

async function main() {
  try {
    initialize();
    await saveClassToFirestore();
  } catch (e) {
    console.error(e);
  }
}

main();
