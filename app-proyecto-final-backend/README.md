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

Esto ejecuta `docker compose up -d` y deja MongoDB disponible en el host.

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

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/v1/docs`

### Otros scripts para levantar la aplicación

El proyecto proporciona diferentes comandos según la forma en que se quiera ejecutar la aplicación. Cada uno tiene una responsabilidad específica.

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

Este comando construye y levanta el perfil `app`, que incluye:

1. MongoDB.
2. Migraciones.
3. API.

Las migraciones se ejecutan antes de iniciar la API. Si las migraciones terminan correctamente, Docker permite que el contenedor de la API se inicie.

Para consultar los logs de la API:

```bash
npm run docker:logs
```

### Detener servicios Docker

El proyecto permite detener los servicios de forma modular.

Si únicamente se desea eliminar los contenedores de la aplicación (`api` y `migrate`), manteniendo MongoDB funcionando:

```bash
npm run docker:app:down
```

Este comando ejecuta:

```bash
docker compose --profile app rm -sf api migrate
```

Es útil cuando se necesita reconstruir o reiniciar únicamente la aplicación sin afectar la base de datos.

Si se desea detener todo el entorno Docker asociado al perfil `app`:

```bash
npm run docker:down
```

Este comando ejecuta:

```bash
docker compose --profile app down
```

### Resumen de scripts

| Comando                   | Uso                                          |
| ------------------------- | -------------------------------------------- |
| `npm run start`           | Inicia la API normalmente.                   |
| `npm run start:dev`       | Desarrollo con `watch`.                      |
| `npm run start:debug`     | Desarrollo con debugging.                    |
| `npm run start:prod`      | Ejecuta la aplicación compilada.             |
| `npm run docker:db`       | Levanta únicamente MongoDB.                  |
| `npm run docker:app`      | Levanta el backend completo mediante Docker. |
| `npm run docker:logs`     | Muestra los logs de la API Dockerizada.      |
| `npm run docker:app:down` | Elimina únicamente `api` y `migrate`.        |
| `npm run docker:down`     | Detiene el entorno Docker del perfil `app`.  |

> Nota: `docker:app:down` es la opción preferida cuando solo se quiere reiniciar o reconstruir la aplicación y conservar MongoDB ejecutándose. `docker:down` se utiliza cuando se desea detener el entorno Docker completo.



### Fallback: ejecutar toda la aplicación con Docker

Como alternativa al flujo local, el proyecto incluye un perfil Docker para levantar la API completa.

```bash
npm run docker:app
```

Este comando:

1. Construye las imágenes necesarias.
2. Levanta MongoDB.
3. Espera a que MongoDB esté `healthy`.
4. Ejecuta las migraciones automáticamente.
5. Si las migraciones terminan correctamente, levanta la API.
6. Expone la API en el puerto `3000`.

La API queda disponible en:

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/api/v1/docs
```

Para ver los logs de la API:

```bash
npm run docker:logs
```

Para detener el flujo Docker:

```bash
npm run docker:down
```

> Este perfil funciona como fallback para levantar el proyecto completo cuando se prefiera no ejecutar NestJS directamente en el host. El flujo de desarrollo recomendado continúa siendo ejecutar MongoDB con Docker y NestJS localmente con `npm run start:dev`.



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

Luego abrir Swagger:

```text
http://localhost:3000/api/v1/docs
```

### Flujo alternativo con Docker

Si se quiere levantar todo el backend mediante Docker:

```bash
npm run docker:app
```

Este flujo ya se encarga de esperar MongoDB, ejecutar las migraciones y arrancar la API.



## 6. Datos iniciales (seed)

Ejecutar:

```bash

npm run seed

```

El seed carga los datos iniciales de demostración:

* usuarios

* carpetas

* archivos

* comparticiones

* elementos en papelera

* historial de actividad

El seed requiere:

* MongoDB funcionando.

* `MONGODB_URI` configurado correctamente.

* Las variables de entorno requeridas por la aplicación.

El script se encuentra en:

```text

src/seeds/seed.ts

```

Las credenciales de los usuarios creados por el seed deben consultarse en la configuración actual del seed.

\> Las credenciales de usuarios de demostración son independientes de las credenciales de MongoDB.

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

\- `up`: aplica el cambio.

\- `down`: revierte el cambio cuando corresponda.

Las migraciones se ejecutan en orden y su estado se registra en MongoDB. Una migración que ya fue aplicada no debe modificarse; si se necesita otro cambio, se crea una nueva migración.

### Requisitos

Antes de ejecutar migraciones:

1\. MongoDB debe estar levantado.

2\. El contenedor debe estar `healthy`.

3\. La URI utilizada por las migraciones debe estar configurada en el entorno local.

4\. Las dependencias del proyecto deben estar instaladas.

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

Para aplicar todas las migraciones pendientes sin seleccionar una por una, se puede utilizar:

```bash

npx migrate up --autosync true

```

La opción `--autosync true` sincroniza automáticamente las migraciones nuevas y después ejecuta las pendientes en orden.

Si se quiere tener este flujo como comando del proyecto, puede agregarse al `package.json`:

```json

"migrate:up:all": "migrate up --autosync true"

```

Entonces se ejecutaría con:

```bash

npm run migrate:up:all

```

Recomendación: utilizar `npm run migrate:up` cuando se quiera revisar explícitamente qué migraciones nuevas se van a registrar. Utilizar `migrate:up:all` para un flujo rápido en desarrollo o en despliegues controlados.

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

\| Acción | Comando |

\| --- | --- |

\| Crear migración | `npx migrate create <nombre>` |

\| Ver estado | `npm run migrate:list` |

\| Aplicar pendientes | `npm run migrate:up` |

\| Aplicar todas sin selector | `npm run migrate:up:all` |

\| Revertir | `npm run migrate:down` |

### Consideraciones

\- Las migraciones deben ser pequeñas y enfocadas en un cambio concreto.

\- No se deben editar migraciones que ya fueron aplicadas en un entorno compartido.

\- Un cambio posterior debe representarse mediante una nueva migración.

\- Las migraciones necesitan acceso a MongoDB para consultar y guardar su estado.

\- El usuario utilizado para migraciones debe tener los permisos necesarios para los cambios que realice la migración.

\- El `seed` y las migraciones cumplen funciones diferentes: las migraciones controlan cambios versionados de la base de datos, mientras que `npm run seed` carga datos iniciales de demostración.

---

## 8. Pruebas

Pruebas unitarias:

```bash

npm run test

```

Pruebas end-to-end:

```bash

npm run test:e2e

```

Cobertura:

```bash

npm run test:cov

```

---

## 9. Arquitectura

Cada módulo sigue la misma separación:

```text

module/

├── controller/

├── service/

├── repository/

├── dto/

└── schemas/

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

### `schemas/`

Contiene los esquemas utilizados por MongoDB/Mongoose.

---

## 10. Solución de problemas

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

## 11. Docker — comandos útiles

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

## 12. Instalación de Docker y Docker Compose

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


## 13. Licencia

Proyecto basado en el starter de [NestJS]\\(https://nestjs.com), licenciado bajo MIT.