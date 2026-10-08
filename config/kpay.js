const axios = require("axios")

const kpay = axios.create({
    baseURL: "https://admin.kpay.site/api/v1",
    headers: {
        "X-API-Key": process.env.KPAY_API_KEY,
        "X-Secret-Key": process.env.KPAY_SECRET_KEY,
        "Content-Type": "application/json"
    }
})

module.exports = kpay