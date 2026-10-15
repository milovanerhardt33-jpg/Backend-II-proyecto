import passport from 'passport'

// Envuelve passport.authenticate para poder responder siempre con el mismo
// formato JSON ({ status, message }) y con el status code correcto, en vez
// de dejar que Passport responda con su 401 genérico por defecto.
export const passportCall = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(err)

    if (!user) {
      // info.status solo viene seteado cuando el fallo lo produjo nuestro
      // propio service (register/login) vía done(null, false, {status, message}).
      // Si no, es un fallo interno de la estrategia (ej: passport-jwt sin
      // cookie o con token inválido/expirado): se responde siempre con el
      // mismo mensaje genérico, sin exponer el detalle interno.
      const status = info?.status || 401
      const message = info?.status ? info.message : 'No autenticado'
      return res.status(status).json({ status: 'error', message })
    }

    req.user = user
    next()
  })(req, res, next)
}
