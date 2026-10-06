import jwt from 'jsonwebtoken'
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

// Nombre de la cookie donde se guarda el JWT. Se exporta para que
// controller y middleware usen siempre el mismo nombre.
export const COOKIE_NAME = 'currentUser'

// Firma un JWT a partir de un payload (ej: { id, email, role }).
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verifica un JWT. Lanza si es inválido o expiró.
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}
