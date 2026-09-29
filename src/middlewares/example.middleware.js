export const exampleMiddleware = (req, res, next) => {

  console.log('Pasó por el middleware')
  next()
}