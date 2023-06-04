const { StatusCodes } = require('http-status-codes')

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    message: err.message || 'Something went wrong,try again later',
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  }
  if (err.code === 11000) {
    customError.message = `Duplicated value for ${Object.keys(
      err.keyValue
    ).join(',')}`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ')
    customError.statusCode = StatusCodes.BAD_REQUEST
  }
  if (err.name === 'CastError') {
    customError.message = `No item found with id : ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
  }
  res.status(customError.statusCode).json(customError.message)
  // res.status(customError.statusCode).json(err)
}

module.exports = errorHandlerMiddleware
