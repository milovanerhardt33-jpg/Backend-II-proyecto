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
│   │   ├── events.routes.js       # Rutas de eventos (auth + authorize en las protegidas)
│   │   ├── sessions.routes.js     # Rutas de sesiones (delegan en passport.authenticate)
│   │   ├── tickets.routes.js      # Rutas de inscripciones/tickets (pendiente)
│   │   └── users.routes.js        # Rutas de usuarios (ruta administrativa)
│   ├── controllers/
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js # Genera el JWT (login) y responde; la validación ya la hizo Passport
│   │   ├── tickets.controller.js  # (pendiente)
│   │   └── users.controller.js    # Listado de usuarios (solo admin)
│   ├── services/
│   │   ├── sessions.service.js    # Validación, normalización y reglas de negocio (usado por las estrategias)
│   │   ├── events.service.js      # Reglas de negocio de eventos + propiedad del recurso
│   │   └── users.service.js
│   ├── repositories/
│   │   ├── users.repository.js
│   │   └── events.repository.js
│   ├── dao/
│   │   ├── users.dao.js           # Acceso directo a Mongoose
│   │   └── events.dao.js
│   ├── models/
│   │   ├── user.model.js          # first_name, last_name, email, password, role
│   │   ├── event.model.js         # title, description, category, date, location, capacity, price, status, organizer
│   │   └── ticket.model.js        # (pendiente)
│   ├── middlewares/
│   │   ├── example.middleware.js
│   │   ├── passport-call.middleware.js  # Envuelve passport.authenticate con el formato de respuesta de la API
│   │   ├── auth.middleware.js     # Autenticación reutilizable (401 si no hay sesión válida)
│   │   └── authorize.middleware.js # Autorización por roles (403 si el rol no está permitido)
│   └── utils/
│       ├── hash.js                # Helper reutilizable de bcrypt (hash y compare)
│       └── jwt.js                 # Helper reutilizable de JWT (generar/verificar) + nombre de la cookie
├── .env.example                   # Variables de entorno de ejemplo
├── .gitignore                     # Excluye .env y node_modules
├── package.json
└── README.md
```

## Roles y autorización

El sistema reconoce tres roles, guardados en `User.role`: **`user`** (default), **`organizer`** y **`admin`**. El registro público (`POST /api/sessions/register`) **siempre** fuerza `role: "user"`, sin importar qué venga en el body: no se puede crear un `organizer` o un `admin` desde ahí. Para tener un `organizer` o un `admin` de prueba hay que crearlos manualmente (directo en la base, o promoviendo a un usuario ya registrado).

### Matriz de permisos

| Acción                              | `user` | `organizer` | `admin` |
|--------------------------------------|:------:|:------------:|:-------:|
| Consultar eventos (`GET /api/events`) | ✅ | ✅ | ✅ |
| Crear eventos (`POST /api/events`)    | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos **propios** | ❌ | ✅ | ✅ |
| Modificar/cancelar **cualquier** evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios (`GET /api/users`) | ❌ | ❌ | ✅ |

### Los dos middlewares de autorización

Son **reutilizables** y están **separados de las rutas** (`src/middlewares/`):

- **`auth`** (`auth.middleware.js`) — Autenticación. Valida el JWT de la cookie `currentUser` (vía la estrategia `current` de Passport). Si no hay sesión válida, responde **401**. No conoce nada sobre roles.
- **`authorize(rolesPermitidos)`** (`authorize.middleware.js`) — Autorización. Se usa **después** de `auth`, compara `req.user.role` contra la lista de roles que recibe como parámetro. Si el rol no está en la lista, responde **403**. No vuelve a validar el token: asume que `auth` ya corrió antes.

Ejemplo de uso combinado en una ruta:

```js
router.post('/', auth, authorize(['organizer', 'admin']), createEvent)
```

### 401 vs. 403 — la diferencia

- **401 (No autenticado)** → no hay sesión, o la sesión no es válida (sin cookie, token inválido o expirado). El servidor no sabe quién sos.
- **403 (Sin permisos)** → el servidor sabe perfectamente quién sos (tu sesión es válida), pero tu rol no te habilita a hacer esa acción puntual.

Ninguno de los dos casos devuelve nunca un 500: son errores de negocio esperados, no fallas del servidor.

### Propiedad del recurso (ownership)

Más allá del rol, modificar un evento (`PUT`) o cambiar su estado (`PATCH .../status`) valida que **quien lo pide sea el dueño** (`event.organizer === req.user.id`) **o** tenga rol `admin`. Esta validación vive en `src/services/events.service.js`, no en el middleware (el middleware de roles solo sabe "organizer o admin pueden intentar esta ruta"; quién puede tocar **ese evento en particular** es una regla de negocio del service).

## Eventos: estados y reglas de negocio

### Estados posibles (`Event.status`)

| Estado | Significado |
|--------|-------------|
| `draft` | Estado por defecto al crear un evento. Existe pero todavía no es "oficial". |
| `published` | El evento está publicado/activo. |
| `cancelled` | El evento fue cancelado. **Es un estado terminal e inmutable** (ver abajo). |
| `finished` | El evento ya ocurrió. |

### Reglas de negocio (todas viven en `src/services/events.service.js`, nunca en la ruta ni en el controller)

- **Al crear un evento:** `title`, `description`, `category`, `location`, `date` y `capacity` son obligatorios. `capacity` debe ser `> 0`, `price` (si se manda) debe ser `>= 0`. La `date` no puede estar en el pasado. El evento nace siempre en estado `draft`, sin importar qué venga en el body.
- **`organizer` nunca sale del body:** siempre se asigna automáticamente desde `req.user.id` (el usuario autenticado), tanto al crear como al modificar — si el body trae un `organizer`, se descarta.
- **Un evento cancelado queda inmutable:** decisión documentada del equipo — una vez que `status === 'cancelled'`, ni `PUT` ni `PATCH /status` lo pueden volver a tocar, ni siquiera un `admin`. No implementamos ninguna excepción a esto (si en el futuro hiciera falta reabrir un evento cancelado por error, debería ser una acción administrativa aparte, auditada, no un update común).
- **No se puede "republicar" un evento ya finalizado:** `PATCH /status` con `status: "published"` sobre un evento `finished` devuelve error.
- **Cancelar = cambiar `status` a `cancelled`, nunca se borra el documento.** No existe ningún `DELETE` en la API de eventos.
- **`PUT /:id` no puede cambiar el `status`:** eso es exclusivo de `PATCH /:id/status`. Si el body de un `PUT` trae `status`, se ignora.

## Rutas disponibles

| Método | Ruta                       | Descripción                                   | Acceso |
|--------|----------------------------|------------------------------------------------|--------|
| GET    | `/api/health`               | Estado del servidor                             | Público |
| GET    | `/api/events`                | Lista eventos, con filtros/paginación/orden     | Público |
| GET    | `/api/events/:id`            | Consultar un evento puntual                     | Público |
| POST   | `/api/events`                | Crear evento                                    | `organizer`, `admin` |
| PUT    | `/api/events/:id`            | Modificar evento                                | Dueño del evento, o `admin` |
| PATCH  | `/api/events/:id/status`     | Cambiar el estado del evento (incluye cancelar) | Dueño del evento, o `admin` |
| GET    | `/api/users`                  | Listado de todos los usuarios (sin password)    | `admin` |
| POST   | `/api/sessions/register`     | Registro de usuarios (siempre `role: user`)     | Público |
| POST   | `/api/sessions/login`        | Login, genera JWT y setea cookie `currentUser`  | Público |
| GET    | `/api/sessions/current`      | Devuelve el usuario autenticado                 | Autenticado |
| POST   | `/api/sessions/logout`       | Elimina la cookie `currentUser`                 | Público |

El detalle de cada endpoint de sesiones está más abajo.

### Salud del servidor

- `GET /api/health` → `{ "status": "ok", "message": "Servidor activo" }`

### Eventos

#### `GET /api/events` — Listar eventos (con filtros, paginación y orden)

Pública, no requiere sesión.

**Query params, todos opcionales:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Filtra por estado exacto: `draft`, `published`, `cancelled`, `finished` |
| `category` | string | Filtra por categoría (match exacto, sin distinguir mayúsculas/minúsculas) |
| `location` | string | Filtra por ubicación (contiene el texto, sin distinguir mayúsculas/minúsculas) |
| `dateFrom` | fecha (ISO) | Solo eventos a partir de esta fecha (inclusive) |
| `dateTo` | fecha (ISO) | Solo eventos hasta esta fecha (inclusive) |
| `page` | number | Página a devolver (default `1`) |
| `limit` | number | Resultados por página (default `10`, máximo `50`) |
| `sort` | string | Campo de orden; `date` = ascendente, `-date` = descendente (default `date` ascendente) |

**Respuesta 200:**

```json
{
  "status": "success",
  "payload": {
    "data": [ { "_id": "6690...", "title": "Congreso Tech", "status": "published", "...": "..." } ],
    "page": 2,
    "limit": 5,
    "total": 23,
    "totalPages": 5
  }
}
```

**Cómo probarlo:**

```bash
curl "http://localhost:8080/api/events?status=published&category=workshop&page=2&limit=5"
curl "http://localhost:8080/api/events?dateFrom=2026-01-01&dateTo=2026-06-30&sort=-date"
```

#### `GET /api/events/:id` — Consultar un evento

Pública, no requiere sesión.

**Respuesta 200:**

```json
{ "status": "success", "payload": { "_id": "6690...", "title": "Congreso Tech", "...": "..." } }
```

**Respuesta 404 (evento inexistente, o `:id` con formato inválido):**

```json
{ "status": "error", "message": "Evento no encontrado" }
```

#### `POST /api/events` — Crear evento

Requiere sesión (401 si no hay cookie) y rol `organizer` o `admin` (403 para `user`). El campo `organizer` del evento **siempre** sale del usuario autenticado (`req.user.id`); no se toma del body. El evento nace siempre en estado `draft`.

**Body esperado:**

| Campo | Tipo | Obligatorio | Regla |
|-------|------|:-----------:|-------|
| `title` | string | sí | |
| `description` | string | sí | |
| `category` | string | sí | |
| `date` | fecha (ISO) | sí | No puede estar en el pasado |
| `location` | string | sí | |
| `capacity` | number | sí | Debe ser `> 0` |
| `price` | number | no (default `0`) | Debe ser `>= 0` |

**Respuesta 403 (rol `user`):**

```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

**Respuesta 400 (fecha pasada, `capacity <= 0`, `price < 0`, o campos faltantes):**

```json
{ "status": "error", "message": "La capacidad debe ser mayor a 0" }
```

**Respuesta 201 (rol `organizer` o `admin`):**

```json
{
  "status": "success",
  "payload": { "_id": "6690...", "title": "Congreso Tech 2026", "status": "draft", "organizer": "665f2a..." }
}
```

**Cómo probarlo:**

```bash
curl -b cookies.txt -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Congreso Tech","description":"desc","category":"workshop","date":"2026-12-01","location":"CABA","capacity":100,"price":500}'
```

#### `PUT /api/events/:id` — Modificar evento

Requiere sesión + rol `organizer`/`admin`, **y además** ser el dueño del evento (o ser `admin`). No permite tocar `organizer` ni `status` (se ignoran si vienen en el body — `status` se cambia solo vía el endpoint de abajo). Si el evento está `cancelled`, la modificación se rechaza siempre.

- Evento inexistente → 404
- Rol insuficiente para intentar la ruta (ej. `user`) → 403 (lo da el middleware `authorize`)
- Rol suficiente pero no sos el dueño ni admin → 403 (lo decide `events.service.js`)
- Evento cancelado → 400

**Respuesta 403 (organizer que no es dueño del evento):**

```json
{ "status": "error", "message": "No podés modificar un evento que no te pertenece" }
```

**Respuesta 400 (evento cancelado):**

```json
{ "status": "error", "message": "No se puede modificar un evento cancelado" }
```

#### `PATCH /api/events/:id/status` — Cambiar el estado del evento (incluye cancelar)

Misma lógica de permisos y propiedad que `PUT`. Para cancelar un evento: `{ "status": "cancelled" }`. El evento **nunca se borra**, solo cambia de estado.

**Body esperado:**

```json
{ "status": "cancelled" }
```

(`status` debe ser uno de: `draft`, `published`, `cancelled`, `finished`)

**Respuesta 200:**

```json
{ "status": "success", "payload": { "_id": "6690...", "status": "cancelled", "...": "..." } }
```

**Respuesta 400 (evento ya cancelado, o se intenta "republicar" uno `finished`):**

```json
{ "status": "error", "message": "No se puede modificar un evento cancelado" }
```

### Usuarios

#### `GET /api/users` — Listado de todos los usuarios (ruta administrativa)

Requiere sesión + rol `admin` exclusivamente. Nunca expone el campo `password`.

**Respuesta 403 (rol `user` u `organizer`):**

```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

**Respuesta 200 (rol `admin`):**

```json
{
  "status": "success",
  "payload": [
    { "id": "665f2a...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" }
  ]
}
```

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

### Casos a verificar — roles y autorización

13. `POST /api/events` con un usuario rol `user` → 403.
14. `POST /api/events` con un usuario rol `organizer` → 201.
15. Ruta administrativa (`GET /api/users`) con rol `organizer` → 403.
16. Ruta administrativa (`GET /api/users`) con rol `admin` → 200.
17. Cualquier ruta privada sin cookie (`GET /api/sessions/current`, `POST /api/events`, etc.) → 401.
18. Un `organizer` intentando modificar (`PUT`) o cambiar el estado (`PATCH .../status`) de un evento que no es suyo → 403, aunque su rol sí le permita intentar la ruta.
19. Un `organizer` modificando su **propio** evento → 200.
20. Un `admin` modificando el evento de **cualquier** `organizer` → 200.
21. Intentar registrarse enviando `"role": "admin"` en el body del registro → el usuario queda creado igual, pero con `role: "user"`.

### Casos a verificar — eventos y lógica de negocio

22. Crear evento con rol `user` → 403.
23. Crear evento con `date` en el pasado → 400.
24. Crear evento con `capacity: 0` (o negativa) → 400.
25. Crear evento con `price` negativo → 400.
26. `organizer` modifica (`PUT`) su propio evento → 200.
27. `organizer` modifica (`PUT`) un evento ajeno → 403.
28. `admin` modifica el evento de otro `organizer` → 200.
29. Cambiar el estado (`PATCH .../status`) de un evento ya `cancelled` → 400 (queda inmutable).
30. Intentar "republicar" (`status: "published"`) un evento `finished` → 400.
31. Listar con filtros combinados: `?status=published&category=workshop&page=2&limit=5` → `payload.data` solo con eventos que matcheen, y `page`/`limit`/`total`/`totalPages` coherentes.
32. Consultar un evento inexistente (`GET /api/events/:id`) → 404.
33. Crear un evento y confirmar que el `organizer` guardado es el `_id` del usuario autenticado, nunca lo que venga en el body (si se manda un `organizer` distinto, se ignora).
34. Cancelar un evento (`PATCH .../status` con `status: "cancelled"`) y confirmar en MongoDB que el documento **sigue existiendo** (no se borra, solo cambia `status`).

### Rutas pendientes de implementación

Las siguientes rutas están previstas en la arquitectura pero se desarrollarán en próximas entregas (inscripciones, control de cupos, notificaciones):

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
- La autorización por roles usa dos middlewares reutilizables y separados: `auth` (`src/middlewares/auth.middleware.js`, 401 si no hay sesión) y `authorize(roles)` (`src/middlewares/authorize.middleware.js`, 403 si el rol no está permitido). Ningún rol está hardcodeado dentro de las rutas: siempre se pasa como parámetro a `authorize`.
- La propiedad del recurso (que un `organizer` solo pueda tocar sus propios eventos) se valida en `src/services/events.service.js`, no en el middleware de roles — el middleware solo sabe qué roles pueden *intentar* la ruta, no a quién pertenece cada evento en particular.
- El registro público (`POST /api/sessions/register`) ignora cualquier `role` que venga en el body: el usuario siempre se crea con `role: "user"`. Para tener un `organizer` o un `admin` de prueba hay que crearlos manualmente (por ejemplo, insertándolos directo en MongoDB o cambiando el `role` de un usuario ya registrado).
- El payload del JWT solo contiene `{ id, email, role }`; la contraseña nunca viaja en el token ni en ninguna respuesta de la API.
- `organizer` en `Event` es una **referencia** (`ObjectId`) al usuario dueño, nunca el objeto completo embebido. No se hace `populate` por defecto en el listado (para mantenerlo liviano); se puede agregar más adelante si hiciera falta mostrar los datos del organizador junto con el evento.
- Los eventos **nunca se borran físicamente**: no existe ningún `DELETE` en la API de eventos. "Cancelar" es cambiar `status` a `cancelled`, y ese estado queda inmutable (decisión documentada en la sección "Eventos: estados y reglas de negocio" de este README).
- Toda la lógica de negocio de eventos (validación de fecha/capacidad/precio, propiedad del recurso, reglas de transición de estado) vive en `src/services/events.service.js`. Las rutas y los controllers no contienen ninguna de estas reglas: el controller solo arma la llamada al service y mapea el resultado (o el error) a una respuesta HTTP.
- El listado de eventos (`GET /api/events`) siempre devuelve paginado — no existe forma de traer "todos los eventos sin límite" desde la API; el máximo de `limit` es 50 por página.
- En las próximas entregas se incorporarán: inscripciones (tickets), control de cupos y notificaciones.
