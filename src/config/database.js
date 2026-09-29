import mongoose from 'mongoose'
import 'dotenv/config'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Base de datos conectada')
  } catch (error) {
    console.error('Error al conectar MongoDB', error)
  }
}
