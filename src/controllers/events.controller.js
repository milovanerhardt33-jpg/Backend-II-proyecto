import * as eventsService from '../services/events.service.js'
import { EventDTO } from '../dtos/event.dto.js'

// Los controllers solo coordinan request/response: extraen datos de
// body/params/query, llaman al service y devuelven el resultado mapeado con
// su DTO. Los errores no se atrapan acá: Express 5 deriva las promesas
// rechazadas al middleware central (middlewares/error.middleware.js).

export const getEvents = async (req, res) => {
  const result = await eventsService.listEvents(req.query)
  res.json({ status: 'success', payload: { ...result, data: EventDTO.list(result.data) } })
}

export const getEventById = async (req, res) => {
  const event = await eventsService.getEventById(req.params.id)
  res.json({ status: 'success', payload: new EventDTO(event) })
}

export const createEvent = async (req, res) => {
  const event = await eventsService.createEvent({
    ...req.body,
    organizerId: req.user.id
  })
  res.status(201).json({ status: 'success', payload: new EventDTO(event) })
}

export const updateEvent = async (req, res) => {
  const event = await eventsService.updateEvent({
    eventId: req.params.id,
    updates: req.body ?? {},
    user: req.user
  })
  res.json({ status: 'success', payload: new EventDTO(event) })
}

export const updateEventStatus = async (req, res) => {
  const event = await eventsService.updateEventStatus({
    eventId: req.params.id,
    status: req.body?.status,
    user: req.user
  })
  res.json({ status: 'success', payload: new EventDTO(event) })
}
