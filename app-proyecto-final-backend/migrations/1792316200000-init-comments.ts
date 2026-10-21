import type { Connection } from 'mongoose';

const COLLECTION = 'comments';

// Migration to create comments collection with schema validator and indexes
const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['fileId', 'authorId', 'content', 'isDeleted', 'createdAt'],
    properties: {
      fileId: { bsonType: 'objectId' },
      authorId: { bsonType: 'objectId' },
      parentId: { bsonType: ['objectId', 'null'] },
      content: { bsonType: 'string', minLength: 1, maxLength: 2000 },
      isDeleted: { bsonType: 'bool' },
      editedAt: { bsonType: ['date', 'null'] },
      createdAt: { bsonType: 'date' },
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
    // Querying comments of a file chronologically
    { key: { fileId: 1, createdAt: 1 }, name: 'fileId_createdAt' },
    // Querying subthreads / replies by parentId
    { key: { parentId: 1, createdAt: 1 }, name: 'parentId_createdAt' },
    // Querying author comments
    { key: { authorId: 1 }, name: 'authorId' },
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
