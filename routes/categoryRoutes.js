const express = require("express")

const router = express.Router()

const {getAllCategories, createCategory, updateCategory} = require("../controllers/categoryController")

const authentication = require("../middleware/authentication")
const authorizePermissions = require("../middleware/authorizePermissions")

// ADMIN ROUTE 
router.route("/admin").get(authentication, authorizePermissions("admin"), getAllCategories).post(authentication,authorizePermissions("admin"), createCategory)
router.route('/admin/:categoryId').patch(authentication, authorizePermissions("admin"), updateCategory)

// CLIENT ROUTE
router.route("/").get(getAllCategories)

module.exports =  router