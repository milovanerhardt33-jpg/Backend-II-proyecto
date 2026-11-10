import { generateToken, COOKIE_NAME } from '../utils/jwt.js'
import { UserDTO, CurrentUserDTO } from '../dtos/user.dto.js'

const COOKIE_MAX_AGE = 3600000 // 1 hora, en ms

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === 'production'
})

export const register = (req, res) => {
  // La estrategia 'register' de Passport ya validó, normalizó, hasheó
  // y persistió al usuario. La respuesta pasa por el DTO: sin password.
  res.status(201).json({ status: 'success', payload: new UserDTO(req.user) })
}

export const login = (req, res) => {
  // La estrategia 'login' de Passport ya validó las credenciales.
  // El JWT se genera acá, en el controller, no en la estrategia.
  const { id, email, role } = req.user
  const token = generateToken({ id, email, role })

  res.cookie(COOKIE_NAME, token, cookieOptions())
  res.status(200).json({ status: 'success', message: 'Login correcto' })
}

export const current = (req, res) => {
  // La estrategia 'current' de Passport ya verificó el JWT de la cookie
  // y cargó su payload en req.user. El DTO deja pasar solo id, email y role.
  res.status(200).json({ status: 'success', payload: new CurrentUserDTO(req.user) })
}

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions())
  res.status(200).json({ status: 'success', message: 'Sesión cerrada' })
}
