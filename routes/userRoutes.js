const express = require("express");
const router = express.Router();
const authRateLimiter = require("../middleware/rateLimiter")

const {
  registerUser,
  loginUser,
} = require("../controllers/userController");

router.route("/register").post(registerUser);
router.route("/login").post(authRateLimiter, loginUser);


module.exports = router;
