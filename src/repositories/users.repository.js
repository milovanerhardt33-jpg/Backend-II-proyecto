import * as usersDao from '../dao/users.dao.js'

// Capa de repositorio: intermediario entre los services y el DAO.
// Acá podría agregarse mapeo de datos, DTOs, etc.

export const createUser = async (userData) => {
  return usersDao.createUser(userData)
}

export const findUserByEmail = async (email) => {
  return usersDao.findUserByEmail(email)
}

export const findUserById = async (id) => {
  return usersDao.findUserById(id)
}
