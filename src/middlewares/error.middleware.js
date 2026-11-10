import { AppError, DuplicateKeyError } from '../utils/errors.js'

// Formato ÚNICO de error para toda la API:
//   { "status": "error", "message": "..." }
//
//   400 datos inválidos · 401 no autenticado · 403 sin permisos
//   404 no encontrado   · 409 conflicto       · 500 error interno

// Rutas que no existen.
export const notFoundHandler = (req, res, next) => {
  next(new AppError(404, 'Ruta no encontrada'))
}

// Middleware central: tiene que registrarse al FINAL de app.js (4 parámetros).
// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  const { status, message } = describeError(error)

  // Los errores esperados (4xx) son parte del uso normal de la API; solo se
  // loguean los inesperados, y sin devolver el detalle al cliente.
  if (status === 500) {
    console.error(error)
  }

  res.status(status).json({ status: 'error', message })
}

const describeError = (error) => {
  // Errores de negocio y de autenticación/autorización, ya con su status.
  if (error instanceof AppError) {
    return { status: error.status, message: error.message }
  }

  // Violación de un índice único que ningún service tradujo antes.
  if (error instanceof DuplicateKeyError) {
    return { status: 409, message: 'El recurso ya existe' }
  }

  // Mongoose: datos que no pasan el schema, o valores con tipo inválido.
  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors ?? {}).map((item) => item.message)
    return { status: 400, message: details.length ? `Datos inválidos: ${details.join('. ')}` : 'Datos inválidos' }
  }
  if (error?.name === 'CastError') {
    return { status: 400, message: `Valor inválido para "${error.path}"` }
  }

  // JSON mal formado en el body (lo detecta express.json()).
  if (error?.type === 'entity.parse.failed') {
    return { status: 400, message: 'El body de la request no es un JSON válido' }
  }

  return { status: 500, message: 'Error interno del servidor' }
}
