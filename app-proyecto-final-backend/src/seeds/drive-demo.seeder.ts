import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersRepository } from 'src/users/repository/users.repository';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { FilesRepository } from 'src/files/repository/files.repository';
import { GridFsStorageService } from 'src/files/service/grid-fs-storage.service';
import { SharesRepository } from 'src/sharing/repository/shares.repository';
import { CommentsRepository } from 'src/comments/repository/comments.repository';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { AccessLevel, GranteeType } from 'src/common/constants/permissions/access-level';
import { DEV_USERS } from './data/dev-users.data';
import { UserDocument } from 'src/users/entities/user.entity';
import { FolderDocument } from 'src/folders/entities/folder.entity';
import { FileDocument } from 'src/files/entities/file.entity';

/*Principal drive demo seeder class*/
export class DriveDemoSeeder {
  private readonly logger = new Logger(DriveDemoSeeder.name);

  constructor(
    private readonly users: UsersRepository,
    private readonly folders: FoldersRepository,
    private readonly files: FilesRepository,
    private readonly gridFsStorage: GridFsStorageService,
    private readonly shares: SharesRepository,
    private readonly comments: CommentsRepository,
    private readonly activity: ActivityRecorderService,
  ) { }

  async run(): Promise<void> {
    this.logger.log('Starting Drive demo dataset seeder...');

    const loadedUsers: UserDocument[] = [];
    for (const u of DEV_USERS) {
      const userDoc = await this.users.findByUsername(u.username);
      if (userDoc) loadedUsers.push(userDoc);
    }

    if (loadedUsers.length < 4) {
      this.logger.warn('Users are not fully created yet. Please run users seeder first.');
      return;
    }

    const [pablo, carlos, maria, ana, david, elena, roberto, lucia] = loadedUsers;

    this.logger.log('Seeding folders structure...');
    const fProyectos = await this.getOrCreateFolder(pablo._id, null, [], 'Proyectos 2026', pablo);
    const fBackend = await this.getOrCreateFolder(pablo._id, fProyectos._id, [fProyectos._id], 'Backend NestJS', pablo);
    const fDocs = await this.getOrCreateFolder(pablo._id, null, [], 'Documentación General', pablo);

    const fDiseno = await this.getOrCreateFolder(maria._id, null, [], 'Diseño UI UX', maria);
    const fFigma = await this.getOrCreateFolder(maria._id, fDiseno._id, [fDiseno._id], 'Wireframes', maria);

    const fQA = await this.getOrCreateFolder(david._id, null, [], 'Pruebas y QA', david);
    const fLogsQA = await this.getOrCreateFolder(david._id, fQA._id, [fQA._id], 'Logs de Regresión', david);

    const fArqui = await this.getOrCreateFolder(roberto._id, null, [], 'Arquitectura de Software', roberto);
    const fDiagramas = await this.getOrCreateFolder(roberto._id, fArqui._id, [fArqui._id], 'Diagramas C4', roberto);

    const fTrashDemo = await this.getOrCreateFolder(carlos._id, null, [], 'Carpeta Obsoleta', carlos);
    const fSubTrash = await this.getOrCreateFolder(carlos._id, fTrashDemo._id, [fTrashDemo._id], 'Archivos Viejos', carlos);

    const allFolders = [fProyectos, fBackend, fDocs, fDiseno, fFigma, fQA, fLogsQA, fArqui, fDiagramas, fTrashDemo, fSubTrash];

    this.logger.log('Seeding 50 files...');
    const allFiles: FileDocument[] = [];

    const fileBlueprints = [
      { owner: pablo, folder: fBackend, name: 'arquitectura-api.md', content: '# Arquitectura de la API\n\nMicroservicios modulares en NestJS.' },
      { owner: pablo, folder: fBackend, name: 'configuracion-docker.txt', content: 'DOCKER_PORT=3000\nREPLICA_SET=rs0\n' },
      { owner: pablo, folder: fBackend, name: 'endpoints-auth.md', content: '## Auth\n- POST /login\n- POST /refresh\n' },
      { owner: pablo, folder: fProyectos, name: 'alcance-proyecto.md', content: '# Alcance\nRequerimientos y entregables finales.' },
      { owner: pablo, folder: fProyectos, name: 'cronograma-fases.txt', content: 'Fase 1: Auth\nFase 2: Files\nFase 3: ACL\n' },
      { owner: pablo, folder: fDocs, name: 'normas-codigo.md', content: 'Clean Code y Principios SOLID aplicados a TypeScript.' },
      { owner: pablo, folder: fDocs, name: 'variables-entorno.txt', content: 'NODE_ENV=development\nPORT=3000\n' },
      { owner: pablo, folder: null, name: 'notas-personales.txt', content: 'Ideas para optimizar las consultas en MongoDB.' },
      { owner: pablo, folder: null, name: 'checklist-entrega.md', content: '- [x] Backend\n- [ ] Frontend Angular\n' },
      { owner: pablo, folder: fBackend, name: 'estrategia-seguridad.md', content: 'Helmet, Throttler y JWT httpOnly cookies.' },

      { owner: carlos, folder: null, name: 'script-migraciones.txt', content: 'migrate up --autosync true' },
      { owner: carlos, folder: null, name: 'setup-linux.md', content: '# Setup Linux Ubuntu\n\nComandos básicos para Node y Docker.' },
      { owner: carlos, folder: fTrashDemo, name: 'reporte-fallido.txt', content: 'Error 500 en pruebas preliminares obsoletas.' },
      { owner: carlos, folder: fSubTrash, name: 'backup-viejo.txt', content: 'Backup temporal del 2025.' },
      { owner: carlos, folder: null, name: 'notas-sprint.md', content: 'Reunión diaria con equipo de desarrollo.' },
      { owner: carlos, folder: null, name: 'comandos-git.txt', content: 'git status\ngit commit -m "feat: folders"\n' },
      { owner: carlos, folder: null, name: 'guia-mongodb.md', content: '# MongoDB Replica Set\nConfiguración paso a paso.' },
      { owner: carlos, folder: null, name: 'archivo-para-papelera.txt', content: 'Este archivo se eliminará a la papelera.' },

      { owner: maria, folder: fDiseno, name: 'guia-estilos.md', content: '# Paleta de colores\nPrimary: #6366F1\nDark: #0F172A\n' },
      { owner: maria, folder: fDiseno, name: 'tokens-tipografia.txt', content: 'Font: Inter, Roboto\nHeading: 2rem\n' },
      { owner: maria, folder: fFigma, name: 'especificacion-wireframe.md', content: 'Layout responsive para móvil y escritorio.' },
      { owner: maria, folder: fFigma, name: 'links-figma.txt', content: 'https://figma.com/file/proyecto-final\n' },
      { owner: maria, folder: null, name: 'componentes-angular.md', content: 'Componentes standalone y Angular Material UI.' },
      { owner: maria, folder: null, name: 'feedback-usuarios.txt', content: 'Los botones de acción deben ser más visibles.' },

      { owner: ana, folder: null, name: 'analisis-requisitos.md', content: '# Historias de Usuario\nComo usuario quiero subir archivos txt y md.' },
      { owner: ana, folder: null, name: 'casos-de-uso.txt', content: 'CU-01 Subir Archivo\nCU-02 Compartir Carpeta\n' },
      { owner: ana, folder: null, name: 'matriz-trazabilidad.md', content: 'Mapeo entre requerimientos y endpoints REST.' },
      { owner: ana, folder: null, name: 'resumen-ejecutivo.txt', content: 'Estado del proyecto: 90% completado.' },
      { owner: ana, folder: null, name: 'criterios-aceptacion.md', content: 'Validaciones de extensiones y cuotas de usuario.' },
      { owner: ana, folder: null, name: 'metricas-drive.txt', content: 'Tiempo promedio de subida: < 200ms.' },

      { owner: david, folder: fQA, name: 'plan-de-pruebas.md', content: '# Plan de Pruebas Unitarias e Integración\nCasos de prueba con Jest.' },
      { owner: david, folder: fQA, name: 'casos-limite-tamano.txt', content: 'Archivo de 0 bytes\nArchivo de 100MB\n' },
      { owner: david, folder: fLogsQA, name: 'log-ejecucion-octubre.txt', content: 'All 45 test suites passed successfully.' },
      { owner: david, folder: fLogsQA, name: 'bugs-resueltos.md', content: 'Bug en ancestros al mover carpetas solucionado.' },
      { owner: david, folder: null, name: 'automatizacion-e2e.md', content: 'Escenarios Cypress y Supertest.' },
      { owner: david, folder: null, name: 'checklist-qa.txt', content: '- [x] Validaciones DTO\n- [x] JWT Cookies\n' },

      { owner: elena, folder: null, name: 'acta-constitucion.md', content: '# Acta de Constitución del Proyecto\nObjetivos y alcances del sistema.' },
      { owner: elena, folder: null, name: 'asignacion-roles.txt', content: 'Pablo: Backend\nMaria: Diseño\nDavid: QA\n' },
      { owner: elena, folder: null, name: 'presupuesto-almacenamiento.md', content: 'Cuotas estándar de 1GB por usuario.' },
      { owner: elena, folder: null, name: 'reporte-avance-semanal.txt', content: 'Semana 3: Módulos de archivos y ACL terminados.' },
      { owner: elena, folder: null, name: 'minuta-reunion-stakeholders.md', content: 'Aprobación de la arquitectura por el evaluador.' },
      { owner: elena, folder: null, name: 'riesgos-mitigaciones.txt', content: 'Riesgo: Caída de base de datos -> Replica Set.' },

      { owner: roberto, folder: fArqui, name: 'patron-repositorios.md', content: '# Patrón Repositorio en NestJS\nSeparación limpia de Mongoose.' },
      { owner: roberto, folder: fDiagramas, name: 'diagrama-c4-contexto.txt', content: 'Usuario -> Web App Angular -> API NestJS -> MongoDB' },
      { owner: roberto, folder: fDiagramas, name: 'diagrama-c4-contenedores.md', content: 'Contenedor Docker para Mongo y Docker para NestJS.' },
      { owner: roberto, folder: null, name: 'optimizacion-indices.txt', content: 'Índices compuestos en shares y folders.' },

      { owner: lucia, folder: null, name: 'manual-usuario.md', content: '# Manual de Usuario\nGuía para compartir archivos y carpetas.' },
      { owner: lucia, folder: null, name: 'glosario-terminos.txt', content: 'ACL: Lista de Control de Acceso\nGridFS: Almacén binario\n' },
      { owner: lucia, folder: null, name: 'preguntas-frecuentes.md', content: '¿Qué archivos puedo subir? Solo archivos .txt y .md.' },
      { owner: lucia, folder: null, name: 'politica-privacidad.txt', content: 'Privacidad y protección de documentos de usuario.' },
    ];

    for (const blueprint of fileBlueprints) {
      const ext = blueprint.name.endsWith('.md') ? 'md' : 'txt';
      const mime = ext === 'md' ? 'text/markdown' : 'text/plain';
      const fileDoc = await this.getOrCreateFile(
        blueprint.owner,
        blueprint.folder?._id || null,
        blueprint.name,
        ext,
        mime,
        blueprint.content,
      );
      allFiles.push(fileDoc);
    }

    this.logger.log('Seeding 20+ share operations...');
    const shareOps = [
      { resType: 'FOLDER' as const, resId: fProyectos._id, owner: pablo, granteeType: GranteeType.USER, grantee: carlos, access: AccessLevel.EDITOR },
      { resType: 'FOLDER' as const, resId: fProyectos._id, owner: pablo, granteeType: GranteeType.USER, grantee: ana, access: AccessLevel.COMMENTER },
      { resType: 'FOLDER' as const, resId: fProyectos._id, owner: pablo, granteeType: GranteeType.USER, grantee: elena, access: AccessLevel.VIEWER },
      { resType: 'FOLDER' as const, resId: fDocs._id, owner: pablo, granteeType: GranteeType.ANY_USER, grantee: null, access: AccessLevel.VIEWER },
      { resType: 'FILE' as const, resId: allFiles[0]._id, owner: pablo, granteeType: GranteeType.USER, grantee: roberto, access: AccessLevel.EDITOR },
      { resType: 'FILE' as const, resId: allFiles[2]._id, owner: pablo, granteeType: GranteeType.USER, grantee: david, access: AccessLevel.VIEWER },

      { resType: 'FOLDER' as const, resId: fDiseno._id, owner: maria, granteeType: GranteeType.USER, grantee: pablo, access: AccessLevel.EDITOR },
      { resType: 'FOLDER' as const, resId: fDiseno._id, owner: maria, granteeType: GranteeType.USER, grantee: elena, access: AccessLevel.COMMENTER },
      { resType: 'FILE' as const, resId: allFiles[18]._id, owner: maria, granteeType: GranteeType.ANY_USER, grantee: null, access: AccessLevel.VIEWER },
      { resType: 'FILE' as const, resId: allFiles[19]._id, owner: maria, granteeType: GranteeType.USER, grantee: carlos, access: AccessLevel.VIEWER },

      { resType: 'FOLDER' as const, resId: fQA._id, owner: david, granteeType: GranteeType.USER, grantee: pablo, access: AccessLevel.EDITOR },
      { resType: 'FOLDER' as const, resId: fQA._id, owner: david, granteeType: GranteeType.USER, grantee: carlos, access: AccessLevel.COMMENTER },
      { resType: 'FILE' as const, resId: allFiles[30]._id, owner: david, granteeType: GranteeType.USER, grantee: roberto, access: AccessLevel.VIEWER },

      { resType: 'FOLDER' as const, resId: fArqui._id, owner: roberto, granteeType: GranteeType.USER, grantee: pablo, access: AccessLevel.EDITOR },
      { resType: 'FOLDER' as const, resId: fArqui._id, owner: roberto, granteeType: GranteeType.USER, grantee: carlos, access: AccessLevel.VIEWER },
      { resType: 'FILE' as const, resId: allFiles[42]._id, owner: roberto, granteeType: GranteeType.ANY_USER, grantee: null, access: AccessLevel.VIEWER },

      { resType: 'FILE' as const, resId: allFiles[36]._id, owner: elena, granteeType: GranteeType.USER, grantee: pablo, access: AccessLevel.VIEWER },
      { resType: 'FILE' as const, resId: allFiles[36]._id, owner: elena, granteeType: GranteeType.USER, grantee: maria, access: AccessLevel.VIEWER },
      { resType: 'FILE' as const, resId: allFiles[37]._id, owner: elena, granteeType: GranteeType.USER, grantee: david, access: AccessLevel.COMMENTER },
      { resType: 'FILE' as const, resId: allFiles[38]._id, owner: elena, granteeType: GranteeType.USER, grantee: ana, access: AccessLevel.EDITOR },
      { resType: 'FILE' as const, resId: allFiles[46]._id, owner: lucia, granteeType: GranteeType.ANY_USER, grantee: null, access: AccessLevel.VIEWER },
      { resType: 'FILE' as const, resId: allFiles[47]._id, owner: lucia, granteeType: GranteeType.USER, grantee: pablo, access: AccessLevel.COMMENTER },
    ];

    for (const s of shareOps) {
      await this.shares.upsertShare({
        resourceType: s.resType,
        resourceId: s.resId,
        ownerId: s.owner._id,
        granteeType: s.granteeType,
        granteeId: s.grantee ? s.grantee._id : null,
        access: s.access,
      });

      this.activity.record({
        actor: { id: s.owner.id, username: s.owner.username, email: s.owner.email },
        action: ActivityAction.ACCESS_GRANTED,
        description: `Otorgó acceso ${s.access} en ${s.resType.toLowerCase()}`,
        resource: { type: s.resType, id: s.resId.toString(), name: 'Recurso Compartido' },
        metadata: { accessLevel: s.access, granteeType: s.granteeType },
      });
    }

    this.logger.log('Sending sample files & folders to trash...');
    const trashBatch1 = new Types.ObjectId();
    await this.folders.moveToTrash(fTrashDemo._id, [fSubTrash._id], trashBatch1, carlos._id);
    await this.files.moveByFolderIdsToTrash([fTrashDemo._id, fSubTrash._id], trashBatch1, carlos._id);

    const fileToTrash = allFiles[17];
    const trashBatch2 = new Types.ObjectId();
    await this.files.moveToTrash(fileToTrash._id, trashBatch2, carlos._id);

    this.activity.record({
      actor: { id: carlos.id, username: carlos.username, email: carlos.email },
      action: ActivityAction.FOLDER_TRASHED,
      description: `Envió la carpeta "${fTrashDemo.name}" a la papelera`,
      resource: { type: ResourceType.FOLDER, id: fTrashDemo._id.toString(), name: fTrashDemo.name },
    });

    this.activity.record({
      actor: { id: carlos.id, username: carlos.username, email: carlos.email },
      action: ActivityAction.FILE_TRASHED,
      description: `Envió el archivo "${fileToTrash.name}" a la papelera`,
      resource: { type: ResourceType.FILE, id: fileToTrash._id.toString(), name: fileToTrash.name },
    });

    this.logger.log('Adding comments on shared files...');
    const fileWithComments = allFiles[0];
    const c1 = await this.comments.create({
      fileId: fileWithComments._id,
      authorId: roberto._id,
      parentId: null,
      content: 'Excelente propuesta arquitectónica. Sugiero validar que los throttlers estén activos en producción.',
    });

    await this.comments.create({
      fileId: fileWithComments._id,
      authorId: pablo._id,
      parentId: c1._id,
      content: 'De acuerdo Roberto, agregué ThrottlerGuard en los endpoints sensibles.',
    });

    this.logger.log('Demo dataset successfully seeded!');
  }

  private async getOrCreateFolder(
    ownerId: Types.ObjectId,
    parentId: Types.ObjectId | null,
    ancestors: Types.ObjectId[],
    name: string,
    owner: UserDocument,
  ): Promise<FolderDocument> {
    const existing = await (this.folders as any).model.findOne({ ownerId, parentId, name, isDeleted: false });
    if (existing) return existing;

    const created = await this.folders.create({ ownerId, parentId, ancestors, name });

    this.activity.record({
      actor: { id: owner.id, username: owner.username, email: owner.email },
      action: ActivityAction.FOLDER_CREATED,
      description: `Creó la carpeta "${name}"`,
      resource: { type: ResourceType.FOLDER, id: created._id.toString(), name },
      metadata: { toFolderId: parentId },
    });

    return created;
  }

  private async getOrCreateFile(
    owner: UserDocument,
    folderId: Types.ObjectId | null,
    name: string,
    extension: 'txt' | 'md',
    mimeType: string,
    content: string,
  ): Promise<FileDocument> {
    const existing = await (this.files as any).model.findOne({ ownerId: owner._id, folderId, name, isDeleted: false });
    if (existing) return existing;

    const buffer = Buffer.from(content, 'utf8');
    const sizeBytes = buffer.length;

    const gridFsId = await this.gridFsStorage.uploadFile(name, buffer, mimeType);

    const fileDoc = await this.files.create({
      ownerId: owner._id,
      folderId,
      name,
      extension,
      mimeType,
      sizeBytes,
      gridFsId,
    });

    await this.users.reserveStorageQuota(owner._id, sizeBytes);

    this.activity.record({
      actor: { id: owner.id, username: owner.username, email: owner.email },
      action: ActivityAction.FILE_UPLOADED,
      description: `Subió el archivo "${name}" (${sizeBytes} bytes)`,
      resource: { type: ResourceType.FILE, id: fileDoc._id.toString(), name },
      metadata: { toFolderId: folderId, sizeBytes },
    });

    return fileDoc;
  }
}
