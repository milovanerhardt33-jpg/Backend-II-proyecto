import { BaseDAO } from './base.dao.js'
import { UserModel } from '../models/user.model.js'

export class UserDAO extends BaseDAO {
  constructor() {
    super(UserModel)
  }
}
