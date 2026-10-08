const rateLimit = require("express-rate-limit")

const paymentRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        success: false,
        message: "Too many payment attempts. Please try again later"
    }
})

module.exports = paymentRateLimiter