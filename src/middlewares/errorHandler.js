export default function errorHandler(error, req, res, next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON.'
      }
    });
  }

  const requestedStatus = error.statusCode;

  const statusCode =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus < 500
      ? requestedStatus
      : 500;

  const isServerError = statusCode >= 500;

  return res.status(statusCode).json({
    error: {
      code: isServerError
        ? 'INTERNAL_SERVER_ERROR'
        : error.code || 'REQUEST_ERROR',
      message: isServerError
        ? 'An unexpected error occurred.'
        : error.message || 'The request could not be processed.'
    }
  });
}