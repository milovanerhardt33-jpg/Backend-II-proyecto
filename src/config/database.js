import mongoose from 'mongoose'
import 'dotenv/config'

// Devuelve true si conectó y false si falló: el servidor decide qué hacer
// (arranca igual y loguea el error), el script de seed aborta.
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Base de datos conectada')
    return true
  } catch (error) {
    console.error('Error al conectar MongoDB', error)
    return false
  }
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
}
