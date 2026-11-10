import mongoose from 'mongoose'
import { DuplicateKeyError } from '../utils/errors.js'

// DAO genérico: encapsula el acceso a UN modelo de Mongoose. Los DAOs de cada
// entidad lo extienden y suman consultas propias. Los DAOs son los únicos
// archivos del proyecto que conocen Mongoose y los modelos.
//
// A propósito NO hay un "delete": ni eventos ni tickets se borran físicamente
// (cancelar es cambiar el status).
//
// Todas las lecturas devuelven objetos planos (lean), no documentos de
// Mongoose: así nada de la capa de datos se filtra hacia arriba.
export class BaseDAO {
  constructor(model) {
    this.model = model
  }

  // Un id con formato inválido equivale a "no existe": se devuelve null en
  // lugar de dejar que Mongoose reviente con un CastError.
  async findById(id, { select } = {}) {
    if (!mongoose.isValidObjectId(id)) return null
    let query = this.model.findById(id)
    if (select) query = query.select(select)
    return query.lean()
  }

  async findOne(filter, { select } = {}) {
    let query = this.model.findOne(filter)
    if (select) query = query.select(select)
    return query.lean()
  }

  async find(filter = {}, { sort, skip, limit, select } = {}) {
    let query = this.model.find(filter)
    if (select) query = query.select(select)
    if (sort) query = query.sort(sort)
    if (skip) query = query.skip(skip)
    if (limit) query = query.limit(limit)
    return query.lean()
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter)
  }

  async create(data) {
    try {
      const document = await this.model.create(data)
      return document.toObject()
    } catch (error) {
      throw translateDuplicateKey(error)
    }
  }

  async update(id, updates) {
    if (!mongoose.isValidObjectId(id)) return null
    try {
      return await this.model
        .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .lean()
    } catch (error) {
      throw translateDuplicateKey(error)
    }
  }
}

// El código 11000 es el error de clave duplicada de MongoDB: se traduce a un
// error propio de la app para que las capas de arriba no dependan del motor.
const translateDuplicateKey = (error) => {
  if (error?.code === 11000) {
    return new DuplicateKeyError(Object.keys(error.keyPattern ?? {}))
  }
  return error
}
