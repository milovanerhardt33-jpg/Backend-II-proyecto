import { UserDAO } from '../dao/users.dao.js'

// Capa de repositorio: expone operaciones en lenguaje del dominio y se apoya
// en el DAO. No conoce Mongoose ni los modelos.
export class UserRepository {
  constructor(dao = new UserDAO()) {
    this.dao = dao
  }

  create(userData) {
    return this.dao.create(userData)
  }

  findById(id) {
    return this.dao.findById(id)
  }

  findByEmail(email) {
    return this.dao.findOne({ email })
  }

  // Listado administrativo: la consulta ya excluye el password.
  findAll() {
    return this.dao.find({}, { select: '-password' })
  }
}

export const usersRepository = new UserRepository()
