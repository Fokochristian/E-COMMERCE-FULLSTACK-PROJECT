const express = require("express")
const router = express.Router()

const authentication = require("../middleware/authentication")
const authorizationPermissions = require("../middleware/authorizePermissions")
const {
    getAdminAnalytics
} = require("../controllers/analyticsController")

router.route("/admin").get(
    authentication,
    authorizationPermissions("admin"),
    getAdminAnalytics
)

module.exports = router