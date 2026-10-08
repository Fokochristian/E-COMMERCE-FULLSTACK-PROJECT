const {StatusCodes} = require("http-status-codes")

const errorHandlerMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    const message =  err.message || "Something went wrong"

    return res.status(statusCode).json({success: false, message, ...(err.errors && {errors: err.errors})})
}

module.exports = errorHandlerMiddleware