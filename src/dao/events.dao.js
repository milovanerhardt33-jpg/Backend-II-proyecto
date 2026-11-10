import { BaseDAO } from './base.dao.js'
import { EventModel } from '../models/event.model.js'

export class EventDAO extends BaseDAO {
  constructor() {
    super(EventModel)
  }

  // Página de eventos + total que matchea el filtro (para armar totalPages).
  async findPage({ filter = {}, skip = 0, limit = 10, sort = { date: 1 } } = {}) {
    const [events, total] = await Promise.all([
      this.find(filter, { sort, skip, limit }),
      this.count(filter)
    ])
    return { events, total }
  }
}
