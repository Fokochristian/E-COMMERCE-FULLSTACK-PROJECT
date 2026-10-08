const express = require("express")
const router = express.Router()

const authorizationPermissions  = require("../middleware/authorizePermissions")
const {updateShipmentStatusByAdmin, getAllShipmentsByAdmin} = require("../controllers/shipmentController")
const authentication = require("../middleware/authentication")

router.route("/status/:shipmentId").patch(authentication, authorizationPermissions("admin"), updateShipmentStatusByAdmin)

router.route("/admin").get(authentication, authorizationPermissions("admin"), getAllShipmentsByAdmin)


module.exports = router