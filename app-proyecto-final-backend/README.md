# Gestión Documental - API (Backend)

API REST del sistema de gestión documental. Permite almacenar, organizar, consultar y compartir archivos entre usuarios, con control de permisos, papelera, cuotas de almacenamiento, historial de actividad y reportes.

## Requisitos previos

* Node.js 22.12 o superior (`node -v`). Se recomienda usar `nvm`.

* npm 10 o superior (`npm -v`).

* Docker y Docker Compose.

* MongoDB como replica set. Es obligatorio porque las operaciones de consistencia (cuotas, papelera, movimiento de carpetas y eliminación definitiva) utilizan transacciones, y MongoDB requiere un replica set para soportarlas.

\> *Recomendación: utilizar Docker para evitar diferencias de configuración entre equipos.

---

## 1. Levantar MongoDB

### Opción A: Docker Compose — recomendada

El proyecto incluye la configuración de MongoDB en `docker-compose.yml`.

Desde la raíz del backend:

```bash

docker compose up -d

```

Verificar que el contenedor esté ejecutándose:

```bash

docker ps

```

Debe aparecer el contenedor:

```text

document-mgmt-mongo

```

Verificar los logs:

```bash

docker logs document-mgmt-mongo --tail 50

```

Verificar el estado de salud:

```bash

docker inspect --format='{{.State.Health.Status}}' document-mgmt-mongo

```

Cuando todo esté correcto debe mostrar:

```text

healthy

```

### Configuración utilizada

* MongoDB: `8`

* Contenedor: `document-mgmt-mongo`

* Puerto local: `27017`

* Base de datos: `gestion_documental`

* Usuario de aplicación: `gestion_app`

* Replica set: `rs0`

* Autenticación mediante usuario/contraseña y keyfile.

* Los datos se almacenan en un volumen Docker persistente.

La cadena de conexión local utilizada por la aplicación es:

```text

mongodb://gestion_app:<password>@localhost:27017/gestion_documental?replicaSet=rs0&authSource=gestion_documental

```

\> Importante: esta URL contiene la contraseña de MongoDB. Es válida para el entorno de desarrollo/calificación local, pero no debe publicarse en repositorios públicos, capturas de pantalla, documentación pública ni compartirla fuera del equipo.

\>

\> En un entorno real, la contraseña debe almacenarse únicamente en variables de entorno o un gestor de secretos.

### Comandos útiles

Detener MongoDB:

```bash

docker compose stop

```

Volver a iniciar:

```bash

docker compose start

```

Recrear los contenedores:

```bash

docker compose up -d

```

Eliminar el contenedor:

```bash

docker compose down

```

Eliminar contenedor y datos persistidos:

```bash

docker compose down -v

```

\> `docker compose down -v` elimina también el volumen de MongoDB. Esto borra todos los datos almacenados localmente.

---

## 1.1. Compatibilidad de MongoDB y kernel de Linux

MongoDB 8 presenta una incompatibilidad conocida con kernels Linux desde `6.19` hasta `7.0.13`. MongoDB detecta estas versiones y detiene el servidor para evitar el fallo asociado a TCMalloc. MongoDB documenta que el problema se resuelve utilizando kernel `7.0.14` o posterior. Esta incompatibilidad también afecta a MongoDB ejecutándose dentro de Docker.

Comprobar la versión del kernel:

```bash

uname -r

```

Si se utiliza Linux y el kernel es `7.0.14` o superior, MongoDB 8 puede utilizarse normalmente.

### Fallback para equipos con kernel incompatible

Si durante la instalación o evaluación el equipo utiliza un kernel afectado y no es posible actualizarlo, se puede utilizar temporalmente MongoDB 7.0:

```yaml

services:

  mongo:

    image: mongo:7.0

```

MongoDB 7.0 tiene soporte documentado para Ubuntu 22.04 LTS en `x86_64`.

\> No utilizar MongoDB 6.0 como alternativa, ya que MongoDB 6.0 alcanzó el fin de vida el 31 de julio de 2025.

Para la configuración oficial del proyecto se mantiene:

```yaml

image: mongo:8

```

El cambio a `mongo:7.0` se considera únicamente un mecanismo de compatibilidad para equipos cuyo kernel no pueda actualizarse.

---

## 1.2. MongoDB instalado directamente en Linux

También es posible instalar MongoDB directamente en el sistema.

1\. Instalar MongoDB Community Server y `mongosh` desde la documentación oficial de MongoDB.

2\. Editar:

```bash

sudo nano /etc/mongod.conf

```

Agregar:

```yaml

replication:

  replSetName: rs0

```

3\. Reiniciar MongoDB:

```bash

sudo systemctl restart mongod

```

4\. Inicializar el replica set:

```bash

mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"

```

\> Para una instalación local se recomienda utilizar explícitamente `localhost:27017` para evitar problemas si MongoDB inicializa el replica set utilizando el hostname de la máquina.


### Usar MongoDB nativo con el backend

Una vez configurado el replica set `rs0`, se puede ejecutar el backend utilizando MongoDB instalado directamente en Linux, sin depender del contenedor Docker.

#### 1. Crear el usuario administrador local

Si todavía no existe un usuario administrador y la instalación permite crear el primer usuario sin autenticación, ejecutar:

```javascript
mongosh
```

```javascript
use admin

db.createUser({
  user: "root",
  pwd: passwordPrompt(),
  roles: [{ role: "root", db: "admin" }]
})
```

Si la autenticación ya está habilitada, conectarse con un usuario autorizado para crear usuarios.

#### 2. Habilitar autenticación

Editar `/etc/mongod.conf` y comprobar que estén configuradas ambas opciones:

```yaml
security:
  authorization: enabled

replication:
  replSetName: rs0
```

No duplicar secciones existentes. Reiniciar el servicio:

```bash
sudo systemctl restart mongod
```

#### 3. Configurar el archivo `.env`

Cambiar las URI para utilizar el usuario administrador local:

```env
MONGODB_URI=mongodb://root:<password-URL-encoded>@localhost:27017/gestion_documental?authSource=admin&replicaSet=rs0

MIGRATE_MONGO_URI=mongodb://root:<password-URL-encoded>@localhost:27017/gestion_documental?authSource=admin&replicaSet=rs0
```

Sustituir `<password-URL-encoded>` por la contraseña del usuario `root`, codificada para utilizarse en una URI.

Estas variables deben declararse una sola vez. Las variables `MONGO_ROOT_USER`, `MONGO_ROOT_PASSWORD`, `MONGO_APP_USER` y `MONGO_MIGRATE_USER` utilizadas por Docker no crean automáticamente usuarios en MongoDB nativo.

#### 4. Alternar entre MongoDB nativo y Docker

Para utilizar MongoDB nativo, detener el contenedor y arrancar el servicio local:

```bash
docker compose stop mongo
sudo systemctl start mongod
```

Para regresar a Docker:

```bash
sudo systemctl stop mongod
docker compose up -d mongo
```

En ambos casos, verificar que MongoDB esté disponible antes de iniciar la API.

> **Importante:** MongoDB nativo y Docker mantienen bases de datos, usuarios y datos independientes. El usuario administrador local se recomienda únicamente para desarrollo; en producción deben utilizarse cuentas con permisos limitados.


---

## 1.3. MongoDB Atlas

Como alternativa, puede utilizarse MongoDB Atlas.

1\. Crear un clúster.

2\. Crear un usuario de base de datos.

3\. Configurar el acceso de red.

4\. Copiar la cadena `mongodb+srv://...`.

5\. Configurarla como `MONGODB_URI`.

Atlas ya proporciona un replica set, por lo que no es necesario configurar `rs.initiate()` manualmente.

---

## 1.4. Verificar MongoDB

Con Docker:

```bash

docker exec document-mgmt-mongo mongosh \\\\

  "mongodb://gestion_app:<password>@localhost:27017/gestion_documental?replicaSet=rs0&authSource=gestion_documental" \\\\

  \\--eval "rs.status().ok"

```

Debe devolver:

```text

1

```

También se recomienda MongoDB Compass para inspeccionar visualmente la base de datos.

---

## 2. Instalación del proyecto

Clonar el repositorio:

```bash

git clone \\<url-del-repositorio>

```

Entrar al proyecto:

```bash

cd app-proyecto-final-backend

```

Instalar dependencias:

```bash

npm install

```

Crear el archivo de variables de entorno:

```bash

cp .env.example .env

```

Editar:

```bash

nano .env

```

---

## 3. Variables de entorno

Ejemplo de configuración local:

```env

MONGODB_URI=mongodb://gestion_app:<password>@localhost:27017/gestion_documental?replicaSet=rs0&authSource=gestion_documental

JWT_SECRET=\\<secreto-seguro>

CORS_ORIGIN=http://localhost:4200

```

Para generar un `JWT_SECRET` seguro:

```bash

openssl rand -hex 32

```

Ejemplo:

```env

JWT_SECRET=8c7c...

```

No es necesario utilizar exactamente ese valor; cada instalación debe generar su propio secreto.

### Importante sobre las credenciales

El archivo `.env` contiene información sensible y no debe subirse al repositorio.

Debe versionarse únicamente:

```text

.env.example

```

El archivo real:

```text

.env

```

debe permanecer ignorado mediante `.gitignore`.

Si una contraseña aparece dentro de una URL de MongoDB:

```text

mongodb://usuario:contraseña@host:27017/base

```

esa URL debe tratarse como un secreto.

Además, si una contraseña contiene caracteres especiales como:

```text

@ : / ? # [ ]

```

debe utilizarse URL encoding antes de colocarla dentro de `MONGODB_URI`.

---

## 4. Ejecución

### Desarrollo local — recomendado

Primero levantar MongoDB:

```bash
npm run docker:db
```

Esto levanta únicamente MongoDB mediante Docker Compose y lo deja disponible para el desarrollo local.

Instalar dependencias:

```bash
npm install
```

Aplicar las migraciones pendientes:

```bash
npm run migrate:up
```

Para sincronizar automáticamente todas las migraciones nuevas y aplicar las pendientes:

```bash
npm run migrate:up:all
```

Ejecutar la API en desarrollo:

```bash
npm run start:dev
```

La aplicación quedará disponible en:

* API: `http://localhost:3000/api/v1`
* Swagger: `http://localhost:3000/docs`

### Otros scripts para levantar la aplicación

El proyecto proporciona diferentes comandos según la forma en que se quiera ejecutar la aplicación.

```bash
npm run start
```

Inicia la API normalmente.

```bash
npm run start:dev
```

Inicia la API en modo desarrollo con `watch`.

Es el modo recomendado durante el desarrollo.

```bash
npm run start:debug
```

Inicia la API en modo desarrollo con soporte para debugging.

```bash
npm run start:prod
```

Ejecuta la aplicación previamente compilada mediante `dist/main`.

### Scripts Docker

MongoDB puede ejecutarse de forma independiente:

```bash
npm run docker:db
```

Levanta únicamente MongoDB mediante Docker Compose.

Para utilizar el fallback completamente dockerizado:

```bash
npm run docker:app
```

Este comando construye y levanta el perfil `app`, compuesto por:

1. MongoDB.
2. Migraciones.
3. Seed de datos de demostración.
4. API.

El flujo de ejecución es:

```text
MongoDB
   ↓
healthy
   ↓
Migraciones
   ↓
Seed
   ↓
API
```

Las migraciones se ejecutan antes del seed y el seed se ejecuta antes de iniciar la API.

La migración inicial crea el administrador del sistema utilizando las variables `INITIAL_ADMIN_*`. El seed se encarga únicamente de los datos de demostración.

Para consultar los logs de la API:

```bash
npm run docker:logs
```

### Detener servicios Docker

El proyecto permite detener los servicios de forma modular.

Si únicamente se desea eliminar los contenedores de aplicación (`api`, `seed` y `migrate`), manteniendo MongoDB funcionando:

```bash
npm run docker:app:down
```

Este comando ejecuta:

```bash
docker compose --profile app rm -sf api seed migrate
```

Es útil cuando se necesita reconstruir o reiniciar únicamente la aplicación sin afectar la base de datos.

Si se desea ejecutar únicamente el seed dentro de Docker:

```bash
npm run docker:seed
```

Este comando ejecuta el servicio `seed` de forma independiente y lo elimina automáticamente al finalizar.

### Resumen de scripts

| Comando                   | Uso                                                     |
| ------------------------- | ------------------------------------------------------- |
| `npm run start`           | Inicia la API normalmente.                              |
| `npm run start:dev`       | Desarrollo con `watch`.                                 |
| `npm run start:debug`     | Desarrollo con debugging.                               |
| `npm run start:prod`      | Ejecuta la aplicación compilada.                        |
| `npm run docker:db`       | Levanta únicamente MongoDB.                             |
| `npm run docker:app`      | Levanta el backend completo mediante Docker.            |
| `npm run docker:logs`     | Muestra los logs de la API Dockerizada.                 |
| `npm run docker:app:down` | Elimina `api`, `seed` y `migrate`, conservando MongoDB. |
| `npm run docker:seed`     | Ejecuta únicamente el seed mediante Docker.             |
| `npm run migrate:list`    | Consulta el estado de las migraciones.                  |
| `npm run migrate:up`      | Aplica las migraciones pendientes.                      |
| `npm run migrate:up:all`  | Sincroniza y aplica todas las migraciones pendientes.   |
| `npm run migrate:down`    | Revierte una migración.                                 |
| `npm run seed`            | Ejecuta el seed localmente.                             |
| `npm run seed:dev`        | Compila el proyecto y ejecuta el seed desde `dist`.     |

> Nota: `docker:app:down` es la opción preferida cuando solo se quiere eliminar o reconstruir la aplicación y conservar MongoDB. Los volúmenes de MongoDB no se eliminan con este comando.

---

### Fallback: ejecutar toda la aplicación con Docker

Como alternativa al flujo local, el proyecto incluye un perfil Docker para levantar la aplicación completa.

```bash
npm run docker:app
```

Este comando:

1. Construye las imágenes necesarias.
2. Levanta MongoDB.
3. Espera a que MongoDB esté `healthy`.
4. Ejecuta todas las migraciones pendientes.
5. Crea el administrador inicial mediante la migración correspondiente.
6. Ejecuta el seed de datos de demostración.
7. Levanta la API.
8. Expone la API en el puerto `3000`.

La API queda disponible en:

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/docs
```

Para ver los logs de la API:

```bash
npm run docker:logs
```

Para eliminar los contenedores de aplicación:

```bash
npm run docker:app:down
```

Este comando elimina `api`, `seed` y `migrate`, pero conserva MongoDB y sus volúmenes.

> Este perfil funciona como fallback para levantar el proyecto completo cuando se prefiera no ejecutar NestJS directamente en el host. El flujo de desarrollo recomendado continúa siendo ejecutar MongoDB con Docker y NestJS localmente con `npm run start:dev`.

---

## 5. Orden recomendado para ejecutar el proyecto

### Flujo normal de desarrollo

```bash
# 1. Levantar MongoDB
npm run docker:db

# 2. Instalar dependencias
npm install

# 3. Aplicar migraciones
npm run migrate:up

# 4. Cargar datos iniciales de demostración, si corresponde
npm run seed

# 5. Levantar la API
npm run start:dev
```

Las migraciones crean y mantienen la estructura y configuración inicial de la base de datos. El seed agrega datos de demostración.

Luego abrir Swagger:

```text
http://localhost:3000/docs
```

### Flujo alternativo con Docker

Si se quiere levantar todo el backend mediante Docker:

```bash
npm run docker:app
```

Este flujo se encarga automáticamente de:

```text
MongoDB
   ↓
MongoDB healthy
   ↓
Migraciones
   ↓
Administrador inicial
   ↓
Seed de demostración
   ↓
API
```

---

## 6. Datos iniciales (seed)

El seed contiene datos de demostración que pueden cargarse de forma independiente de las migraciones.

Ejecutar localmente:

```bash
npm run seed
```

O utilizar el flujo de desarrollo que compila el proyecto antes de ejecutar el seed:

```bash
npm run seed:dev
```

También puede ejecutarse mediante Docker:

```bash
npm run docker:seed
```

El seed carga los datos iniciales de demostración, tales como:

* usuarios de demostración
* carpetas
* archivos
* comparticiones
* elementos en papelera
* historial de actividad

El usuario administrador inicial **no pertenece al seed**. Se crea mediante una migración para garantizar que exista como parte de la preparación de la base de datos.

Actualmente el seed de desarrollo contiene usuarios de demostración independientes del administrador inicial.

El seed requiere:

* MongoDB funcionando.
* `MONGODB_URI` configurado correctamente.
* Las variables de entorno requeridas por la aplicación.

El script se encuentra en:

```text
src/seeds/seed.ts
```

> Las credenciales de los usuarios de demostración son independientes de las credenciales utilizadas por MongoDB.

---

## 7. Migraciones de MongoDB

El proyecto utiliza `ts-migrate-mongoose` para controlar cambios versionados de estructura y datos sobre MongoDB.

Las migraciones se encuentran en:

```text
migrations/

├── <timestamp>-<nombre>.ts
└── ...
```

Cada migración define dos operaciones:

* `up`: aplica el cambio.
* `down`: revierte el cambio cuando corresponda.

Las migraciones se ejecutan en orden y su estado se registra en MongoDB. Una migración que ya fue aplicada no debe modificarse; si se necesita otro cambio, se crea una nueva migración.

### Migración del administrador inicial

El administrador inicial del sistema se crea mediante una migración específica.

Esta migración utiliza las siguientes variables de entorno:

```env
INITIAL_ADMIN_USERNAME=
INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=
INITIAL_ADMIN_FIRST_NAME=
INITIAL_ADMIN_LAST_NAME=
```

Las variables `INITIAL_ADMIN_*` son utilizadas por la migración y no forman parte de la configuración normal de la API.

La migración:

1. Valida que existan las variables requeridas.
2. Busca si el administrador ya existe.
3. Obtiene el rol `ADMIN`.
4. Genera el hash de la contraseña.
5. Crea el administrador inicial.

La migración es idempotente: si el administrador ya existe, no crea un usuario duplicado.

El administrador inicial se considera parte de la preparación de la base de datos, mientras que los datos de demostración pertenecen al seed.

### Requisitos

Antes de ejecutar migraciones:

1. MongoDB debe estar levantado.
2. El contenedor debe estar `healthy`.
3. La URI utilizada por las migraciones debe estar configurada en el entorno local.
4. Las variables `INITIAL_ADMIN_*` deben estar disponibles cuando corresponda.
5. Las dependencias del proyecto deben estar instaladas.

Comprobar MongoDB:

```bash
docker compose up -d

docker compose ps
```

El servicio `mongo` debe aparecer como `healthy`.

### Scripts de migración

Los scripts definidos en `package.json` son:

```json
"migrate:list": "migrate list",
"migrate:up": "migrate up",
"migrate:up:all": "migrate up --autosync true",
"migrate:down": "migrate down"
```

### Crear una migración

Desde la raíz del backend:

```bash
npx migrate create <nombre-de-la-migracion>
```

Por ejemplo:

```bash
npx migrate create add-user-indexes
```

La herramienta genera automáticamente un archivo con timestamp dentro de `migrations/`:

```text
migrations/<timestamp>-add-user-indexes.ts
```

No se agrega `.ts` al ejecutar `migrate create`; la herramienta genera la extensión.

### Consultar el estado

```bash
npm run migrate:list
```

Esto permite comprobar qué migraciones existen y cuáles están `up` o `down`.

### Aplicar migraciones

El comando habitual es:

```bash
npm run migrate:up
```

Si existen migraciones nuevas que todavía no están registradas en la base de datos, `ts-migrate-mongoose` puede mostrar un selector para elegir cuáles importar.

Para aplicar todas las migraciones pendientes sin seleccionar una por una:

```bash
npm run migrate:up:all
```

La opción `--autosync true` sincroniza automáticamente las migraciones nuevas y después ejecuta las pendientes en orden.

Recomendación:

* Utilizar `npm run migrate:up` cuando se quiera revisar explícitamente qué migraciones nuevas se van a registrar.
* Utilizar `npm run migrate:up:all` para un flujo rápido en desarrollo o en despliegues controlados.
* El flujo Docker utiliza `migrate:up:all` para automatizar la preparación de la base de datos.

### Revertir migraciones

El script disponible es:

```bash
npm run migrate:down
```

Antes de utilizarlo, revisar qué migración se desea revertir y qué comportamiento tiene definido su función `down`.

Las migraciones no deben editarse después de haber sido aplicadas en un entorno compartido. Si se necesita corregir o ampliar un cambio, normalmente se crea una nueva migración.

### Flujo recomendado

```text
MongoDB healthy
      ↓
Crear migración
      ↓
Escribir up / down
      ↓
Revisar estado
      ↓
Aplicar migraciones
      ↓
Verificar cambios en MongoDB
```

Comandos principales:

| Acción                     | Comando                       |
| -------------------------- | ----------------------------- |
| Crear migración            | `npx migrate create <nombre>` |
| Ver estado                 | `npm run migrate:list`        |
| Aplicar pendientes         | `npm run migrate:up`          |
| Aplicar todas sin selector | `npm run migrate:up:all`      |
| Revertir                   | `npm run migrate:down`        |

### Comprobación desde cero

Para verificar que el administrador es creado por la migración y no por un seed anterior, se puede recrear la base de datos desde cero.

> Este procedimiento elimina los datos de MongoDB. Utilizarlo únicamente cuando no existan datos que se quieran conservar.

```bash
docker compose --profile app down -v
npm run docker:db
npm run migrate:up:all
npm run seed:dev
```

El resultado esperado es:

```text
Migraciones
└── administrador inicial

Seed
└── pablo-user
```

También se puede comprobar el flujo completamente dockerizado:

```bash
docker compose --profile app down -v
npm run docker:app
docker compose ps
npm run docker:logs
```

El estado esperado es:

```text
mongo    Up (healthy)
migrate  Exited (0)
seed     Exited (0)
api      Up
```
---

## 8. Arquitectura

Cada módulo sigue la misma separación:

```text

module/

├── controller/

├── service/

├── repository/

├── dto/

└── entities/

```

### `controller`

Capa HTTP.

Recibe las solicitudes, valida DTOs y delega la operación al servicio.

No accede directamente a modelos de Mongoose.

### `service`

Contiene la lógica de negocio y las reglas del sistema.

### `repository`

Es el único lugar que conoce Mongoose y la persistencia de datos.

### `dto/`

Define los contratos de entrada y validaciones de las solicitudes HTTP.

### `entities/`

Contiene los esquemas utilizados por MongoDB/Mongoose.

---

## 9. Solución de problemasa

### Error `ERESOLVE` al instalar paquetes `@nestjs/*`

Las versiones más recientes de algunos paquetes pueden requerir Nest 12.

Este proyecto utiliza Nest 11, por lo que los paquetes relacionados deben mantenerse en versiones compatibles con Nest 11.

Por ejemplo:

```bash

npm install @nestjs/swagger@^11

```

No utilizar:

```bash

npm install --legacy-peer-deps

```

como solución permanente.

---

### La aplicación no arranca y lista variables faltantes

Es la validación del `.env`.

Revisar que existan las variables requeridas, especialmente:

```env

MONGODB_URI=

JWT_SECRET=

CORS_ORIGIN=

```

---

### Error:

```text

Transaction numbers are only allowed on a replica set member or mongos

```

MongoDB está ejecutándose sin replica set.

Verificar:

```bash

docker ps

```

y:

```bash

docker logs document-mgmt-mongo --tail 50

```

También verificar que `MONGODB_URI` incluya:

```text

?replicaSet=rs0

```

---

### MongoDB no inicia dentro de Docker

Primero comprobar el kernel:

```bash

uname -r

```

Si se encuentra entre:

```text

6.19

```

y:

```text

7.0.13

```

MongoDB 8 puede detenerse debido a la incompatibilidad documentada con TCMalloc.

La solución preferida es actualizar el kernel.

Si no es posible actualizarlo, utilizar temporalmente:

```yaml

image: mongo:7.0

```

y recrear el contenedor:

```bash

docker compose down

docker compose up -d

```

---

### MongoDB reinicia continuamente

Consultar:

```bash

docker logs document-mgmt-mongo --tail 100

```

También:

```bash

docker inspect document-mgmt-mongo

```

Si aparece un error relacionado con el kernel, verificar:

```bash

uname -r

```

Si aparece un error relacionado con autenticación, revisar:

```env

MONGODB_URI=

```

y comprobar que `authSource=gestion_documental` esté presente.

---

### Error de conexión con MongoDB

Verificar primero que el contenedor esté activo:

```bash

docker ps

```

Después:

```bash

docker inspect --format='{{.State.Health.Status}}' document-mgmt-mongo

```

Debe devolver:

```text

healthy

```

Comprobar también:

```bash

mongosh "mongodb://localhost:27017/?replicaSet=rs0"

```

---

### Error de conexión o timeout con la instalación nativa

Probablemente el replica set fue inicializado utilizando el nombre de la máquina.

Reinicializarlo utilizando explícitamente:

```javascript

rs.initiate({

  _id: "rs0",

  members: [

    {

      _id: 0,

      host: "localhost:27017"

    }

  ]

})

```

---

### Falla la instalación de `argon2`

El paquete puede utilizar binarios precompilados.

Si la plataforma no dispone de un binario compatible, instalar herramientas de compilación:

```bash

sudo apt install build-essential python3

```

Después:

```bash

npm install

```

---

### Las cookies no llegan desde el cliente

Verificar que:

```env

CORS_ORIGIN=http://localhost:4200

```

coincida exactamente con el origen del frontend.

El cliente debe enviar las peticiones utilizando:

```text

withCredentials: true

```

También comprobar que la cookie esté configurada correctamente por el backend.

---

## 10. Docker — comandos útiles

Ver contenedores activos:

```bash

docker ps

```

Ver todos los contenedores:

```bash

docker ps -a

```

Ver imágenes:

```bash

docker images

```

Ver volúmenes:

```bash

docker volume ls

```

Ver consumo de Docker:

```bash

docker system df

```

Ver información detallada:

```bash

docker system df -v

```

Limpiar contenedores detenidos:

```bash

docker container prune

```

Limpiar imágenes no utilizadas:

```bash

docker image prune

```

\> No ejecutar `docker system prune -a` durante la evaluación sin revisar primero qué recursos serán eliminados.

---

## 11. Instalación de Docker y Docker Compose

Si el equipo no tiene Docker instalado, seguir estos pasos antes de levantar MongoDB.

### 1. Desinstalar versiones antiguas (opcional)

Si Docker ya fue instalado anteriormente mediante paquetes antiguos, se recomienda eliminar los paquetes anteriores:

```bash

sudo apt remove docker docker-engine docker.io containerd runc

```

Esto no elimina las imágenes ni volúmenes de Docker almacenados en el sistema.

### 2. Instalar dependencias

En Ubuntu 22.04 / Pop!_OS 22.04:

```bash

sudo apt update

sudo apt install ca-certificates curl

```

### 3. Agregar el repositorio oficial de Docker

Crear el directorio para las claves:

```bash

sudo install -m 0755 -d /etc/apt/keyrings

```

Descargar la clave oficial:

```bash

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \\\\

  -o /etc/apt/keyrings/docker.asc

```

Dar permisos de lectura:

```bash

sudo chmod a+r /etc/apt/keyrings/docker.asc

```

Agregar el repositorio:

```bash

echo \\\\

  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \\\\

  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \\\\

  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

```

Actualizar la información de paquetes:

```bash

sudo apt update

```

### 4. Instalar Docker Engine y Docker Compose

Instalar Docker y sus componentes:

```bash

sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

```

Esto instala:

* Docker Engine

* Docker CLI

* containerd

* Docker Buildx

* Docker Compose Plugin

### 5. Verificar la instalación

Comprobar Docker:

```bash

docker --version

```

Comprobar Docker Compose:

```bash

docker compose version

```

Debe aparecer una versión de Docker y una versión de Compose.

También se puede ejecutar el contenedor de prueba:

```bash

sudo docker run hello-world

```

Si aparece el mensaje de bienvenida de Docker, la instalación funciona correctamente.

### 6. Ejecutar Docker sin `sudo` (recomendado)

Agregar el usuario actual al grupo `docker`:

```bash

sudo usermod -aG docker $USER

```

Cerrar sesión y volver a iniciar sesión para que el cambio tenga efecto.

Después comprobar:

```bash

docker ps

```

Si funciona sin `sudo`, la configuración está lista.

\> Si se necesita aplicar el cambio inmediatamente sin cerrar sesión, se puede ejecutar:

\>

\> ```bash

\> newgrp docker

\> ```

### 7. Verificar que Docker se inicie automáticamente

Comprobar el servicio:

```bash

sudo systemctl status docker

```

Si no está activo:

```bash

sudo systemctl enable --now docker

```

### 8. Levantar el proyecto

Una vez instalado Docker y Docker Compose, regresar a la carpeta del backend:

```bash

cd app-proyecto-final-backend

```

Levantar MongoDB:

```bash

docker compose up -d

```

Comprobar:

```bash

docker ps

```

Y revisar los logs:

```bash

docker logs document-mgmt-mongo --tail 50

```

Si MongoDB aparece funcionando correctamente, continuar con la instalación del proyecto y la configuración del archivo `.env`.

\> Nota: Docker Compose moderno se ejecuta mediante `docker compose` con un espacio. No es necesario instalar por separado el antiguo comando `docker-compose`.


## 12. Licencia

Proyecto basado en el starter de [NestJS]\\(https://nestjs.com), licenciado bajo MIT.