require("dotenv").config();
const cloudinary = require("./config/cloudinary");



// setting up server
const express = require("express");
const pool = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const app = express();

// Static File Serving Setup
const path = require("node:path");



// routers
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const kpayWebhookRoutes = require("./routes/kpayWebhookRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoute");
const dashboardRoutes = require("./routes/dashboardRoute");
const customerRoutes = require("./routes/customerRoutes");
const analyticsRoute = require("./routes/analyticsRoute");

// Middlewarefiles
const errorHandlerMiddleware = require("./middleware/errorHandler");

// k-pay webhook must come before express.json()
app.use("/api/v1/webhooks/kpay", kpayWebhookRoutes);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// Middleware
app.use(express.json({ limit: "100kb" }));
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1", customerRoutes);
app.use("/api/v1/analytics", analyticsRoute);
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// API 404 handler
app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Page not found" });
});

// middlewareuse
app.use(errorHandlerMiddleware);

const port = process.env.PORT;

const start = async () => {
  try {
    // connect to db
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL");
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}.....`);
    });
  } catch (err) {
    console.log("Database connection failed:", err.message);
  }
};

start();
