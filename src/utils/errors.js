// Errores de la aplicación. Cada uno lleva el status HTTP que le corresponde,
// así el middleware central de errores (middlewares/error.middleware.js) puede
// armar la respuesta sin que services ni controllers se ocupen de eso.

export class AppError extends Error {
  constructor(status, message) {
    super(message)
    this.name = this.constructor.name
    this.status = status
  }
}

// 400 - datos inválidos
export class BadRequestError extends AppError {
  constructor(message = 'Datos inválidos') {
    super(400, message)
  }
}

// 401 - no autenticado
export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(401, message)
  }
}

// 403 - autenticado pero sin permisos
export class ForbiddenError extends AppError {
  constructor(message = 'No tenés permisos para realizar esta acción') {
    super(403, message)
  }
}

// 404 - recurso inexistente
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message)
  }
}

// 409 - conflicto con el estado actual (duplicado, sin cupo, estado inválido)
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(409, message)
  }
}

// Error de persistencia agnóstico del motor: lo lanza el DAO cuando se viola
// un índice único. Así los services pueden reaccionar (reintentar, traducir a
// un 409 con mensaje claro) sin conocer códigos propios de MongoDB.
export class DuplicateKeyError extends Error {
  constructor(fields = []) {
    super(`Valor duplicado en: ${fields.join(', ') || 'campo único'}`)
    this.name = 'DuplicateKeyError'
    this.fields = fields
  }
}
