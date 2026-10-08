const express = require("express")

const router = express.Router()
const authentication = require("../middleware/authentication")
const authorizePermissions = require("../middleware/authorizePermissions")
const {getAllBrands, createBrand, updateBrand} = require("../controllers/brandController")

// ADMIN ROUTES
router.route("/admin").get(authentication, authorizePermissions("admin"), getAllBrands).post(authentication, authorizePermissions("admin"),createBrand)
router.route("/admin/:brandId")
    .patch(
        authentication,
        authorizePermissions("admin"),
        updateBrand
    )

// CLIENT ROUTES
router.route("/").get(getAllBrands)

module.exports = router