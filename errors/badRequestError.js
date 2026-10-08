const {StatusCodes} = require("http-status-codes")
const CustomError =  require("./customError")

class BadRequestError extends CustomError {
    constructor(message, errors = null) {
        super(message, StatusCodes.BAD_REQUEST)

        this.errors = errors
    }
}

module.exports = BadRequestError