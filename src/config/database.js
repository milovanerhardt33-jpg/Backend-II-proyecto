import dns from 'node:dns'
import mongoose from 'mongoose'
import 'dotenv/config'

// Opcional: algunas redes rechazan la consulta DNS SRV que Node usa para
// resolver las cadenas "mongodb+srv://" de Atlas (error "querySrv
// ECONNREFUSED"). Con DNS_SERVERS (ej: 8.8.8.8,1.1.1.1) se fuerza qué
// servidores DNS usa Node. Si no se define, no cambia nada.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean))
}

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
