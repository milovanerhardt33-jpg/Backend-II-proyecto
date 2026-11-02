import mongoose from 'mongoose'

export const TICKET_STATUS_VALUES = ['confirmed', 'pending', 'cancelled']

// Estados que OCUPAN cupo. Un ticket "cancelled" nunca cuenta.
export const ACTIVE_TICKET_STATUSES = ['confirmed', 'pending']

const ticketSchema = new mongoose.Schema(
  {
    // Solo referencias (ObjectId): nunca se embebe el usuario ni el evento.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    status: {
      type: String,
      enum: TICKET_STATUS_VALUES,
      default: 'confirmed'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'quantity debe ser un número entero'
      }
    },
    reservationCode: {
      type: String,
      required: true,
      unique: true
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    // createdAt / updatedAt automáticos
    timestamps: true
  }
)

// Red de seguridad contra duplicados: un usuario no puede tener dos tickets
// ACTIVOS para el mismo evento (aunque dos requests lleguen a la vez).
// Los tickets cancelados quedan fuera del índice, así que se puede volver a
// inscribir después de cancelar.
ticketSchema.index(
  { user: 1, event: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ACTIVE_TICKET_STATUSES } } }
)

export const TicketModel = mongoose.model('Ticket', ticketSchema)
