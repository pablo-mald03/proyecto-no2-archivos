import type { Connection } from 'mongoose';

type RolesValidator = { $jsonSchema: { required?: string[]; properties: Record<string, unknown> } };

//Principal role update for the role fields migration
async function readValidator(connection: Connection) {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');
  const [info] = await db.listCollections({ name: 'roles' }, { nameOnly: false }).toArray();
  const validator = info?.options?.validator as RolesValidator | undefined;
  if (!validator) throw new Error('roles validator not found: run the roles migration first');
  return { db, validator };
}

export async function up(connection: Connection): Promise<void> {
  const { db, validator } = await readValidator(connection);

  await db.collection('roles').updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true, deactivatedAt: null } },
  );

  const schema = validator.$jsonSchema;
  schema.properties.isActive = { bsonType: 'bool' };
  schema.properties.deactivatedAt = { bsonType: ['date', 'null'] };
  schema.required = [...new Set([...(schema.required ?? []), 'isActive'])];
  await db.command({ collMod: 'roles', validator });
}

export async function down(connection: Connection): Promise<void> {
  const { db, validator } = await readValidator(connection);
  const schema = validator.$jsonSchema;
  delete schema.properties.isActive;
  delete schema.properties.deactivatedAt;
  schema.required = (schema.required ?? []).filter((f) => f !== 'isActive');
  await db.command({ collMod: 'roles', validator });
}