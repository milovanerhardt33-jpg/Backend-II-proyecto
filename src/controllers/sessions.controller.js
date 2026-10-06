import { registerUser, loginUser } from '../services/sessions.service.js'
import { COOKIE_NAME } from '../utils/jwt.js'

const COOKIE_MAX_AGE = 3600000 // 1 hora, en ms

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === 'production'
})

export const register = async (req, res) => {
  try {
    const payload = await registerUser(req.body)
    res.status(201).json({ status: 'success', payload })
  } catch (error) {
    // Errores de negocio (validación, duplicados) traen su propio status.
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al registrar usuario'
    res.status(status).json({ status: 'error', message })
  }
}

export const login = async (req, res) => {
  try {
    const { token } = await loginUser(req.body)

    res.cookie(COOKIE_NAME, token, cookieOptions())
    res.status(200).json({ status: 'success', message: 'Login correcto' })
  } catch (error) {
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al iniciar sesión'
    res.status(status).json({ status: 'error', message })
  }
}

export const current = (req, res) => {
  // El middleware "auth" ya validó el JWT y cargó req.user.
  const { id, email, role } = req.user
  res.status(200).json({ status: 'success', payload: { id, email, role } })
}

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions())
  res.status(200).json({ status: 'success', message: 'Sesión cerrada' })
}
