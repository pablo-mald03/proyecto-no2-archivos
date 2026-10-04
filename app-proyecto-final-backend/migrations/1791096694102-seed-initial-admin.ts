import * as argon2 from 'argon2';
import type { Connection } from 'mongoose';

const REQUIRED = ['INITIAL_ADMIN_USERNAME', 'INITIAL_ADMIN_EMAIL', 'INITIAL_ADMIN_PASSWORD'] as const;

export async function up(connection: Connection): Promise<void> {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  const username = process.env.INITIAL_ADMIN_USERNAME!.trim().toLowerCase();
  const email = process.env.INITIAL_ADMIN_EMAIL!.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD!;
  const firstName = process.env.INITIAL_ADMIN_FIRST_NAME?.trim() || 'Admin';
  const lastName = process.env.INITIAL_ADMIN_LAST_NAME?.trim() || 'Sistema';
  const quotaBytes = Number(process.env.DEFAULT_QUOTA_BYTES ?? 1073741824);

  if (password.length < 8) {
    throw new Error('INITIAL_ADMIN_PASSWORD must have at least 8 characters');
  }

  const users = connection.collection('users');

  // Idempotent: if the admin already exists, nothing is touched
  if (await users.findOne({ $or: [{ email }, { username }] })) {
    console.log(`Initial admin already exists (${username}): skipped`);
    return;
  }

  const role = await connection.collection('roles').findOne({ code: 'ADMIN' });
  if (!role) throw new Error('ADMIN role not found: run the roles migration first');

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const now = new Date();
  await users.insertOne({
    username,
    email,
    passwordHash,
    firstName,
    lastName,
    roleId: role._id,
    isActive: true,
    deactivatedAt: null,
    lastLoginAt: null,
    storage: { quotaBytes, usedBytes: 0 },
    createdAt: now,
    updatedAt: now,
  });
}

export async function down(): Promise<void> { }