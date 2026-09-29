import { registerUser } from '../services/sessions.service.js'

export const register = async (req, res) => {
  try {
    const payload = await registerUser(req.body)
    res.status(201).json({ status: 'success', payload })
  } catch (error) {
    // Errores de negocio (validación, duplicados) traen su propio status.
    const status = error.status || 500
    const message = error.status ? error.message : 'Error al registrar usuario'
    res.status(status).json({ status: 'error', message })
  }
}

export const login = async (req, res) => {
  try {
    res.status(501).json({ status: 'error', message: 'Login aún no implementado' })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al iniciar sesión' })
  }
}
