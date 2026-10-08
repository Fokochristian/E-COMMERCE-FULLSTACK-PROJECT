const rateLimit = require("express-rate-limit")

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        message: "Too many attempts. Please try again later"
    }
})

module.exports = authRateLimiter