import passport from 'passport'
import { AppError } from '../utils/errors.js'

// Envuelve passport.authenticate para que los fallos de autenticación salgan
// por el middleware central de errores (mismo formato { status, message } y
// status code correcto) en vez del 401 genérico de Passport.
//
// passport-local corta con "Missing credentials" ANTES de llamar a la
// estrategia cuando falta el email o la contraseña. `missingCredentialsError`
// permite que cada ruta decida cómo responder en ese caso (400 en el
// registro, 401 en el login), con el mismo formato que el resto de la API.
export const passportCall = (strategy, { missingCredentialsError } = {}) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(err)

    if (!user) {
      if (missingCredentialsError && info?.message === 'Missing credentials') {
        return next(missingCredentialsError())
      }

      // info.status solo viene seteado cuando el fallo lo produjo nuestro
      // propio service (register/login) vía done(null, false, {status, message}).
      // Si no, es un fallo interno de la estrategia (ej: passport-jwt sin
      // cookie o con token inválido/expirado): se responde siempre con el
      // mismo mensaje genérico, sin exponer el detalle interno.
      const status = info?.status || 401
      const message = info?.status ? info.message : 'No autenticado'
      return next(new AppError(status, message))
    }

    req.user = user
    next()
  })(req, res, next)
}
