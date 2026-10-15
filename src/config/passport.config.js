import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import 'dotenv/config'

import { registerUser, validateCredentials } from '../services/sessions.service.js'
import { COOKIE_NAME } from '../utils/jwt.js'

// Extrae el JWT desde la cookie "currentUser" en lugar del header Authorization.
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies[COOKIE_NAME] || null
  }
  return null
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
          const { first_name, last_name } = req.body
          const user = await registerUser({ first_name, last_name, email, password })
          return done(null, user)
        } catch (error) {
          // info.status/info.message viajan hasta el middleware passportCall,
          // que los usa para responder con el status correcto (400, 409, etc.)
          return done(null, false, { status: error.status, message: error.message })
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
          return done(null, false, { status: error.status, message: error.message })
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
