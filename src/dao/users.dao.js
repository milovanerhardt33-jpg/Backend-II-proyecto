import { UserModel } from '../models/user.model.js'

// Capa de acceso a datos: solo interactúa con Mongoose/MongoDB.

export const createUser = async (userData) => {
  return UserModel.create(userData)
}

export const findUserByEmail = async (email) => {
  return UserModel.findOne({ email })
}

export const findUserById = async (id) => {
  return UserModel.findById(id)
}
