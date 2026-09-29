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

| Variable    | Descripción                                      |
|-------------|---------------------------------------------------|
| `PORT`      | Puerto en el que se levanta el servidor (ej. 8080) |
| `NODE_ENV`  | Entorno de ejecución (`development` / `production`) |
| `MONGO_URL` | Cadena de conexión a la base de datos MongoDB       |
| `JWT_SECRET`| Clave secreta para la firma de tokens JWT (se usará en próximas entregas) |

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
│   │   └── database.js            # Conexión a MongoDB
│   ├── routes/
│   │   ├── events.routes.js       # Rutas de eventos
│   │   ├── sessions.routes.js     # Rutas de sesiones (estructura, sin lógica de auth)
│   │   ├── tickets.routes.js      # Rutas de inscripciones/tickets (pendiente)
│   │   └── users.routes.js        # Rutas de usuarios (pendiente)
│   ├── controllers/
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js
│   │   ├── tickets.controller.js  # (pendiente)
│   │   └── users.controller.js    # (pendiente)
│   ├── services/
│   │   └── sessions.service.js    # Validación, normalización y reglas de negocio del registro
│   ├── repositories/
│   │   └── users.repository.js
│   ├── dao/
│   │   └── users.dao.js           # Acceso directo a Mongoose
│   ├── models/
│   │   ├── user.model.js          # first_name, last_name, email, password, role
│   │   ├── event.model.js         # Modelo base de evento
│   │   └── ticket.model.js        # (pendiente)
│   ├── middlewares/
│   │   └── example.middleware.js
│   └── utils/
│       └── hash.js                # Helper reutilizable de bcrypt (hash y compare)
├── .env.example                   # Variables de entorno de ejemplo
├── .gitignore                     # Excluye .env y node_modules
├── package.json
└── README.md
```

## Rutas disponibles

### Salud del servidor

- `GET /api/health` → `{ "status": "ok", "message": "Servidor activo" }`

### Eventos

- `GET /api/events` → lista de eventos (vacía en esta etapa)
- `POST /api/events` → crear evento (placeholder)

### Sesiones

#### `POST /api/sessions/register` — Registro de usuarios

Registra un usuario nuevo, normaliza el email, valida los datos y guarda la contraseña **hasheada con bcrypt**. El campo `role` nunca se toma del body: siempre se guarda como `user`.

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

#### `POST /api/sessions/login`

Todavía no implementado (se desarrollará en una próxima entrega junto con JWT y cookies). Responde `501`.

### Rutas pendientes de implementación

Las siguientes rutas están previstas en la arquitectura pero se desarrollarán en próximas entregas (junto con JWT, cookies, Passport, roles y autorización):

- Login (`POST /api/sessions/login`)
- **Usuarios** (`/api/users`): CRUD de usuarios
- **Tickets / Inscripciones** (`/api/tickets`): inscripción a eventos, control de cupos

## Notas

- El proyecto usa módulos ES (`"type": "module"` en `package.json`).
- La conexión a MongoDB se intenta al iniciar el servidor; si `MONGO_URL` no está configurada correctamente, el error se loguea en consola sin frenar el servidor.
- La lógica del registro está distribuida en capas: `routes` → `controllers` → `services` (validación, normalización, reglas de negocio) → `repositories` → `dao` (Mongoose) → `models`.
- El hash de contraseñas usa `bcrypt` a través de un helper reutilizable en `src/utils/hash.js`.
- En las próximas entregas se incorporarán: login, JWT, cookies, ruta `current`, Passport, roles y autorización, gestión completa de eventos, inscripciones, control de cupos y notificaciones.
