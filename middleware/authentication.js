const jwt = require("jsonwebtoken")
const {StatusCodes} = require("http-status-codes")

const authentication = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: "Authentication invalid"})
        }
        const token = authHeader.split(" ")[1]
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        req.user = {
            userId: payload.userId,
            role: payload.role
        }
        next()
    } catch(err) {
        res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: "Authentication failed"})
    }
}

module.exports = authentication