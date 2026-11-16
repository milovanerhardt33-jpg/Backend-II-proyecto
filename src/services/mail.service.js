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

// Envío común a todos los mails. NUNCA lanza: si el mail falla (SMTP caído,
// credenciales mal, sin configurar), la operación ya quedó guardada y no
// tiene sentido deshacerla. Devuelve true/false según si se pudo enviar.
const deliver = async ({ to, subject, text, html }, label) => {
  const transporter = getTransporter()

  if (!transporter) {
    console.warn(`[mail] MAIL_* no configuradas: no se envía el email de ${label}.`)
    return false
  }

  try {
    await transporter.sendMail({ from: getMailFrom(), to, subject, text, html })
    return true
  } catch (error) {
    console.error(`[mail] No se pudo enviar el email de ${label}:`, error.message)
    return false
  }
}

// Mail de confirmación de inscripción.
export const sendEnrollmentConfirmation = ({ to, firstName, event, ticket }) => {
  const name = escapeHtml(firstName)
  const title = escapeHtml(event.title)
  const location = escapeHtml(event.location)
  const when = escapeHtml(formatDate(event.date))
  const code = escapeHtml(ticket.reservationCode)

  return deliver(
    {
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
    },
    'confirmación'
  )
}

// Mail de cancelación de inscripción (la haya hecho el dueño o un admin).
export const sendCancellationNotice = ({ to, firstName, event, ticket }) => {
  const name = escapeHtml(firstName)
  const title = escapeHtml(event.title)
  const code = escapeHtml(ticket.reservationCode)

  return deliver(
    {
      to,
      subject: `Inscripción cancelada: ${event.title}`,
      text: [
        `Hola ${firstName},`,
        '',
        `Tu inscripción a "${event.title}" fue cancelada.`,
        `Código de reserva: ${ticket.reservationCode}`,
        `Entradas liberadas: ${ticket.quantity}`,
        '',
        'Si querés asistir, podés volver a inscribirte mientras haya cupo disponible.'
      ].join('\n'),
      html: `
        <h2>Inscripción cancelada</h2>
        <p>Hola ${name}, tu inscripción a <strong>${title}</strong> fue cancelada.</p>
        <ul>
          <li><strong>Código de reserva:</strong> ${code}</li>
          <li><strong>Entradas liberadas:</strong> ${Number(ticket.quantity)}</li>
        </ul>
        <p>Si querés asistir, podés volver a inscribirte mientras haya cupo disponible.</p>
      `
    },
    'cancelación'
  )
}
