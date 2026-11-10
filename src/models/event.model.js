import mongoose from 'mongoose'
import { EVENT_STATUS_VALUES } from '../constants/event-status.js'

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: EVENT_STATUS_VALUES,
      default: 'draft'
    },
    // Referencia al usuario dueño del evento. NUNCA se guarda el objeto
    // completo del usuario acá, solo su _id (populate bajo demanda).
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

export const EventModel = mongoose.model('Event', eventSchema)
