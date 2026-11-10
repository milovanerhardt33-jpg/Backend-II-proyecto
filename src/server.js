import app from './app.js'
import { connectDB } from './config/database.js'
import 'dotenv/config'

const PORT = process.env.PORT || 8080

// La conexión a la base se hace acá (no al importar app.js), así la app se
// puede cargar sin base de datos. Si falla, se loguea y el server arranca igual.
await connectDB()

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
