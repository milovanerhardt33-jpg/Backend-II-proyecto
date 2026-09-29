export const getEvents = async (req, res) => {
  try {
    // Todavía sin lógica de negocio: devuelve lista vacía.
    res.json({ status: 'success', payload: [] })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener eventos' })
  }
}

export const createEvent = async (req, res) => {
  try {
    res.status(501).json({ status: 'error', message: 'Creación de eventos aún no implementada' })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al crear evento' })
  }
}