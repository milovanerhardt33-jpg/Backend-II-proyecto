// Middleware de autorización reutilizable. Recibe la lista de roles
// permitidos y la compara contra req.user.role (ya cargado por el
// middleware de autenticación, que SIEMPRE debe ir antes que este).
// Responde 403 si hay sesión pero el rol no está habilitado.
//
// Uso: router.post('/', auth, authorize(['organizer', 'admin']), createEvent)
export const authorize = (allowedRoles = []) => (req, res, next) => {
  const role = req.user?.role

  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permisos para realizar esta acción'
    })
  }

  next()
}
