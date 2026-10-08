const express = require("express")

const router = express.Router()

const authentication = require("../middleware/authentication")
const authorizationPermissions = require("../middleware/authorizePermissions")

const {
    getAllCustomersForAdmin
} = require("../controllers/customerController")

router
    .route("/admin/customers")
    .get(
        authentication,
        authorizationPermissions("admin"),
        getAllCustomersForAdmin
    )

module.exports = router