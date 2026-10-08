const express = require("express");
const router = express.Router();

const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, getSingleProductAdmin, getAllProductsAdmin, restoreProduct } = require("../controllers/productController");
const authentication = require("../middleware/authentication");
const  authorizedPermissions  = require("../middleware/authorizePermissions");
const uploadProductImage = require("../middleware/uploadProductImage")


// Admin Routes
router.route("/admin").get(authentication,authorizedPermissions("admin"),getAllProductsAdmin).post(authentication,authorizedPermissions("admin"),uploadProductImage({required: false}), createProduct)
router.route("/admin/:id").get(authentication,authorizedPermissions("admin"),getSingleProductAdmin).patch(authentication,authorizedPermissions("admin"),uploadProductImage({required : false}),updateProduct).delete(authentication,authorizedPermissions("admin"),deleteProduct)
router.route("/admin/:id/restore").patch(authentication, authorizedPermissions("admin"), restoreProduct)

// Client Router
router.route("/").get(getAllProducts)
router.route("/:id").get(getSingleProduct)

module.exports = router