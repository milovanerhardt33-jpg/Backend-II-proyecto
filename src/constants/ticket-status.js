// Estados posibles de un ticket.
export const TICKET_STATUS_VALUES = ['confirmed', 'pending', 'cancelled']

// Estados que OCUPAN cupo. Un ticket "cancelled" nunca cuenta.
export const ACTIVE_TICKET_STATUSES = ['confirmed', 'pending']
