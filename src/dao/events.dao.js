import { EventModel } from '../models/event.model.js'

// Capa de acceso a datos: solo interactúa con Mongoose/MongoDB.
// A propósito NO existe un "deleteEvent": los eventos nunca se borran
// físicamente, solo cambian de status (ver services/events.service.js).

export const createEvent = async (eventData) => {
  return EventModel.create(eventData)
}

// filter / skip / limit / sort ya vienen armados desde el service.
export const findEvents = async ({ filter = {}, skip = 0, limit = 10, sort = { date: 1 } }) => {
  const [events, total] = await Promise.all([
    EventModel.find(filter).sort(sort).skip(skip).limit(limit),
    EventModel.countDocuments(filter)
  ])
  return { events, total }
}

export const findEventById = async (id) => {
  return EventModel.findById(id)
}

export const updateEvent = async (id, updates) => {
  return EventModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
}
