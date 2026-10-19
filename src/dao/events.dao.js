import { EventModel } from '../models/event.model.js'

// Capa de acceso a datos: solo interactúa con Mongoose/MongoDB.

export const createEvent = async (eventData) => {
  return EventModel.create(eventData)
}

export const findAllEvents = async () => {
  return EventModel.find()
}

export const findEventById = async (id) => {
  return EventModel.findById(id)
}

export const updateEvent = async (id, updates) => {
  return EventModel.findByIdAndUpdate(id, updates, { new: true })
}

export const deleteEvent = async (id) => {
  return EventModel.findByIdAndDelete(id)
}
