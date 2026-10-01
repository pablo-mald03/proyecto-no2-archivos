# Gestión Documental - API (Backend)

API REST del sistema de gestión documental. Permite almacenar, organizar, consultar y compartir archivos entre usuarios, con control de permisos, papelera, cuotas de almacenamiento, historial de actividad y reportes.


## Requisitos previos

- Node.js 22.12 o superior (`node -v`). Se recomienda usar `nvm`.
- npm 10 o superior (`npm -v`).
- MongoDB como replica set. Es obligatorio porque las operaciones de consistencia (cuotas, papelera, movimiento de carpetas, eliminación definitiva) usan transacciones, y MongoDB solo las permite en un replica set.

## 1. Levantar MongoDB

Elige UNA de las tres opciones. En las tres, la cadena de conexión es la misma salvo en Atlas.

### Opción A: Docker (recomendada)

```bash
docker run -d --name gestion-doc-mongo \
  -p 27017:27017 \
  -v gestion_doc_mongo_data:/data/db \
  mongo:8 --replSet rs0 --bind_ip_all

# Solo la primera vez: inicializar el replica set
docker exec gestion-doc-mongo mongosh --eval \
  "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

Comandos útiles:

```bash
docker stop gestion-doc-mongo     # detener
docker start gestion-doc-mongo    # volver a iniciar (el replica set ya queda configurado)
docker rm -f gestion-doc-mongo && docker volume rm gestion_doc_mongo_data   # borrar todo y empezar de cero
```

### Opción B: MongoDB instalado en el sistema (Linux)

1. Instalar MongoDB Community Server y `mongosh` desde la web oficial.
2. Editar `/etc/mongod.conf` y agregar:

```yaml
replication:
  replSetName: rs0
```

3. Reiniciar el servicio:

```bash
sudo systemctl restart mongod
```

4. Inicializar el replica set una sola vez, indicando el host de forma explícita (evita que el driver intente conectarse al nombre de la máquina en lugar de `localhost`):

```bash
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### Opción C: MongoDB Atlas

1. Crear un clúster gratuito (M0).
2. Crear un usuario de base de datos y agregar tu IP en Network Access.
3. Copiar la cadena `mongodb+srv://...` y usarla como `MONGODB_URI`. Atlas ya incluye replica set.

### Verificar la conexión

```bash
mongosh "mongodb://localhost:27017/?replicaSet=rs0" --eval "rs.status().ok"
```

Debe devolver `1`. Se recomienda MongoDB Compass para inspeccionar los datos.

## 2. Instalación del proyecto

```bash
git clone <url-del-repositorio>
cd app-proyecto-final-backend
npm install
cp .env.example .env
```

Edita `.env` antes de arrancar.

## 3. Variables de entorno

Ejemplo de `.env` para desarrollo:

Para Atlas, `MONGODB_URI` tiene la forma `mongodb+srv://usuario:clave@cluster.../gestion_documental`.

El archivo `.env` no debe subirse al repositorio. Solo se versiona `.env.example`, sin secretos reales.

## 4. Ejecución

```bash
# desarrollo (recarga automática)
npm run start:dev

# ejecución normal
npm run start

# producción (requiere compilar antes)
npm run build
npm run start:prod
```

Con la aplicación en marcha:

- API: `http://localhost:3000/api`
- Documentación Swagger: `http://localhost:3000/docs`

## 5. Datos iniciales (seed)

```bash
npm run seed
```

Carga los datos de demostración: usuarios, carpetas, archivos, comparticiones, elementos en papelera e historial de actividad. Requiere MongoDB corriendo y las variables de entorno configuradas.

> Estado: el script se define en `src/seeds/seed.ts` y se completa después del modelado de la base de datos. Actualiza esta sección con las credenciales de los usuarios de prueba cuando esté listo.

## 6. Pruebas

```bash
npm run test        # unitarias
npm run test:e2e    # extremo a extremo
npm run test:cov    # cobertura
```

## Arquitectura

Cada módulo sigue la misma separación:

- `controller`: capa HTTP. Recibe DTOs y delega; no accede a modelos.
- `service`: lógica de negocio y reglas.
- `repository`: único lugar que conoce Mongoose.
- `dto/` y `schemas/`: contratos de entrada y esquemas de MongoDB.


## Solución de problemas

**Error `ERESOLVE` al instalar paquetes `@nestjs/*`.**
Las versiones más recientes de algunos paquetes exigen Nest 12. Este proyecto usa Nest 11, por lo que `@nestjs/swagger`, `@nestjs/mongoose`, `@nestjs/jwt` y `@nestjs/passport` deben instalarse en la línea 11 (`npm install @nestjs/swagger@^11`). No uses `--legacy-peer-deps` en el backend.

**La aplicación no arranca y lista variables faltantes.**
Es la validación del `.env`. Revisa que existan `MONGODB_URI`, `JWT_SECRET` y `CORS_ORIGIN`.

**Error de transacciones: "Transaction numbers are only allowed on a replica set member or mongos".**
MongoDB está corriendo sin replica set. Revisa la sección "Levantar MongoDB" y que `MONGODB_URI` incluya `?replicaSet=rs0`.

**Error de conexión o timeout con la opción nativa.**
Probablemente el replica set se inicializó con el nombre de la máquina. Vuelve a configurarlo con `host: 'localhost:27017'` como se indica en la Opción B.

**Falla la instalación de `argon2`.**
El paquete trae binarios precompilados para Linux, macOS y Windows. Si tu plataforma no los tiene, instala las herramientas de compilación y repite:

```bash
sudo apt install build-essential python3
npm install
```

**Las cookies no llegan desde el cliente.**
Verifica que `CORS_ORIGIN` coincida exactamente con el origen del cliente (esquema, host y puerto), y que las peticiones usen `withCredentials: true`.


## Licencia

Proyecto basado en el starter de [NestJS](https://nestjs.com), licenciado bajo MIT.