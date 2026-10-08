const jwt = require("jsonwebtoken")

const createJWT = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
}

module.exports = createJWT