const express = require("express")
const router = express.Router()
const authentication = require("../middleware/authentication")
const authorizationPermissions = require("../middleware/authorizePermissions")
const {getDashboard} = require("../controllers/dashboardController")

router.route("/admin/dashboard").get(authentication, authorizationPermissions("admin"), getDashboard)

module.exports = router