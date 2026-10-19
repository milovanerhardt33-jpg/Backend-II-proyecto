import { Router } from 'express'
import { getUsers } from '../controllers/users.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'

const router = Router()

// Ruta administrativa: solo admin puede ver el listado completo de usuarios.
router.get('/', auth, authorize(['admin']), getUsers)

export default router
