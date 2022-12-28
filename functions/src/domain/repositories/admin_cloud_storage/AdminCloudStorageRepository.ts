import { Bucket } from "@google-cloud/storage";
import { Storage } from "firebase-admin/lib/storage/storage";

/**
 * Admin Cloud Storage SDK を利用するためのクラス。
 */
export class AdminCloudStorageRepository {
  constructor(storage: Storage, bucket?: string) {
    this.storageBucket = storage.bucket(bucket);
  }

  private storageBucket: Bucket;

  /**
   *
   * @param {string} path - `images/sample.png`
   * @param {string | Buffer} buffer
   */
  async save(path: string, buffer: string | Buffer): Promise<void> {
    await this.storageBucket.file(path).save(buffer);
  }

  async delete(path: string): Promise<void> {
    await this.storageBucket.file(path).delete();
  }
}

export function getAdminCloudStorageRepository(storage: Storage, bucket?: string): AdminCloudStorageRepository {
  return new AdminCloudStorageRepository(storage, bucket);
}
