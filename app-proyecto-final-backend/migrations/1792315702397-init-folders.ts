import type { Connection } from 'mongoose';

const COLLECTION = 'folders';

const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'ownerId',
      'name',
      'ancestors',
      'isDeleted',
      'isTrashRoot',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      ownerId: { bsonType: 'objectId' },
      parentId: { bsonType: ['objectId', 'null'] },
      name: { bsonType: 'string', minLength: 1, maxLength: 255 },
      ancestors: {
        bsonType: 'array',
        items: { bsonType: 'objectId' },
      },
      isDeleted: { bsonType: 'bool' },
      deletedAt: { bsonType: ['date', 'null'] },
      deletedBy: { bsonType: ['objectId', 'null'] },
      trashBatchId: { bsonType: ['objectId', 'null'] },
      isTrashRoot: { bsonType: 'bool' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

export async function up(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const exists =
    (await db
      .listCollections({ name: COLLECTION }, { nameOnly: true })
      .toArray()).length > 0;

  if (exists) {
    await db.command({ collMod: COLLECTION, validator });
  } else {
    await db.createCollection(COLLECTION, { validator });
  }

  await db.collection(COLLECTION).createIndexes([
    {
      key: { ownerId: 1, parentId: 1, name: 1 },
      name: 'ownerId_parentId_name_active_unique',
      unique: true,
      partialFilterExpression: { isDeleted: false },
    },
    { key: { ancestors: 1 }, name: 'ancestors' },
    { key: { trashBatchId: 1 }, name: 'trashBatchId' },
    { key: { ownerId: 1, isTrashRoot: 1 }, name: 'ownerId_isTrashRoot' },
    {
      key: { ownerId: 1, parentId: 1, isDeleted: 1 },
      name: 'ownerId_parentId_isDeleted',
    },
  ]);
}

export async function down(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const exists =
    (await db
      .listCollections({ name: COLLECTION }, { nameOnly: true })
      .toArray()).length > 0;

  if (exists) {
    await db.dropCollection(COLLECTION);
  }
}