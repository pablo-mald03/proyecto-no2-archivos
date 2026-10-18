import type { Connection } from 'mongoose';

const COLLECTION = 'shares';

//Migration for create shares collection and indexes
const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'resourceType',
      'resourceId',
      'ownerId',
      'granteeType',
      'access',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      resourceType: { enum: ['FILE', 'FOLDER'] },
      resourceId: { bsonType: 'objectId' },
      ownerId: { bsonType: 'objectId' },
      granteeType: { enum: ['USER', 'ANY_USER'] },
      granteeId: { bsonType: ['objectId', 'null'] },
      access: { enum: ['VIEWER', 'COMMENTER', 'EDITOR'] },
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
    {
      key: { resourceType: 1, resourceId: 1, granteeType: 1, granteeId: 1 },
      name: 'resourceType_resourceId_grantee_unique',
      unique: true,
    },
    { key: { resourceType: 1, resourceId: 1 }, name: 'resourceType_resourceId' },
    { key: { granteeId: 1, resourceType: 1 }, name: 'granteeId_resourceType' },
    { key: { ownerId: 1 }, name: 'ownerId' },
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
