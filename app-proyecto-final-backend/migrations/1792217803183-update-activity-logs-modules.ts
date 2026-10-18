import type { Connection } from 'mongoose';

type ActivityValidator = {
  $jsonSchema: {
    properties: {
      resourceType: {
        enum: string[];
      };
    };
  };
};

async function setResourceTypes(
  connection: Connection,
  types: string[],
): Promise<void> {
  const db = connection.db;

  if (!db) {
    throw new Error('Database connection is not ready');
  }

  const [info] = await db
    .listCollections({ name: 'activity_logs' }, { nameOnly: false })
    .toArray();

  const validator = info?.options?.validator as
    | ActivityValidator
    | undefined;

  if (!validator) {
    throw new Error(
      'activity_logs validator not found: run init-activity-logs first',
    );
  }

  validator.$jsonSchema.properties.resourceType.enum = types;

  await db.command({
    collMod: 'activity_logs',
    validator,
  });
}

export async function up(connection: Connection): Promise<void> {
  await setResourceTypes(connection, [
    'FILE',
    'FOLDER',
    'USER',
    'SETTING',
  ]);
}

export async function down(connection: Connection): Promise<void> {
  await setResourceTypes(connection, ['FILE', 'FOLDER', 'USER']);
}
