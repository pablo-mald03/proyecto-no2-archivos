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

//Migration to update the log activity modules for roles
async function changeResourceTypes(connection: Connection, change: (types: string[]) => string[]): Promise<void> {
  const db = connection.db;
  if (!db) throw new Error('Database connection is not ready');

  const [info] = await db.listCollections({ name: 'activity_logs' }, { nameOnly: false }).toArray();
  const validator = info?.options?.validator as ActivityValidator | undefined;
  if (!validator) throw new Error('activity_logs validator not found');

  const resourceType = validator.$jsonSchema.properties.resourceType;
  resourceType.enum = change(resourceType.enum);
  await db.command({ collMod: 'activity_logs', validator });
}

export const up = (c: Connection) => 
  changeResourceTypes(c, (t) => (t.includes('ROLE') ? t : [...t, 'ROLE']));


export const down = (c: Connection) => 
  changeResourceTypes(c, (t) => t.filter((x) => x !== 'ROLE'));
