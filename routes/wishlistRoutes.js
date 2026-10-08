const express = require("express")
const router = express.Router()

const {getWishlist, addWishlistItem, removeWishlistItem} = require("../controllers/wishlistController")
const authentication = require("../middleware/authentication")

router.route("/").get(authentication,getWishlist)
router.route("/:productId").post(authentication, addWishlistItem).delete(authentication, removeWishlistItem)


module.exports = router