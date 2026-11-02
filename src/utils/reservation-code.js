import { randomBytes } from 'node:crypto'

// Código de reserva legible y difícil de adivinar. Ej: "EVT-7F3A9C2B1D4E".
// Usa crypto (no Math.random) para que no sea predecible.
export const generateReservationCode = () => {
  return `EVT-${randomBytes(6).toString('hex').toUpperCase()}`
}
