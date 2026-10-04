# Gestión Documental - Cliente (Frontend)

Aplicación frontend desarrollada con Angular 21 y generada inicialmente mediante Angular CLI 21.0.0.

El proyecto puede ejecutarse de dos formas:

1. **Entorno local con Node.js y npm**, recomendado para el desarrollo habitual.
2. **Entorno Docker**, disponible como alternativa de respaldo cuando el entorno local presente problemas con Node.js, npm o las dependencias del proyecto.

---

## Requisitos

### Opción 1: Entorno local

Para ejecutar el proyecto directamente en el equipo se necesita:

* Node.js compatible con Angular 21.
* npm.
* Un editor de código, como Visual Studio Code.

Angular recomienda utilizar una versión LTS o Maintenance LTS de Node.js compatible con la versión instalada de Angular.

Verificar las versiones instaladas:

```bash
node -v
npm -v
```

### Opción 2: Docker

Para utilizar la alternativa Docker se necesita:

* Docker Engine.
* Docker CLI.
* Docker Compose mediante el plugin oficial de Docker.

Verificar la instalación:

```bash
docker --version
docker compose version
```

---

# Instalación local

Esta es la forma recomendada para trabajar normalmente con el proyecto.

Clonar o descargar el proyecto y acceder al directorio:

```bash
cd app-proyecto-no1-frontend
```

Instalar las dependencias:

```bash
npm install
```

Una vez instaladas, iniciar el servidor de desarrollo:

```bash
npm start
```

También puede utilizarse directamente Angular CLI mediante:

```bash
npx ng serve
```

El servidor estará disponible en:

```text
http://localhost:4200/
```

Angular recompila automáticamente la aplicación y recarga el navegador cuando se detectan cambios en los archivos fuente.

Para detener el servidor:

```text
Ctrl + C
```

---

# Configuración del backend

El frontend utiliza una ruta relativa para comunicarse con el backend:

```text
/api/v1
```

Esto permite que la aplicación no dependa directamente de una URL específica del backend.

Durante el desarrollo local, el archivo de proxy dirige las solicitudes hacia:

```text
http://localhost:3000
```

Por ejemplo:

```text
Frontend
http://localhost:4200/api/v1
        ↓
Proxy de Angular
        ↓
Backend
http://localhost:3000/api/v1
```

Si se modifica la configuración del proxy, es necesario reiniciar `ng serve`.

---

# Ejecución con Docker

Docker funciona como una alternativa de respaldo al entorno local de Node.js.

El contenedor ejecuta Angular CLI y el servidor de desarrollo dentro de Node.js, por lo que no se necesita instalar las dependencias del proyecto directamente en el sistema para utilizar esta opción.

## Construir y ejecutar

Desde la raíz del proyecto:

```bash
npm run docker:app
```

Este comando:

1. Construye la imagen Docker.
2. Instala las dependencias del proyecto dentro del contenedor.
3. Inicia Angular CLI.
4. Expone el servidor en el puerto `4200`.

La aplicación estará disponible en:

```text
http://localhost:4200/
```

## Ver los logs

Para observar la salida del servidor Angular:

```bash
npm run docker:logs
```

## Detener Docker

Cuando ya no sea necesario utilizar el entorno Docker:

```bash
npm run docker:app:down
```

Esto detiene y elimina el contenedor utilizado por el frontend.

---

# Limpieza del entorno Docker

Como Docker se utiliza únicamente como entorno de respaldo, después de terminar las pruebas se puede eliminar también la imagen generada para el proyecto.

Primero detener y eliminar el contenedor:

```bash
npm run docker:app:down
```

Después eliminar las imágenes locales asociadas al proyecto Compose:

```bash
docker compose down --rmi local
```

Finalmente, limpiar la caché de compilación de Docker:

```bash
docker builder prune -f
```

El último comando elimina la caché de construcción que Docker ya no necesita.

> **Nota:** no es necesario utilizar `docker system prune -a` para la limpieza habitual de este proyecto. Ese comando tiene un alcance mucho mayor y puede eliminar imágenes y otros recursos no utilizados de otros proyectos Docker.

---

# Scripts disponibles

Los principales scripts del proyecto son:

| Comando                   | Descripción                                     |
| ------------------------- | ----------------------------------------------- |
| `npm start`               | Inicia Angular en el entorno local              |
| `npm run build`           | Construye la aplicación                         |
| `npm run watch`           | Construye observando cambios                    |
| `npm test`                | Ejecuta las pruebas                             |
| `npm run docker:app`      | Construye y ejecuta el frontend mediante Docker |
| `npm run docker:logs`     | Muestra los logs del contenedor frontend        |
| `npm run docker:app:down` | Detiene y elimina el contenedor frontend        |

---

# Angular CLI

Angular CLI proporciona comandos para generar componentes, directivas, pipes y otros elementos del proyecto.

## Generar un componente

```bash
ng generate component component-name
```

También puede utilizarse:

```bash
npx ng generate component component-name
```

## Consultar los comandos disponibles

```bash
ng generate --help
```

O:

```bash
npx ng generate --help
```


---

# Desarrollo con Docker

La alternativa Docker está pensada principalmente para disponer de un entorno reproducible cuando la instalación local de Node.js o las dependencias del proyecto presentan problemas.

El flujo recomendado es:

```text
Desarrollo habitual
        ↓
npm install
        ↓
npm start
```

Si el entorno local presenta problemas:

```text
Docker
  ↓
npm run docker:app
  ↓
http://localhost:4200
```

Al finalizar las pruebas:

```bash
npm run docker:app:down
docker compose down --rmi local
docker builder prune -f
```

---

# Instalación de Docker y Docker Compose

Si Docker no está instalado, se puede instalar Docker Engine y Docker Compose desde el repositorio oficial de Docker.

> **Nota:** Estas instrucciones están basadas en el procedimiento oficial de Docker para Ubuntu. Pop!_OS está basado en Ubuntu, por lo que este procedimiento puede utilizarse en sistemas Pop!_OS compatibles.

## 1. Desinstalar paquetes que puedan entrar en conflicto

Primero se eliminan posibles instalaciones anteriores o paquetes que puedan entrar en conflicto con Docker Engine:

```bash
sudo apt remove docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc
```

Si algunos paquetes no están instalados, `apt` simplemente indicará que no se encontraron.

---

## 2. Actualizar los repositorios

```bash
sudo apt update
```

---

## 3. Instalar dependencias necesarias

Instalar `ca-certificates` y `curl`:

```bash
sudo apt install ca-certificates curl
```

---

## 4. Crear el directorio para las claves del repositorio

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

---

## 5. Descargar la clave GPG oficial de Docker

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

Asignar permisos de lectura:

```bash
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

---

## 6. Agregar el repositorio oficial de Docker

Ejecutar:

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Actualizar nuevamente la información de los paquetes:

```bash
sudo apt update
```

---

## 7. Instalar Docker Engine y Docker Compose

Instalar Docker Engine, Docker CLI, containerd, Buildx y el plugin de Docker Compose:

```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Con esto se instalan:

* Docker Engine.
* Docker CLI.
* `containerd`.
* Docker Buildx.
* Docker Compose como plugin oficial.

---

## 8. Verificar el servicio de Docker

Comprobar que Docker está ejecutándose:

```bash
sudo systemctl status docker
```

Si el servicio no está ejecutándose, iniciarlo manualmente:

```bash
sudo systemctl start docker
```

---

## 9. Verificar Docker

Comprobar la versión:

```bash
docker --version
```

Ejemplo:

```text
Docker version 29.x.x, build ...
```

---

## 10. Verificar Docker Compose

Comprobar la versión:

```bash
docker compose version
```

Ejemplo:

```text
Docker Compose version v5.x.x
```

> Docker Compose se utiliza como `docker compose`, con un espacio. No es necesario instalar el antiguo comando independiente `docker-compose`.

---

## 11. Ejecutar el contenedor de prueba

Finalmente, ejecutar la imagen oficial de prueba:

```bash
sudo docker run hello-world
```

Si la instalación funciona correctamente, Docker descargará la imagen `hello-world`, ejecutará el contenedor y mostrará un mensaje confirmando que Docker Engine funciona correctamente.

---

## 12. Ejecutar Docker sin `sudo` (opcional)

Por defecto, el socket de Docker pertenece a `root`, por lo que puede ser necesario utilizar `sudo` para ejecutar comandos Docker.

Para permitir que el usuario actual ejecute Docker sin `sudo`, agregarlo al grupo `docker`:

```bash
sudo usermod -aG docker $USER
```

Después cerrar sesión y volver a iniciarla para que el cambio tenga efecto.

También puede aplicarse el nuevo grupo en la sesión actual mediante:

```bash
newgrp docker
```

Comprobar:

```bash
docker run hello-world
```

Si funciona sin `sudo`, la configuración quedó aplicada correctamente.

> **Advertencia:** pertenecer al grupo `docker` otorga privilegios equivalentes a un nivel elevado de acceso al sistema. Utilizar esta configuración únicamente con usuarios de confianza.

---

## 13. Comprobación final

Antes de ejecutar el proyecto, verificar:

```bash
docker --version
```

```bash
docker compose version
```

```bash
docker run hello-world
```

Si los tres comandos funcionan correctamente, Docker y Docker Compose están listos para utilizarse.

### Documentación oficial

* Docker Engine para Ubuntu: https://docs.docker.com/engine/install/ubuntu/
* Docker Compose en Linux: https://docs.docker.com/compose/install/linux/
* Configuración posterior de Docker en Linux: https://docs.docker.com/engine/install/linux-postinstall/

---

# Recursos adicionales

Para consultar la documentación oficial:

* Angular CLI: documentación oficial de Angular.
* `ng serve`: documentación oficial del servidor de desarrollo de Angular.
* Docker Engine: documentación oficial de Docker.
* Docker Compose: documentación oficial de Docker.
