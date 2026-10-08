const express = require("express")
const crypto = require("crypto")

const router = express.Router()

const {handleKpayWebhook} = require("../controllers/kpayWebhookController")

router.route("/").post(
    express.raw({ type: "application/json", limit: "100kb" }),
    async (req, res, next) => {
        try {
            const signature = req.headers["x-kpay-signature"]
            const raw = req.body

            const expected = crypto
                .createHmac("sha256", process.env.KPAY_WEBHOOK_SECRET)
                .update(raw)
                .digest("hex")

            if (!signature) {
                return res.status(400).send("Missing signature")
            }

            if (signature.length !== expected.length) {
                return res.status(400).send("Invalid signature")
            }

            const valid = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expected)
            )

            if (!valid) {
                return res.status(400).send("Invalid signature")
            }

            req.body = JSON.parse(raw.toString())

            await handleKpayWebhook(req, res)

        } catch(error) {
            next(error)
        }
    }
)

module.exports = router