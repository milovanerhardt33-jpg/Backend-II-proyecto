// Crea usuarios de prueba (admin, organizer y user) para poder probar la API
// sin tocar la base a mano. Se ejecuta con:  npm run seed
//
// - La contraseña sale de la variable SEED_PASSWORD (no está en el código).
// - Es idempotente: si el email ya existe, no lo vuelve a crear.
// - Usa el repository y el helper de hash, igual que el resto de la app:
//   este script tampoco importa modelos de Mongoose.
import 'dotenv/config'
import { connectDB, disconnectDB } from '../src/config/database.js'
import { usersRepository } from '../src/repositories/users.repository.js'
import { hashPassword } from '../src/utils/hash.js'

const TEST_USERS = [
  { first_name: 'Admin', last_name: 'Plataforma', email: 'admin@eventos.test', role: 'admin' },
  { first_name: 'Olivia', last_name: 'Organizadora', email: 'organizer@eventos.test', role: 'organizer' },
  { first_name: 'Ulises', last_name: 'Usuario', email: 'user@eventos.test', role: 'user' }
]

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('El seed no se ejecuta con NODE_ENV=production.')
    return 1
  }

  const plainPassword = process.env.SEED_PASSWORD
  if (!plainPassword || plainPassword.length < 6) {
    console.error('Definí SEED_PASSWORD (mínimo 6 caracteres) en tu .env antes de correr el seed.')
    return 1
  }

  if (!(await connectDB())) return 1

  const password = await hashPassword(plainPassword)

  for (const user of TEST_USERS) {
    const existing = await usersRepository.findByEmail(user.email)

    if (existing) {
      console.log(`= ${user.email} (${existing.role}) ya existe, se deja como está`)
      continue
    }

    await usersRepository.create({ ...user, password })
    console.log(`+ ${user.email} (${user.role}) creado`)
  }

  return 0
}

const exitCode = await run().catch((error) => {
  console.error('Error al ejecutar el seed:', error.message)
  return 1
})

await disconnectDB()
process.exit(exitCode)
