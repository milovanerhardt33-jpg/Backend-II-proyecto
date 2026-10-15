# Plataforma de Eventos e Inscripciones - Backend II

Proyecto backend desarrollado como parte del curso **Programación Backend II**. Implementa una API RESTful para una plataforma de gestión de eventos e inscripciones, construida con Node.js, Express y MongoDB, siguiendo una arquitectura en capas (rutas, controladores, servicios, repositorios, DAO y modelos).

## Temática del proyecto

Plataforma de Eventos e Inscripciones: permite crear y consultar eventos, y sienta la base para incorporar en próximas entregas el registro/login de usuarios, autenticación con JWT, roles y permisos, inscripción a eventos, control de cupos y notificaciones.

## Tecnologías utilizadas

- **Node.js** - Entorno de ejecución JavaScript
- **Express** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **dotenv** - Gestión de variables de entorno
- **bcrypt** - Hash seguro de contraseñas
- **jsonwebtoken** - Generación y verificación de JWT
- **cookie-parser** - Lectura de cookies en las requests
- **passport** - Framework de autenticación, centraliza las estrategias
- **passport-local** - Estrategia de email + password (registro y login)
- **passport-jwt** - Estrategia que valida el JWT guardado en la cookie
- **nodemon** - Reinicio automático del servidor en desarrollo

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/WalterMaza/Backend_II_95275.git
cd Backend_II_95275
```

2. Instalar las dependencias:

```bash
npm install
```

## Configuración de variables de entorno

1. Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Completar las variables en `.env`:

| Variable         | Descripción                                      |
|------------------|---------------------------------------------------|
| `PORT`           | Puerto en el que se levanta el servidor (ej. 8080) |
| `NODE_ENV`       | Entorno de ejecución (`development` / `production`). En `production`, la cookie `currentUser` se envía con `secure: true` |
| `MONGO_URL`      | Cadena de conexión a la base de datos MongoDB       |
| `JWT_SECRET`     | Clave secreta para firmar y verificar los JWT       |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT (ej. `1h`)             |

## Cómo ejecutar

Modo desarrollo (con reinicio automático):

```bash
npm run dev
```

El servidor quedará escuchando en el puerto definido por `PORT` (por defecto 8080).

## Estructura de carpetas

```
.
├── src/
│   ├── app.js                     # Configuración de Express (NO levanta el server)
│   ├── server.js                  # Punto de entrada, levanta el servidor
│   ├── config/
│   │   ├── database.js            # Conexión a MongoDB
│   │   └── passport.config.js     # Estrategias 'register', 'login' y 'current' centralizadas
│   ├── routes/
│   │   ├── events.routes.js       # Rutas de eventos
│   │   ├── sessions.routes.js     # Rutas de sesiones (delegan en passport.authenticate)
│   │   ├── tickets.routes.js      # Rutas de inscripciones/tickets (pendiente)
│   │   └── users.routes.js        # Rutas de usuarios (pendiente)
│   ├── controllers/
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js # Genera el JWT (login) y responde; la validación ya la hizo Passport
│   │   ├── tickets.controller.js  # (pendiente)
│   │   └── users.controller.js    # (pendiente)
│   ├── services/
│   │   └── sessions.service.js    # Validación, normalización y reglas de negocio (usado por las estrategias)
│   ├── repositories/
│   │   └── users.repository.js
│   ├── dao/
│   │   └── users.dao.js           # Acceso directo a Mongoose
│   ├── models/
│   │   ├── user.model.js          # first_name, last_name, email, password, role
│   │   ├── event.model.js         # Modelo base de evento
│   │   └── ticket.model.js        # (pendiente)
│   ├── middlewares/
│   │   ├── example.middleware.js
│   │   └── passport-call.middleware.js  # Envuelve passport.authenticate con el formato de respuesta de la API
│   └── utils/
│       ├── hash.js                # Helper reutilizable de bcrypt (hash y compare)
│       └── jwt.js                 # Helper reutilizable de JWT (generar/verificar) + nombre de la cookie
├── .env.example                   # Variables de entorno de ejemplo
├── .gitignore                     # Excluye .env y node_modules
├── package.json
└── README.md
```

## Rutas disponibles

| Método | Ruta                      | Descripción                                   | Protegida |
|--------|---------------------------|------------------------------------------------|-----------|
| GET    | `/api/health`             | Estado del servidor                             | No        |
| GET    | `/api/events`              | Lista de eventos (vacía en esta etapa)          | No        |
| POST   | `/api/events`              | Crear evento (placeholder)                      | No        |
| POST   | `/api/sessions/register`   | Registro de usuarios                            | No        |
| POST   | `/api/sessions/login`      | Login, genera JWT y setea cookie `currentUser`  | No        |
| GET    | `/api/sessions/current`    | Devuelve el usuario autenticado                 | Sí (cookie `currentUser`) |
| POST   | `/api/sessions/logout`     | Elimina la cookie `currentUser`                 | No        |

El detalle de cada endpoint de sesiones está más abajo.

### Salud del servidor

- `GET /api/health` → `{ "status": "ok", "message": "Servidor activo" }`

### Eventos

- `GET /api/events` → lista de eventos (vacía en esta etapa)
- `POST /api/events` → crear evento (placeholder)

### Sesiones

#### Autenticación centralizada con Passport.js

Desde esta entrega, toda la autenticación pasa por **estrategias de Passport**, centralizadas en `src/config/passport.config.js` (nunca en `app.js` ni en las rutas). `app.js` solo inicializa Passport (`passport.initialize()`); no conoce el detalle de cómo se valida nada. Esto no cambia el comportamiento externo de la API: las rutas y sus respuestas son las mismas que en la entrega anterior.

Estrategias implementadas:

| Estrategia | Tipo | Qué hace |
|------------|------|----------|
| `register` | `passport-local` (con `passReqToCallback`) | Corre la validación, normalización de email, hash con bcrypt, control de email duplicado y asignación del rol por defecto (vía `sessions.service.js`). Si falla, informa el status/mensaje correspondiente (400 o 409). |
| `login`    | `passport-local` | Busca el usuario por email y compara la contraseña con bcrypt. Si algo falla, siempre informa el mismo mensaje genérico ("Credenciales inválidas", 401), sin distinguir la causa. **No genera el JWT** — eso lo hace el controller después. |
| `current`  | `passport-jwt` | Extrae el JWT de la cookie `currentUser` (en vez del header `Authorization`), valida su firma y expiración, y deja el payload en `req.user`. Si no hay cookie o el token es inválido/expirado, falla con 401 "No autenticado". |

Las rutas delegan directamente en estas estrategias a través de un middleware (`src/middlewares/passport-call.middleware.js`) que normaliza cualquier fallo al formato `{ status: "error", message }` de la API:

```js
router.post('/register', passportCall('register'), register)
router.post('/login', passportCall('login'), login)
router.get('/current', passportCall('current'), current)
router.post('/logout', logout) // No pasa por Passport
```

Una vez que la estrategia aprueba la request, el **controller** (no la estrategia) es quien genera el JWT en el login y setea la cookie `currentUser` (`httpOnly: true`). Esto mantiene la generación de tokens como una responsabilidad propia de la capa HTTP, separada de la lógica de autenticación.

**Preparado para providers externos:** agregar una estrategia nueva (por ejemplo `passport-google-oauth20` o `passport-github2`) implica sumar un `passport.use(...)` más dentro de `passport.config.js`, sin tocar `app.js` ni las rutas ya existentes — la estructura ya está pensada para eso.

#### `POST /api/sessions/register` — Registro de usuarios

Registra un usuario nuevo a través de la estrategia `register` de Passport, que normaliza el email, valida los datos y guarda la contraseña **hasheada con bcrypt**. El campo `role` nunca se toma del body: siempre se guarda como `user`.

**Body esperado (JSON):**

| Campo        | Tipo   | Obligatorio | Notas                                  |
|--------------|--------|-------------|-----------------------------------------|
| `first_name` | string | sí          |                                          |
| `last_name`  | string | sí          |                                          |
| `email`      | string | sí          | Debe tener formato de email válido; se normaliza (trim + lowercase) |
| `password`   | string | sí          | Mínimo 6 caracteres                     |

**Ejemplo de request:**

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

**Respuesta 201 (éxito, email normalizado, sin password):**

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

**Respuesta 400 (campos faltantes o email con formato inválido):**

```json
{ "status": "error", "message": "Faltan campos obligatorios" }
```

**Respuesta 409 (email ya registrado):**

```json
{ "status": "error", "message": "El email ya está registrado" }
```

**Cómo probarlo (ejemplo con curl):**

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Perez","email":"ana@mail.com","password":"Secreta123"}'
```

Casos a verificar manualmente:
1. Registro exitoso (201, respuesta sin `password`).
2. Campos faltantes (400).
3. Email con formato inválido (400).
4. Registrar el mismo email dos veces (la segunda debe dar 409).
5. En MongoDB (Compass o `mongosh`), confirmar que el campo `password` del usuario guardado es un hash de bcrypt (empieza con `$2b$...`), nunca texto plano.

#### `POST /api/sessions/login` — Login

La estrategia `login` de Passport valida email y contraseña (comparando contra el hash con bcrypt). Si son correctas, el **controller** genera un JWT con `{ id, email, role }` y lo guarda en una cookie `currentUser` (`httpOnly`, `sameSite: 'lax'`, `maxAge: 3600000` ms, `secure: true` solo en producción).

**Body esperado (JSON):**

| Campo      | Tipo   | Obligatorio |
|------------|--------|-------------|
| `email`    | string | sí          |
| `password` | string | sí          |

**Ejemplo de request:**

```json
{ "email": "ana@mail.com", "password": "Secreta123" }
```

**Respuesta 200 (éxito, además setea la cookie `currentUser` HttpOnly):**

```json
{ "status": "success", "message": "Login correcto" }
```

**Respuesta 401 (campos faltantes, email inexistente o contraseña incorrecta — siempre el mismo mensaje genérico):**

```json
{ "status": "error", "message": "Credenciales inválidas" }
```

**Cómo probarlo (curl, guardando la cookie en un archivo):**

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"Secreta123"}'
```

#### `GET /api/sessions/current` — Usuario autenticado

Ruta protegida por la estrategia `current` de Passport (`passport-jwt`), que lee la cookie `currentUser`, verifica el JWT y carga `req.user`.

**Respuesta 200 (con cookie válida):**

```json
{
  "status": "success",
  "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" }
}
```

**Respuesta 401 (sin cookie, o token inválido/expirado):**

```json
{ "status": "error", "message": "No autenticado" }
```

**Cómo probarlo (reutilizando la cookie guardada en el login):**

```bash
curl -b cookies.txt http://localhost:8080/api/sessions/current
```

#### `POST /api/sessions/logout` — Cerrar sesión

Elimina la cookie `currentUser`.

**Respuesta 200:**

```json
{ "status": "success", "message": "Sesión cerrada" }
```

**Cómo probarlo:**

```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/sessions/logout
```

Después de esto, un `GET /api/sessions/current` con la misma cookie debe volver a dar 401.

### Casos a verificar manualmente (flujo completo)

1. Registro exitoso (201, respuesta sin `password`).
2. Campos faltantes en el registro (400).
3. Email con formato inválido en el registro (400).
4. Registrar el mismo email dos veces (la segunda debe dar 409).
5. Login exitoso → cookie `currentUser` presente en la respuesta.
6. Login con email inexistente → 401 "Credenciales inválidas".
7. Login con contraseña incorrecta → 401 "Credenciales inválidas" (mismo mensaje que el caso anterior).
8. `GET /api/sessions/current` con la cookie → 200 con `{ id, email, role }`.
9. `GET /api/sessions/current` sin cookie → 401 "No autenticado".
10. `GET /api/sessions/current` con un token manipulado/expirado → 401 "No autenticado".
11. `POST /api/sessions/logout` → elimina la cookie; un `current` posterior vuelve a dar 401.
12. En MongoDB (Compass o `mongosh`), confirmar que el campo `password` del usuario guardado es un hash de bcrypt (empieza con `$2b$...`), nunca texto plano.

### Rutas pendientes de implementación

Las siguientes rutas están previstas en la arquitectura pero se desarrollarán en próximas entregas (roles y autorización más finos, gestión completa de eventos, inscripciones):

- **Usuarios** (`/api/users`): CRUD de usuarios
- **Tickets / Inscripciones** (`/api/tickets`): inscripción a eventos, control de cupos

## Notas

- El proyecto usa módulos ES (`"type": "module"` en `package.json`).
- La conexión a MongoDB se intenta al iniciar el servidor; si `MONGO_URL` no está configurada correctamente, el error se loguea en consola sin frenar el servidor.
- La lógica de sesiones está distribuida en capas: `routes` → `passport.authenticate` (estrategia) → `services` (validación, normalización, reglas de negocio) → `repositories` → `dao` (Mongoose) → `models`, y recién ahí el `controller` responde (y genera el JWT en el login). Nada de esta lógica vive en la ruta ni en `app.js`.
- El hash de contraseñas usa `bcrypt` a través de un helper reutilizable en `src/utils/hash.js`.
- La firma y verificación de JWT usa `jsonwebtoken` a través de un helper reutilizable en `src/utils/jwt.js`, consumido tanto por el controller (para firmar) como por la estrategia `current` de `passport-jwt` (para verificar).
- Las estrategias de autenticación (`register`, `login`, `current`) están centralizadas en `src/config/passport.config.js`. `app.js` solo las inicializa (`passport.initialize()`); nunca contiene lógica de autenticación.
- El sistema queda preparado para sumar **providers externos** (Google, GitHub, etc.): alcanza con agregar una nueva estrategia dentro de `passport.config.js`, sin tocar `app.js` ni las rutas existentes.
- El login nunca distingue entre "email no existe" y "contraseña incorrecta": siempre responde el mismo mensaje genérico ("Credenciales inválidas") para no filtrar información a un atacante. Lo mismo aplica a `/current`: cualquier falla (sin cookie, token inválido o expirado) responde el mismo mensaje genérico ("No autenticado").
- El payload del JWT solo contiene `{ id, email, role }`; la contraseña nunca viaja en el token ni en ninguna respuesta de la API.
- En las próximas entregas se incorporarán: roles y autorización más granular, gestión completa de eventos, inscripciones, control de cupos y notificaciones.
