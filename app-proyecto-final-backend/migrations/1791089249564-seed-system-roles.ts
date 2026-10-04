import type { Connection } from 'mongoose';

//Principal migration for the principal special data to run te application
export async function up(connection: Connection): Promise<void> {
  const catalog = await connection
    .collection('permissions')
    .find({}, { projection: { code: 1, _id: 0 } })
    .toArray();

  if (catalog.length === 0) {
    throw new Error('The permissions catalog is empty: run the permissions migration first');
  }

  const now = new Date();

  await connection.collection('roles').bulkWrite([
    {
      updateOne: {
        filter: { code: 'ADMIN' },
        update: {
          $setOnInsert: {
            name: 'Administrador',
            description: 'Supervisa la plataforma, administra usuarios y consulta información global',
            permissions: catalog.map((p) => p.code as string),
            isSystem: true,
            createdAt: now,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { code: 'USER' },
        update: {
          $setOnInsert: {
            name: 'Usuario',
            description: 'Administra sus archivos y carpetas, comparte y consulta lo compartido con él',
            permissions: ['DRIVE_ACCESS'],
            isSystem: true,
            createdAt: now,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    },
  ]);
}

export async function down(connection: Connection): Promise<void> {
  const roles = connection.collection('roles');
  const base = await roles.find({ code: { $in: ['ADMIN', 'USER'] } }, { projection: { _id: 1 } }).toArray();

  const inUse = await connection
    .collection('users')
    .countDocuments({ roleId: { $in: base.map((r) => r._id) } });
  if (inUse > 0) throw new Error('System roles are assigned to users: cannot roll back');

  await roles.deleteMany({ code: { $in: ['ADMIN', 'USER'] } });
}