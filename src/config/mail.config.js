import nodemailer from 'nodemailer'
import 'dotenv/config'

// Configuración de Nodemailer. Las credenciales salen SIEMPRE de variables
// de entorno (MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM):
// nunca van hardcodeadas en el código.

let transporter = null

export const isMailConfigured = () => {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env
  return Boolean(MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS && MAIL_FROM)
}

// El transporter se crea la primera vez que se necesita (no al importar),
// así el servidor arranca igual aunque el mail todavía no esté configurado.
export const getTransporter = () => {
  if (!isMailConfigured()) return null

  if (!transporter) {
    const port = Number(process.env.MAIL_PORT)

    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      // 465 usa TLS directo; 587 / 2525 / 25 negocian STARTTLS.
      secure: port === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
      // Timeouts cortos: si el SMTP no responde, la inscripción no se
      // queda colgada esperando el mail.
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    })
  }

  return transporter
}

export const getMailFrom = () => process.env.MAIL_FROM
