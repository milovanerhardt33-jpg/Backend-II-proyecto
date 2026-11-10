import { usersRepository } from '../repositories/users.repository.js'
import { UserDTO } from '../dtos/user.dto.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { BadRequestError, ConflictError, UnauthorizedError, DuplicateKeyError } from '../utils/errors.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export const registerUser = async ({ first_name, last_name, email, password }) => {
  // 1. Validar presencia de campos obligatorios
  if (!first_name || !last_name || !email || !password) {
    throw new BadRequestError('Faltan campos obligatorios')
  }

  // 2. Normalizar email
  const normalizedEmail = email.trim().toLowerCase()

  // 3. Validar formato de email
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new BadRequestError('El formato del email es inválido')
  }

  // 4. Validar longitud mínima de contraseña
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }

  // 5. Rechazar si el email ya existe
  const existingUser = await usersRepository.findByEmail(normalizedEmail)
  if (existingUser) {
    throw new ConflictError('El email ya está registrado')
  }

  // 6. Hashear contraseña
  const hashedPassword = await hashPassword(password)

  // 7. Persistir usuario. El rol NUNCA se toma del body: siempre 'user'.
  let newUser
  try {
    newUser = await usersRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    })
  } catch (error) {
    // Dos registros simultáneos con el mismo email: gana uno, el otro es 409.
    if (error instanceof DuplicateKeyError) {
      throw new ConflictError('El email ya está registrado')
    }
    throw error
  }

  // 8. Devolver únicamente datos seguros (DTO: sin password)
  return new UserDTO(newUser)
}

// Valida credenciales de login. NO genera el JWT: eso es responsabilidad
// del controller una vez que Passport confirma que el usuario es válido.
// Usada por la estrategia 'login' de Passport (src/config/passport.config.js).
export const validateCredentials = async ({ email, password }) => {
  // 1. Validar presencia de campos obligatorios
  if (!email || !password) {
    throw new UnauthorizedError('Credenciales inválidas')
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 2. Buscar usuario por email
  const user = await usersRepository.findByEmail(normalizedEmail)

  // 3. Comparar contraseña. Mismo mensaje genérico tanto si el usuario
  // no existe como si la contraseña no coincide: nunca se revela cuál falló.
  const passwordMatches = user ? await comparePassword(password, user.password) : false

  if (!user || !passwordMatches) {
    throw new UnauthorizedError('Credenciales inválidas')
  }

  // 4. Devolver únicamente datos seguros (DTO: sin password)
  return new UserDTO(user)
}
