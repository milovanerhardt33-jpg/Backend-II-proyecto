import { idToString } from './helpers.js'

// Los DTO definen, campo por campo, qué se le muestra al cliente. Se arman
// con una lista blanca explícita: si el modelo suma un campo nuevo (o un
// populate trae de más), no sale en la respuesta salvo que se agregue acá.
// Ningún DTO de usuario incluye `password`, ni siquiera hasheado.

// Usuario "público" (registro, login): identificador + datos básicos.
export class UserDTO {
  constructor(user) {
    this.id = idToString(user.id ?? user._id)
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.email = user.email
    this.role = user.role
  }
}

// Usuario autenticado (GET /api/sessions/current): sale del JWT, que solo
// lleva id, email y role.
export class CurrentUserDTO {
  constructor(user) {
    this.id = idToString(user.id ?? user._id)
    this.email = user.email
    this.role = user.role
  }
}

// Listado administrativo (GET /api/users).
export class UserAdminDTO {
  constructor(user) {
    this._id = idToString(user._id)
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.email = user.email
    this.role = user.role
    this.createdAt = user.createdAt
    this.updatedAt = user.updatedAt
  }

  static list(users) {
    return users.map((user) => new UserAdminDTO(user))
  }
}

// Asistente de un ticket (cuando el ticket trae el usuario populado).
export class AttendeeDTO {
  constructor(user) {
    this._id = idToString(user._id)
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.email = user.email
  }
}
