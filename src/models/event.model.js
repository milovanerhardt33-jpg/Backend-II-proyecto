import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      default: 0
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

export const EventModel = mongoose.model('Event', eventSchema)
