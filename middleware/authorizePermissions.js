const {StatusCodes} = require("http-status-codes")

const authorizationPermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(StatusCodes.FORBIDDEN).json({success: false, message: "Access denied"})
        }
        next()
    }
}

module.exports = authorizationPermissions