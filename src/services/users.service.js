import { usersRepository } from '../repositories/users.repository.js'

// Ruta administrativa: listar todos los usuarios (sin password).
export const listUsers = async () => {
  return usersRepository.findAll()
}
