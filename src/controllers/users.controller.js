import { listUsers } from '../services/users.service.js'
import { UserAdminDTO } from '../dtos/user.dto.js'

export const getUsers = async (req, res) => {
  const users = await listUsers()
  res.json({ status: 'success', payload: UserAdminDTO.list(users) })
}
