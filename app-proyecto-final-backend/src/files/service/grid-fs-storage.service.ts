import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { GridFSBucket } from 'mongodb';

//Principal grid fs storage service class
@Injectable()
export class GridFsStorageService {
  private bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    if (!this.connection.db) {
      throw new Error('Database connection is not ready for GridFS');
    }
    this.bucket = new GridFSBucket(this.connection.db, { bucketName: 'fs' });
  }

  // Method to upload a buffer to GridFS and returns the generated ObjectId
  async uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<Types.ObjectId> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata: {
          contentType: mimeType,
        },
      });

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);

      readable
        .pipe(uploadStream)
        .on('finish', () => resolve(new Types.ObjectId(uploadStream.id)))
        .on('error', (err) => reject(err));
    });
  }


  /**
   * Method to get a readable stream for a file stored in GridFS
   */
  openDownloadStream(gridFsId: Types.ObjectId | string): NodeJS.ReadableStream {
    return this.bucket.openDownloadStream(new Types.ObjectId(gridFsId));
  }

  /**
   * Principal method to delete a file from GridFS by its ObjectId
   */
  async deleteFile(gridFsId: Types.ObjectId | string): Promise<void> {
    try {
      await this.bucket.delete(new Types.ObjectId(gridFsId));
    } catch (err: any) {
      if (err.message && err.message.includes('FileNotFound')) {
        return;
      }
      throw err;
    }
  }
}
