// Import your schemas here
import type { Connection } from 'mongoose'

//Migrations for the principal indexes for the database

export async function up(connection: Connection): Promise<void> {
  await connection.collection('permissions').createIndex({ code: 1 }, { unique: true });
  await connection.collection('roles').createIndex({ code: 1 }, { unique: true });

  const users = connection.collection('users');
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ roleId: 1 });

  const tokens = connection.collection('refresh_tokens');
  await tokens.createIndex({ userId: 1 });
  await tokens.createIndex({ tokenHash: 1 }, { unique: true });
  await tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function down(connection: Connection): Promise<void> {
  await connection.collection('permissions').dropIndex('code_1');
  await connection.collection('roles').dropIndex('code_1');

  const users = connection.collection('users');
  await users.dropIndex('username_1');
  await users.dropIndex('email_1');
  await users.dropIndex('roleId_1');

  const tokens = connection.collection('refresh_tokens');
  await tokens.dropIndex('userId_1');
  await tokens.dropIndex('tokenHash_1');
  await tokens.dropIndex('expiresAt_1');
}