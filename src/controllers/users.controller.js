import { listUsers } from '../services/users.service.js'

export const getUsers = async (req, res) => {
  try {
    const users = await listUsers()
    res.json({ status: 'success', payload: users })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener usuarios' })
  }
}
