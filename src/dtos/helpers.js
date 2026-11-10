// Un campo de referencia (ref) puede llegar de dos formas: solo el id
// (ObjectId o string) o el documento relacionado ya "populado".
// Los ObjectId tienen toHexString; los documentos populados no.
export const isPopulated = (value) =>
  value !== null && typeof value === 'object' && typeof value.toHexString !== 'function'

// Convierte un id (o un documento populado) en un string con el id.
export const idToString = (value) => {
  if (value === null || value === undefined) return null
  return String(isPopulated(value) ? value._id : value)
}
