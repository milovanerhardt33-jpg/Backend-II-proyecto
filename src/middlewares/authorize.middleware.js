import { ForbiddenError } from '../utils/errors.js'

// Middleware de autorización reutilizable. Recibe la lista de roles
// permitidos y la compara contra req.user.role (ya cargado por el
// middleware de autenticación, que SIEMPRE debe ir antes que este).
// Responde 403 si hay sesión pero el rol no está habilitado.
//
// Uso: router.post('/', auth, authorize(['organizer', 'admin']), createEvent)
export const authorize = (allowedRoles = []) => (req, res, next) => {
  const role = req.user?.role

  if (!role || !allowedRoles.includes(role)) {
    return next(new ForbiddenError())
  }

  next()
}
