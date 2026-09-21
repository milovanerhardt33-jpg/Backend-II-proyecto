// Controlador de sesiones (auth). La lógica de registro, login y JWT
// se implementará en una próxima entrega.

export const register = async (req, res) => {
  try {
    res.status(501).json({ status: 'error', message: 'Registro aún no implementado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
}

export const login = async (req, res) => {
  try {
    res.status(501).json({ status: 'error', message: 'Login aún no implementado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}
