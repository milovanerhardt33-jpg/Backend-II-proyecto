import { verifyToken, COOKIE_NAME } from '../utils/jwt.js'

// Lee la cookie con el JWT, lo verifica y guarda el payload en req.user.
// Si no hay cookie o el token es inválido/expirado, responde 401.
export const auth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME]

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' })
  }

  try {
    const payload = verifyToken(token)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' })
  }
}
