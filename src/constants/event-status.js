// Estados posibles de un evento. Viven en una constante propia (y no en el
// modelo) para que services y repositories puedan usarlos sin importar nada
// de Mongoose.
export const EVENT_STATUS_VALUES = ['draft', 'published', 'cancelled', 'finished']
