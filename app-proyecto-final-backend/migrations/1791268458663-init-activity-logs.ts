import type { Connection } from 'mongoose';

const COLLECTION = 'activity_logs';

//Validator for the activity log migration model
const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'actorId', 'actorEmail', 'actorUsername', 'action',
      'resourceType', 'resourceId', 'resourceName', 'description', 'createdAt',
    ],
    properties: {
      actorId: { bsonType: 'objectId' },
      actorEmail: { bsonType: 'string', minLength: 5, maxLength: 254 },
      actorUsername: { bsonType: 'string', minLength: 3, maxLength: 60 },
      action: { bsonType: 'string', pattern: '^[A-Z][A-Z_]*$', maxLength: 40 },
      resourceType: { enum: ['FILE', 'FOLDER', 'USER'] },
      resourceId: { bsonType: 'objectId' },
      resourceName: { bsonType: 'string', minLength: 1, maxLength: 255 },
      description: { bsonType: 'string', minLength: 1, maxLength: 255 },
      targetUserId: { bsonType: 'objectId' },
      targetUserEmail: { bsonType: 'string', minLength: 5, maxLength: 254 },
      metadata: {
        bsonType: 'object',
        properties: {
          previousName: { bsonType: 'string', maxLength: 255 },
          fromFolderId: { bsonType: ['objectId', 'null'] },
          toFolderId: { bsonType: ['objectId', 'null'] },
          accessLevel: { bsonType: 'string', maxLength: 40 },
          previousAccessLevel: { bsonType: 'string', maxLength: 40 },
          granteeType: { bsonType: 'string', maxLength: 40 },
          sizeBytes: { bsonType: 'number', minimum: 0 },
          previousSizeBytes: { bsonType: 'number', minimum: 0 },
        },
      },
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
    { key: { actorId: 1, createdAt: -1 }, name: 'actorId_createdAt' },
    { key: { resourceId: 1, createdAt: -1 }, name: 'resourceId_createdAt' },
    { key: { action: 1, createdAt: -1 }, name: 'action_createdAt' },
    { key: { createdAt: -1 }, name: 'createdAt' },
  ]);
}

export async function down(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const exists = (await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray()).length > 0;
  if (exists) await db.dropCollection(COLLECTION);
}