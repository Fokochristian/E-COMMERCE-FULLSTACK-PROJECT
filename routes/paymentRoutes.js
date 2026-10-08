const express = require("express")

const router = express.Router()

const {createPayment, getAdminPayments} = require("../controllers/paymentController")

const authentication = require("../middleware/authentication")

const paymentRateLimiter = require("../middleware/paymentRateLimiter")
const authorizationPermissions = require("../middleware/authorizePermissions")

router.route("/").post(authentication, paymentRateLimiter, createPayment)
router.route("/admin").get(authentication, authorizationPermissions("admin"), getAdminPayments)


module.exports = router