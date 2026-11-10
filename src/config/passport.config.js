import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import 'dotenv/config'

import { registerUser, validateCredentials } from '../services/sessions.service.js'
import { COOKIE_NAME } from '../utils/jwt.js'
import { AppError } from '../utils/errors.js'

// Extrae el JWT desde la cookie "currentUser" en lugar del header Authorization.
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies[COOKIE_NAME] || null
  }
  return null
}

// Traduce el resultado de un service a lo que espera Passport:
//  - errores esperados de negocio (AppError: 400, 401, 409...) → rechazo con
//    su status y mensaje, que passportCall envía al middleware de errores;
//  - cualquier otro error (base caída, bug) → se propaga como error real
//    (500), en vez de disfrazarse de "credenciales inválidas".
const failAuth = (done, error) => {
  if (error instanceof AppError) {
    return done(null, false, { status: error.status, message: error.message })
  }
  return done(error)
}

// Centraliza la configuración de todas las estrategias de autenticación.
// Se llama una sola vez desde app.js. Para sumar un provider externo
// (Google, GitHub, etc.) alcanza con agregar un nuevo passport.use(...)
// acá adentro, sin tocar app.js ni las rutas existentes.
export const initializePassport = () => {
  // --- Estrategia "register" ---
  // Contiene toda la lógica de registro: validación, normalización de
  // email, hash con bcrypt, unicidad y rol por defecto (vía el service).
  passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body ?? {}
          const user = await registerUser({ first_name, last_name, email, password })
          return done(null, user)
        } catch (error) {
          return failAuth(done, error)
        }
      }
    )
  )

  // --- Estrategia "login" ---
  // Valida email + password (bcrypt) contra la base. Nunca distingue en el
  // mensaje si el email no existe o si la contraseña está mal.
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await validateCredentials({ email, password })
          return done(null, user)
        } catch (error) {
          return failAuth(done, error)
        }
      }
    )
  )

  // --- Estrategia "current" ---
  // Lee el JWT desde la cookie "currentUser", lo valida (firma + expiración)
  // y deja el payload disponible en req.user.
  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
      },
      async (jwtPayload, done) => {
        try {
          return done(null, jwtPayload)
        } catch (error) {
          return done(error)
        }
      }
    )
  )
}

export default passport
