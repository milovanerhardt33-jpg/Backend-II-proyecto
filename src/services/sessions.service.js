import * as usersRepository from '../repositories/users.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateToken } from '../utils/jwt.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

// Error de negocio con status HTTP asociado, para que el controller
// solo tenga que mapearlo a la respuesta.
class ServiceError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const registerUser = async ({ first_name, last_name, email, password }) => {
  // 1. Validar presencia de campos obligatorios
  if (!first_name || !last_name || !email || !password) {
    throw new ServiceError(400, 'Faltan campos obligatorios')
  }

  // 2. Normalizar email
  const normalizedEmail = email.trim().toLowerCase()

  // 3. Validar formato de email
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new ServiceError(400, 'El formato del email es inválido')
  }

  // 4. Validar longitud mínima de contraseña
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ServiceError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }

  // 5. Rechazar si el email ya existe
  const existingUser = await usersRepository.findUserByEmail(normalizedEmail)
  if (existingUser) {
    throw new ServiceError(409, 'El email ya está registrado')
  }

  // 6. Hashear contraseña
  const hashedPassword = await hashPassword(password)

  // 7. Persistir usuario. El rol NUNCA se toma del body: siempre 'user'.
  const newUser = await usersRepository.createUser({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'user'
  })

  // 8. Devolver únicamente datos seguros (sin password)
  return {
    id: newUser._id,
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    email: newUser.email,
    role: newUser.role
  }
}

export const loginUser = async ({ email, password }) => {
  // 1. Validar presencia de campos obligatorios
  if (!email || !password) {
    throw new ServiceError(401, 'Credenciales inválidas')
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 2. Buscar usuario por email
  const user = await usersRepository.findUserByEmail(normalizedEmail)

  // 3. Comparar contraseña. Mismo mensaje genérico tanto si el usuario
  // no existe como si la contraseña no coincide: nunca se revela cuál falló.
  const passwordMatches = user ? await comparePassword(password, user.password) : false

  if (!user || !passwordMatches) {
    throw new ServiceError(401, 'Credenciales inválidas')
  }

  // 4. Generar JWT con payload mínimo (sin password)
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  })

  return { token }
}
