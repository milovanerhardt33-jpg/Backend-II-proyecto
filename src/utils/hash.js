import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// Hashea una contraseña en texto plano.
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Compara una contraseña en texto plano contra su hash.
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}
