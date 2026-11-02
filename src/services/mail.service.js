import { getTransporter, getMailFrom } from '../config/mail.config.js'

// Escapa texto que viene de usuarios antes de meterlo en el HTML del mail.
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])

const formatDate = (date) =>
  new Date(date).toLocaleString('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires'
  })

// Envía el mail de confirmación de inscripción.
// NUNCA lanza: si el mail falla (SMTP caído, credenciales mal, sin
// configurar), la inscripción ya quedó guardada y no tiene sentido
// deshacerla. Devuelve true/false según si se pudo enviar.
export const sendEnrollmentConfirmation = async ({ to, firstName, event, ticket }) => {
  const transporter = getTransporter()

  if (!transporter) {
    console.warn('[mail] MAIL_* no configuradas: no se envía el email de confirmación.')
    return false
  }

  const name = escapeHtml(firstName)
  const title = escapeHtml(event.title)
  const location = escapeHtml(event.location)
  const when = escapeHtml(formatDate(event.date))
  const code = escapeHtml(ticket.reservationCode)

  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to,
      subject: `Inscripción confirmada: ${event.title}`,
      text: [
        `Hola ${firstName},`,
        '',
        `Tu inscripción a "${event.title}" quedó confirmada.`,
        `Fecha: ${formatDate(event.date)}`,
        `Lugar: ${event.location}`,
        `Entradas: ${ticket.quantity}`,
        `Código de reserva: ${ticket.reservationCode}`,
        '',
        'Guardá este código: lo vas a necesitar para consultar o cancelar tu inscripción.'
      ].join('\n'),
      html: `
        <h2>¡Inscripción confirmada!</h2>
        <p>Hola ${name}, tu inscripción a <strong>${title}</strong> quedó confirmada.</p>
        <ul>
          <li><strong>Fecha:</strong> ${when}</li>
          <li><strong>Lugar:</strong> ${location}</li>
          <li><strong>Entradas:</strong> ${Number(ticket.quantity)}</li>
          <li><strong>Código de reserva:</strong> ${code}</li>
        </ul>
        <p>Guardá este código: lo vas a necesitar para consultar o cancelar tu inscripción.</p>
      `
    })
    return true
  } catch (error) {
    console.error('[mail] No se pudo enviar el email de confirmación:', error.message)
    return false
  }
}
