# Reservet — Prueba de gestión de mesas

## 1. Descripción del proyecto

Reservet es un prototipo web para la gestión de mesas de un restaurante. Esta versión integra un backend desarrollado con Node.js, Express, TypeScript y PostgreSQL con una interfaz web que permite autenticarse y administrar las mesas mediante una API REST.

El objetivo de esta prueba es demostrar el funcionamiento de los principales componentes de una aplicación cliente-servidor:

- Persistencia de información en una base de datos relacional.
- Registro e inicio de sesión de usuarios.
- Autenticación mediante JSON Web Tokens (JWT).
- Consulta, creación y actualización del estado de las mesas.
- Integración entre la interfaz web y el backend.
- Separación de responsabilidades entre la interfaz, la API y la base de datos.

**Alcance:** esta versión es una prueba funcional. No representa todavía un producto terminado para producción ni implementa necesariamente todas las necesidades operativas de un restaurante.

## 2. Requisitos previos

Antes de ejecutar el proyecto, se necesita:

- Node.js y npm.
- PostgreSQL instalado o accesible mediante una conexión de red.
- Una base de datos creada para el proyecto.
- Las dependencias del proyecto instaladas.
- Un archivo `.env` en la raíz del repositorio con las variables de entorno requeridas.

### Variables de entorno

El archivo `.env` debe incluir, como mínimo, la configuración de conexión a la base de datos y el secreto JWT requerido por la autenticación.

Ejemplo ilustrativo:

```env
PORT=3000
DATABASE_URL=postgresql://USUARIO:CONTRASENA@localhost:5432/reservet
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO
```

Los nombres de las variables de conexión deben coincidir con los que consume la configuración actual del backend. Si el proyecto utiliza variables de PostgreSQL individuales en lugar de `DATABASE_URL`, deben conservarse las que ya estén definidas en el código.

**Importante sobre `JWT_SECRET`:**

- Debe configurarse para que la autenticación JWT funcione.
- Debe contener al menos 32 bytes aleatorios, según la validación implementada.
- No debe compartirse, publicarse en el repositorio ni enviarse al frontend.
- En producción debe utilizarse un secreto seguro y administrado fuera del código fuente.
- El valor del ejemplo no es un secreto válido para uso real.

No se deben subir contraseñas de base de datos, secretos JWT ni otras credenciales al repositorio.

## 3. Instalación y ejecución

Desde la raíz del proyecto:

```bash
npm install
```

Configurar las variables de entorno y comprobar que PostgreSQL esté disponible.

A continuación, ejecutar las migraciones de base de datos mediante el mecanismo definido por el proyecto. Las migraciones existentes crean las estructuras necesarias para las mesas y los usuarios.

Finalmente, iniciar el servidor usando el script configurado en `package.json`. Por ejemplo, si los scripts disponibles son los habituales:

```bash
npm run dev
```

o, para una ejecución compilada, el comando de producción definido por el proyecto.

No se debe asumir que ambos comandos existen sin comprobar primero la sección `scripts` de `package.json`.

Con el servidor iniciado, abrir la dirección local correspondiente, por ejemplo:

```text
http://localhost:3000/
```

La ruta raíz muestra la pantalla de autenticación. Después de iniciar sesión o registrarse, el usuario accede al panel de gestión de mesas.

## 4. Arquitectura general

La aplicación se organiza en tres componentes principales:

1. **Frontend:** interfaz web construida con HTML, CSS y JavaScript. Permite iniciar sesión, consultar las mesas, crear registros y modificar estados.
2. **Backend:** API REST desarrollada con Node.js, Express y TypeScript. Recibe las solicitudes, valida la autenticación y procesa las operaciones.
3. **Base de datos:** PostgreSQL, responsable de almacenar los usuarios y las mesas de forma persistente.

Flujo general:

```text
Navegador
   |
   | HTTP / JSON
   v
API REST — Express / TypeScript
   |
   | Consultas SQL
   v
PostgreSQL
```

Las operaciones protegidas requieren el token JWT en el encabezado `Authorization`.

## 5. Rutas del frontend

| Ruta | Función |
|---|---|
| `/` | Pantalla de inicio de sesión y registro. |
| `/tables.html` | Panel principal de gestión de mesas. |

### Flujo de navegación

1. El usuario abre `/`.
2. Puede iniciar sesión o crear una cuenta.
3. El frontend envía las credenciales a la API.
4. Si la autenticación es exitosa, guarda el token en `sessionStorage`.
5. El usuario accede a `/tables.html`.
6. El panel verifica la sesión y consulta las mesas del backend.
7. El usuario puede crear mesas, filtrar resultados, actualizar la información y modificar estados.
8. Al cerrar sesión, se eliminan las credenciales de sesión del navegador y se vuelve al inicio de sesión.

El uso de `sessionStorage` limita la persistencia del token a la sesión de la pestaña del navegador. No sustituye otras medidas de seguridad necesarias para un entorno de producción.

## 6. Rutas de la API

Las siguientes rutas corresponden al contrato esperado por el frontend de esta prueba.

### 6.1. Salud y conexión a la base de datos

| Método | Ruta | Función | Autenticación |
|---|---|---|---|
| `GET` | `/health/db` | Comprueba la conexión con PostgreSQL. | Según la configuración del backend. |

### 6.2. Autenticación

| Método | Ruta | Función | Autenticación |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registra un usuario nuevo. | Pública |
| `POST` | `/api/auth/login` | Valida las credenciales e inicia sesión. | Pública |
| `GET` | `/api/auth/me` | Devuelve los datos del usuario autenticado. | JWT |

Las operaciones de registro y acceso utilizan el correo electrónico y la contraseña. La contraseña se almacena como un hash, no como texto plano.

Las respuestas exitosas de registro e inicio de sesión incluyen un objeto de usuario y un token JWT.

Ejemplo de estructura esperada:

```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "token": "TOKEN_JWT"
}
```

Los valores anteriores son ilustrativos.

### 6.3. Gestión de mesas

| Método | Ruta | Función | Autenticación |
|---|---|---|---|
| `GET` | `/api/tables` | Consulta las mesas registradas. | JWT |
| `POST` | `/api/tables` | Crea una mesa nueva. | JWT |
| `PATCH` | `/api/tables/:id/status` | Actualiza el estado de una mesa. | JWT |

Los encabezados de las solicitudes protegidas deben incluir:

```http
Authorization: Bearer TOKEN_JWT
```

#### Consultar mesas

`GET /api/tables`

Devuelve una colección de mesas con la estructura esperada:

```json
[
  {
    "id": 1,
    "name": "Terraza 01",
    "capacity": 4,
    "status": "available"
  }
]
```

#### Crear una mesa

`POST /api/tables`

Ejemplo de cuerpo:

```json
{
  "name": "Terraza 01",
  "capacity": 4
}
```

La mesa creada debe persistirse en PostgreSQL y devolverse en la respuesta.

#### Actualizar el estado

`PATCH /api/tables/:id/status`

Ejemplo para marcar una mesa como ocupada:

```json
{
  "status": "occupied"
}
```

Los estados utilizados por la interfaz son:

- `available`: disponible.
- `occupied`: ocupada.
- `out_of_service`: fuera de servicio.

El identificador `:id` corresponde a la mesa que se desea modificar.

## 7. Scripts y archivos del frontend

Los archivos del frontend se encuentran en la carpeta `public/`.

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura de la pantalla de inicio de sesión y registro. |
| `login.js` | Envía las credenciales al backend, procesa la respuesta, administra la sesión del navegador y redirige al panel. |
| `login.css` | Estilos de la pantalla de acceso, independientes de los estilos del panel. |
| `tables.html` | Estructura del panel principal: navegación, indicadores, filtros, listado de mesas y formulario de creación. |
| `app.js` | Lógica del panel. Consulta la API, representa las mesas, crea registros, cambia estados, controla errores y actualiza la interfaz. |
| `i18n.js` | Gestiona las traducciones de la interfaz para los idiomas configurados: español, inglés y ruso. |
| `styles.css` | Define la presentación visual del panel, incluida la distribución, los márgenes, las tarjetas y los componentes de la interfaz. |

### Responsabilidades principales

**`login.js`**

- Envía solicitudes de registro e inicio de sesión.
- Presenta errores de autenticación.
- Guarda el token JWT en `sessionStorage`.
- Verifica la sesión existente cuando se abre el inicio de sesión.

**`app.js`**

- Comprueba la sesión antes de mostrar el panel.
- Consulta las mesas mediante `GET /api/tables`.
- Crea mesas mediante `POST /api/tables`.
- Actualiza estados mediante `PATCH /api/tables/:id/status`.
- Calcula los indicadores del salón.
- Implementa búsqueda, filtrado y actualización de la información.
- Permite cambiar el idioma de la interfaz.
- Redirige al inicio de sesión cuando la API rechaza el token.

**`i18n.js` y `styles.css`**

Se mantienen separados de la lógica de negocio. El primero controla las traducciones y el segundo la presentación visual del panel.

## 8. Persistencia de datos

La información de las mesas no depende de una lista fija de demostración en el frontend.

El flujo de trabajo es el siguiente:

1. El panel consulta los datos guardados en el backend.
2. Las operaciones de creación y actualización se envían a la API.
3. El backend procesa las solicitudes y persiste los cambios en PostgreSQL.
4. Al actualizar la página o volver a consultar los datos, se recupera la información almacenada.

Por tanto, si la base de datos no contiene mesas, el panel debe mostrar el estado vacío y permitir crear nuevos registros.

## 9. Seguridad y limitaciones

Esta implementación es una prueba funcional y tiene las siguientes consideraciones:

- El acceso a las rutas protegidas se realiza mediante JWT.
- Las contraseñas se almacenan mediante hash.
- El secreto JWT se configura mediante una variable de entorno.
- El token del frontend se guarda en `sessionStorage`.
- No se debe publicar el archivo `.env`.
- La autorización actual debe revisarse si se incorporan roles, varios restaurantes o aislamiento de datos entre clientes.
- Antes de producción, deben evaluarse HTTPS, límites de solicitudes, validación de entradas, políticas de CORS, gestión de secretos, expiración y renovación de sesiones, y tratamiento de errores.

La autenticación por sí sola no garantiza que un usuario solo pueda acceder a los datos de su propio restaurante. Esa separación debe implementarse explícitamente si pasa a ser un requisito.

## 10. Pruebas funcionales realizadas

Durante la prueba se verificaron los siguientes flujos:

- Conexión con la base de datos mediante el endpoint de salud.
- Registro e inicio de sesión.
- Acceso al panel mediante autenticación.
- Consulta de mesas desde la API.
- Creación de mesas.
- Actualización del estado de las mesas.
- Persistencia de los cambios después de actualizar la página.
- Cierre de sesión y redirección al inicio de sesión.

Estas pruebas demuestran el flujo funcional básico, pero no equivalen a una auditoría de seguridad, pruebas de carga ni una certificación para producción.

## 11. Estado del proyecto

**Estado:** prototipo funcional para una prueba de integración entre frontend, backend y base de datos.

La versión actual demuestra las operaciones principales de autenticación y gestión de mesas. Las mejoras futuras pueden incluir pruebas automatizadas, documentación interactiva de la API, roles de usuario, aislamiento por restaurante, reservas, historial de cambios y despliegue controlado.

