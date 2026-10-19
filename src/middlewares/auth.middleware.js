import { passportCall } from './passport-call.middleware.js'

// Middleware de autenticación reutilizable: valida el JWT que viaja en la
// cookie "currentUser" (a través de la estrategia 'current' de Passport,
// ver src/config/passport.config.js) y puebla req.user.
// Responde 401 si no hay sesión válida (sin cookie, token inválido o expirado).
export const auth = passportCall('current')
