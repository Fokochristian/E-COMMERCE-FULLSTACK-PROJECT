const express = require("express")
const router = express.Router()

const { addToCart, getCart, updateCart,removeCartItemFromCart } = require("../controllers/cartController")
const authentication = require("../middleware/authentication")

router.route("/").get(authentication,getCart).post(authentication,addToCart)
router.route("/items/:cartItemId").patch(authentication,updateCart).delete(authentication, removeCartItemFromCart)


module.exports = router



