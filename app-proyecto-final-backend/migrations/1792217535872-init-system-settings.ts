import type { Connection } from 'mongoose';

const COLLECTION = 'system_settings';

//Principal system settings migration

const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['key', 'value', 'description', 'createdAt', 'updatedAt'],
    properties: {
      key: { bsonType: 'string', minLength: 3, maxLength: 100 },
      value: { bsonType: ['string', 'number'] },
      description: { bsonType: 'string', minLength: 1, maxLength: 255 },
      updatedBy: { bsonType: 'objectId' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

const INITIAL = [
  { key: 'storage.defaultQuotaBytes', value: 1073741824,
    description: 'Cuota de almacenamiento por defecto para usuarios nuevos (en bytes)' },
  { key: 'users.defaultRoleCode', value: 'USER',
    description: 'Rol asignado por defecto a los usuarios nuevos' },
];

export async function up(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const exists = (await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray()).length > 0;
  if (exists) await db.command({ collMod: COLLECTION, validator });
  else await db.createCollection(COLLECTION, { validator });

  const col = db.collection(COLLECTION);
  await col.createIndex({ key: 1 }, { unique: true, name: 'key_unique' });

  const now = new Date();
  for (const setting of INITIAL) {
    await col.updateOne(
      { key: setting.key },
      { $setOnInsert: { ...setting, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
  }
}

export async function down(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');
  const exists = (await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray()).length > 0;
  if (exists) await db.dropCollection(COLLECTION);
}