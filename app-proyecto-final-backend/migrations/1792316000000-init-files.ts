import type { Connection } from 'mongoose';

const COLLECTION = 'files';

const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'ownerId',
      'name',
      'extension',
      'mimeType',
      'sizeBytes',
      'gridFsId',
      'isDeleted',
      'isTrashRoot',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      ownerId: { bsonType: 'objectId' },
      folderId: { bsonType: ['objectId', 'null'] },
      name: { bsonType: 'string', minLength: 1, maxLength: 255 },
      extension: { enum: ['txt', 'md'] },
      mimeType: { enum: ['text/plain', 'text/markdown'] },
      sizeBytes: { bsonType: 'number', minimum: 0 },
      gridFsId: { bsonType: 'objectId' },
      isDeleted: { bsonType: 'boolean' },
      deletedAt: { bsonType: ['date', 'null'] },
      deletedBy: { bsonType: ['objectId', 'null'] },
      trashBatchId: { bsonType: ['objectId', 'null'] },
      isTrashRoot: { bsonType: 'boolean' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

export async function up(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const exists = (await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray()).length > 0;
  if (exists) {
    await db.command({ collMod: COLLECTION, validator });
  } else {
    await db.createCollection(COLLECTION, { validator });
  }

  await db.collection(COLLECTION).createIndexes([
    // Unique active sibling file name per owner and folder
    {
      key: { ownerId: 1, folderId: 1, name: 1 },
      name: 'ownerId_folderId_name_active_unique',
      unique: true,
      partialFilterExpression: { isDeleted: false },
    },
    // Listing files in folder
    { key: { ownerId: 1, folderId: 1, isDeleted: 1 }, name: 'ownerId_folderId_isDeleted' },
    // Filter by extension and size
    { key: { ownerId: 1, extension: 1, isDeleted: 1 }, name: 'ownerId_extension_isDeleted' },
    { key: { ownerId: 1, sizeBytes: 1, isDeleted: 1 }, name: 'ownerId_sizeBytes_isDeleted' },
    // Trash listing and batch operations
    { key: { trashBatchId: 1 }, name: 'trashBatchId' },
    { key: { ownerId: 1, isTrashRoot: 1 }, name: 'ownerId_isTrashRoot' },
    // GridFS lookup
    { key: { gridFsId: 1 }, name: 'gridFsId' },
  ]);
}

export async function down(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const exists = (await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray()).length > 0;
  if (exists) {
    await db.dropCollection(COLLECTION);
  }
}
