import type { Connection } from 'mongoose';

//Principal migration for the fields of schema
type JsonSchema = Record<string, unknown>;

const str = (minLength: number, maxLength: number, pattern?: string): JsonSchema => ({
  bsonType: 'string',
  minLength,
  maxLength,
  ...(pattern ? { pattern } : {}),
});

const CODE_PATTERN = '^[A-Z][A-Z0-9_]*$';

// Audit fields shared by every auditable collection
const AUDIT_FIELDS: Record<string, JsonSchema> = {
  createdAt: { bsonType: 'date' },
  updatedAt: { bsonType: 'date' },
};

const AUDIT_REQUIRED = ['createdAt', 'updatedAt'];

//Schemas modeling
const SCHEMAS: Record<string, JsonSchema> = {
  permissions: {
    required: ['code', 'module', 'name', 'description', ...AUDIT_REQUIRED],
    properties: {
      code: str(2, 60, CODE_PATTERN),
      module: str(2, 60, '^[A-Z_]+$'),
      name: str(3, 150),
      description: str(3, 255),
      ...AUDIT_FIELDS,
    },
  },
  roles: {
    required: ['code', 'name', 'permissions', 'isSystem', ...AUDIT_REQUIRED],
    properties: {
      code: str(2, 50, CODE_PATTERN),
      name: str(3, 50),
      description: str(0, 255),
      permissions: { bsonType: 'array', uniqueItems: true, items: str(2, 60) },
      isSystem: { bsonType: 'bool' },
      ...AUDIT_FIELDS,
    },
  },
  users: {
    required: [
      'username', 'email', 'passwordHash', 'firstName', 'lastName',
      'roleId', 'isActive', 'storage', ...AUDIT_REQUIRED,
    ],
    properties: {
      username: str(3, 60, '^[a-z0-9._-]+$'),
      email: str(5, 254, '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'),
      passwordHash: str(20, 255),
      firstName: str(1, 60),
      lastName: str(1, 60),
      roleId: { bsonType: 'objectId' },
      isActive: { bsonType: 'bool' },
      deactivatedAt: { bsonType: ['date', 'null'] },
      lastLoginAt: { bsonType: ['date', 'null'] },
      storage: {
        bsonType: 'object',
        required: ['quotaBytes', 'usedBytes'],
        properties: {
          quotaBytes: { bsonType: 'number', minimum: 0 },
          usedBytes: { bsonType: 'number', minimum: 0 },
        },
      },
      ...AUDIT_FIELDS,
    },
  },
  refresh_tokens: {
    required: ['userId', 'tokenHash', 'expiresAt'],
    properties: {
      userId: { bsonType: 'objectId' },
      tokenHash: str(64, 64, '^[a-f0-9]{64}$'),
      expiresAt: { bsonType: 'date' },
      revokedAt: { bsonType: ['date', 'null'] },
      ...AUDIT_FIELDS,
    },
  },
};

export async function up(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database handle not available');

  for (const [collection, schema] of Object.entries(SCHEMAS)) {
    await db.command({
      collMod: collection,
      validator: { $jsonSchema: { bsonType: 'object', ...schema } },
      validationLevel: 'strict',
      validationAction: 'error',
    });
  }
}

export async function down(connection: Connection): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database handle not available');

  for (const collection of Object.keys(SCHEMAS)) {
    await db.command({ collMod: collection, validator: {}, validationLevel: 'off' });
  }
}