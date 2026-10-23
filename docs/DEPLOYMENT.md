# Dev, pro y despliegue en esta PC

**Español** · [English](en/DEPLOYMENT.md) · [Русский](ru/DEPLOYMENT.md)

## Ambientes

| Uso                | Rama           | Dirección local       | Proyecto Compose | Base                               |
| ------------------ | -------------- | --------------------- | ---------------- | ---------------------------------- |
| Trabajo del junior | Cualquier rama | http://localhost:3000 | Compose original | reservet, puerto 5433              |
| Dev desplegado     | `develop`      | http://localhost:3100 | `reservet-dev`   | reservet_dev, sin puerto publicado |
| Pro desplegado     | `main`         | http://localhost:3200 | `reservet-pro`   | reservet_pro, sin puerto publicado |

Los ambientes desplegados tienen redes, volúmenes y credenciales distintos, pero
comparten PC y motor Docker: no son aislamiento frente a una avería del equipo.
`NODE_ENV=production` en ambos ejecuta la aplicación compilada; `APP_ENV` distingue
`dev` y `pro`. El Compose original sigue disponible para aprender localmente.

## Pipeline

1. Los pull requests ejecutan las verificaciones en GitHub, nunca en esta PC.
2. Un push a `develop` o `main` inicia `deploy.yml` en GitHub.
3. Ejecuta lint, formato, tipos, pruebas y compilación.
4. Construye una imagen etiquetada con el SHA del commit, arranca PostgreSQL de
   prueba y ejecuta dos veces las migraciones para comprobar que no se repiten.
5. Arranca la imagen y comprueba `/` y `/health/db`.
6. Transfiere la misma imagen como artefacto al runner Windows de esta PC.
7. Despliega `develop` a `dev` y `main` a `pro`. En pro crea primero un respaldo;
   luego migra, arranca y verifica la aplicación.

Los despliegues del mismo ambiente no se solapan. También puedes iniciar el
workflow manualmente desde Actions seleccionando `main` o `develop`.
Una vez conectado, un push a `main` desplegará automáticamente pro.

## 1. Preparar Docker y configuración

Instala [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/),
abre contenedores Linux y comprueba `docker info` y `docker compose version`.
El servidor requiere Compose con `up --wait` y `--wait-timeout`.

Desde la raíz del proyecto:

```powershell
./deploy/Initialize-Server.ps1
```

Ya se ejecutó en esta PC. Es idempotente: conserva archivos existentes.
Crea `E:\reservet-server\config\dev.env` y `pro.env` con contraseñas aleatorias
independientes, y restringe permisos al usuario actual, SYSTEM y administradores.
El runner debe usar esa misma cuenta de Windows, o recibir permisos explícitos
sobre esa carpeta. No copies estos archivos a Git ni los pegues en logs.
Los secretos no se incluyen en imágenes ni artefactos.

Si necesitas otra carpeta, pasa `-ServerRoot 'D:\reservet-server'` y configura
la variable de repositorio `RESERVET_SERVER_ROOT` con esa misma ruta.
No cambies contraseñas de una base ya inicializada solo editando el archivo:
PostgreSQL requiere cambiar también el usuario mediante SQL.

## 2. Conectar GitHub y esta PC

1. Sube el proyecto a un repositorio **privado**. Crea `main` y `develop`.
2. En Settings → Environments crea `dev` y `pro`. Restringe las ramas de
   despliegue: `develop` para dev y `main` para pro.
3. Protege `main` y `develop`: exige pull requests y verificaciones correctas.
   Los colaboradores con permisos para cambiar código de despliegue deben ser de confianza.
4. En Settings → Actions → Runners → New self-hosted runner selecciona Windows x64.
5. Sigue los comandos de descarga y registro que GitHub muestra en ese momento.
   Usa una carpeta dedicada, por ejemplo `E:\actions-runner-reservet`, fuera del repo
   y de `reservet-server`. Añade la etiqueta **`reservet-server`**.
6. Ejecuta el runner con la cuenta que puede usar Docker y leer la configuración.
   Antes, comprueba `docker info` desde esa misma cuenta y sesión.
7. Comprueba que el runner figure como Online y haz un push a `develop`.
8. Verifica el despliegue en Actions y abre http://localhost:3100.
9. Integra por pull request a `main` y comprueba http://localhost:3200.

El registro necesita un token temporal que GitHub genera; no lo guardes en el
repositorio. La conexión del runner es saliente: no necesitas abrir puertos
entrantes para que GitHub le envíe trabajos. Lee la
[documentación de runners](https://docs.github.com/en/actions/concepts/runners/self-hosted-runners?platform=windows).

## 3. Operación y recuperación

Docker Desktop debe permanecer iniciado. Configura su inicio al entrar en Windows
y evita que la PC se suspenda durante el servicio. `restart: unless-stopped`
reinicia contenedores cuando vuelve el motor; no arranca el motor ni el runner.
Un runner instalado como servicio debe tener acceso al mismo motor Docker;
verifica un reinicio completo del equipo antes de dar por disponible el servidor.
Docker Desktop/WSL no garantiza servicio antes de iniciar sesión. Si más adelante
necesitas disponibilidad sin sesión, considera una VM Linux con Docker Engine.

Inspección de dev (sustituye el SHA por el commit desplegado):

```powershell
$env:APP_IMAGE = 'reservet:<SHA-de-40-caracteres>'
docker compose -p reservet-dev --env-file E:\reservet-server\config\dev.env -f deploy/compose.yaml ps
docker compose -p reservet-dev --env-file E:\reservet-server\config\dev.env -f deploy/compose.yaml logs --tail 100 app
```

Los respaldos de pro quedan en `E:\reservet-server\backups\pro`; el último
despliegue correcto queda en `releases\<ambiente>\current.txt`. Los respaldos
previos al despliegue no sustituyen un respaldo periódico: copia también fuera
de esta PC, define retención y comprueba restauraciones en una base temporal.
Nunca pruebes una restauración sobre pro directamente. Vigila espacio de disco:
imágenes y respaldos se conservan deliberadamente, sin limpieza destructiva automática.

Si falla el respaldo o la migración, el script se detiene antes de sustituir la
aplicación. Si falla el arranque, el despliegue queda fallido y puede requerir
recuperación manual. No hay rollback automático de aplicación ni de base.
Las migraciones ya confirmadas permanecen aplicadas. Mantén cambios de esquema
compatibles con la versión anterior, que puede seguir atendiendo durante la migración.
Un respaldo es una instantánea; restaurarlo puede perder escrituras posteriores.

Para desplegar manualmente una imagen ya cargada:

```powershell
./deploy/Deploy.ps1 -Environment dev -Revision <SHA-de-40-caracteres>
```

Recuperar una versión anterior requiere conservar/cargar su imagen y revisar su
compatibilidad con la base actual. Nunca elimines los volúmenes para corregir un despliegue.

## Acceso y estado actual

Los puertos 3100 y 3200 están vinculados a `127.0.0.1`: acceso solo desde esta PC.
No se han abierto firewall, router ni túneles. Antes de acceso externo hay que
definir dominio/red, HTTPS y la autenticación/autorización pendiente del junior.

Preparado y verificado localmente: configuración de ambientes, scripts PowerShell,
compilación, tipos y pruebas. Pendiente: instalar/arrancar Docker, subir el repo,
registrar el runner y ejecutar el primer pipeline. La imagen, Compose y las
migraciones reales se comprobarán en GitHub y en el primer despliegue; no se
afirman ejecutados mientras Docker no esté disponible aquí.
