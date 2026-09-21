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
│   ├── services/                  # Lógica de negocio (a completar en próximas entregas)
│   ├── repositories/              # Patrón repositorio (a completar en próximas entregas)
│   ├── dao/                       # Acceso a datos (a completar en próximas entregas)
│   ├── models/
│   │   ├── user.model.js          # Modelo base de usuario
│   │   ├── event.model.js         # Modelo base de evento
│   │   └── ticket.model.js        # (pendiente)
│   ├── middlewares/
│   │   └── example.middleware.js
│   └── utils/                     # Utilidades (errores, hash, jwt) - a completar
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

### Sesiones (estructura inicial, sin lógica de autenticación todavía)

- `POST /api/sessions/register`
- `POST /api/sessions/login`

### Rutas pendientes de implementación

Las siguientes rutas están previstas en la arquitectura pero se desarrollarán en próximas entregas (junto con JWT, cookies, Passport, roles y autorización):

- **Usuarios** (`/api/users`): CRUD de usuarios
- **Tickets / Inscripciones** (`/api/tickets`): inscripción a eventos, control de cupos

## Notas

- El proyecto usa módulos ES (`"type": "module"` en `package.json`).
- La conexión a MongoDB se intenta al iniciar el servidor; si `MONGO_URL` no está configurada correctamente, el error se loguea en consola sin frenar el servidor.
- Esta es la base arquitectónica (Pre-entrega 1). En las próximas entregas se incorporarán: registro y login de usuarios, JWT, cookies, Passport, roles y autorización, gestión completa de eventos, inscripciones, control de cupos y notificaciones.
