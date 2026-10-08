const express = require("express")
const router = express.Router()
const {checkout, getOrders, getMyOrder, getAllOrdersForAdmin, updateOrderStatusByAdmin, cancelOrder, getOrderByIdForAdmin} = require("../controllers/orderController")
const authentication = require("../middleware/authentication");
const authorizationPermissions = require("../middleware/authorizePermissions");

router.route("/orders/checkout").post(authentication, checkout)
router.route("/orders").get(authentication, getOrders)
router.route("/orders/:orderId").get(authentication, getMyOrder)
router.route("/orders/cancel/:orderId").patch(authentication, cancelOrder)

// ADMIN ONLY ROUTES
router.route("/admin/orders").get(authentication,authorizationPermissions("admin"),getAllOrdersForAdmin)
router.route("/admin/orders/:orderId").get(authentication, authorizationPermissions("admin"), getOrderByIdForAdmin).patch(authentication,authorizationPermissions("admin"), updateOrderStatusByAdmin)


module.exports = router