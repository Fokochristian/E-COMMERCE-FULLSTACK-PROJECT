# E-Commerce Full-Stack Project

A full-stack e-commerce application built as a realistic freelance-style
project. The application includes a customer storefront, authentication,
shopping cart, wishlist, checkout and payment flow, order management,
and a complete admin dashboard.

The project was built to practice taking a web application from database
design and backend development through frontend integration and
production deployment.

## Live Application

-   Frontend: https://e-commerce-fullstack-project.pages.dev/
-   Backend API: https://e-commerce-api-nux3.onrender.com/

## GitHub Repository

https://github.com/Fokochristian/E-COMMERCE-FULLSTACK-PROJECT

------------------------------------------------------------------------

## Project Overview

This project is a complete e-commerce system with two main sides:

### Customer Side

Customers can:

-   Create an account
-   Log in and authenticate securely
-   Browse products
-   Search for products
-   Filter products
-   Navigate products using pagination
-   View product details
-   Add products to a cart
-   Update cart quantities
-   Checkout
-   Initiate and monitor payments
-   View their orders
-   View individual order details
-   Cancel eligible orders
-   Add and remove products from a wishlist

### Admin Side

Administrators can:

-   Access a protected admin dashboard
-   View dashboard statistics
-   Manage products
-   Add products
-   Edit products
-   Delete products
-   Manage categories
-   Manage brands
-   View and manage orders
-   View customers
-   Monitor payments
-   Manage shipment information
-   View analytics
-   Access protected admin functionality based on their role

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   HTML5
-   CSS3
-   Vanilla JavaScript
-   Axios

The frontend intentionally uses plain HTML, CSS, and JavaScript rather
than a frontend framework.

## Backend

-   Node.js
-   Express 5
-   JavaScript
-   Axios
-   JWT
-   bcrypt
-   Multer
-   file-type
-   express-rate-limit
-   Helmet
-   CORS
-   validator
-   http-status-codes

## Database

-   PostgreSQL
-   `pg` Node.js PostgreSQL client

## External Services

-   Neon PostgreSQL --- production database
-   Render --- backend/API hosting
-   Cloudflare Pages --- frontend hosting
-   Cloudinary --- product image storage and delivery
-   KPay --- payment integration

------------------------------------------------------------------------

# Architecture

The production architecture is:

``` text
                    Browser
                       |
             +---------+---------+
             |                   |
             v                   v
      Cloudflare Pages        Render
        Frontend              Express API
      HTML/CSS/JS                 |
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
              Neon PostgreSQL             Cloudinary
                Database                 Product Images
                    |
                    v
               KPay Integration
```

The frontend communicates with the Express API using Axios.

The Express API communicates with PostgreSQL through the `pg` connection
pool.

Product images are uploaded to Cloudinary, while the Cloudinary URL and
public ID are stored in PostgreSQL.

------------------------------------------------------------------------

# Backend Architecture

The backend follows a layered structure designed to keep
responsibilities separated.

The general request flow is:

``` text
Route
  ↓
Controller
  ↓
Validation
  ↓
Service
  ↓
Model
  ↓
PostgreSQL
```

Not every simple feature requires every layer, but the project generally
follows this separation.

### Routes

Routes define API endpoints and connect HTTP requests to controllers.

### Controllers

Controllers handle incoming requests and responses.

### Validators

Validators handle input validation before data reaches the business/data
layers.

### Services

Services contain reusable business logic where the feature requires it.

### Models

Models communicate with PostgreSQL and handle database operations.

### Middleware

Middleware handles cross-cutting concerns such as authentication,
authorization, uploads, rate limiting, and error handling.

### Errors

Custom error classes are used to represent application errors
consistently.

### Utils

Reusable helper functions live here, including Cloudinary upload
functionality.

------------------------------------------------------------------------

# Project Structure

``` text
E-COMMERCE-FULLSTACK-PROJECT/
│
├── config/
│   ├── cloudinary.js
│   └── db.js
│
├── controllers/
│
├── errors/
│
├── frontend/
│   ├── admin/
│   │   ├── css/
│   │   ├── js/
│   │   └── *.html
│   │
│   ├── css/
│   ├── js/
│   └── *.html
│
├── middleware/
│
├── models/
│
├── routes/
│
├── services/
│
├── sql/
│   └── schema.sql
│
├── utils/
│
├── validators/
│
├── .gitignore
├── app.js
├── package.json
└── README.md
```

------------------------------------------------------------------------

# Authentication and Authorization

The application uses JWT-based authentication.

When a user logs in successfully, the backend generates a JWT containing
information such as:

-   `userId`
-   `role`

The frontend stores the token in `localStorage` and sends it with
authenticated API requests using the Bearer authentication scheme.

Example:

``` text
Authorization: Bearer <token>
```

The backend authentication middleware verifies the token and attaches
the authenticated user information to the request.

Role-based authorization is then used to protect admin functionality.

------------------------------------------------------------------------

# User Management

Users can register and log in through:

``` text
POST /api/v1/users/register
POST /api/v1/users/login
```

Passwords are hashed using bcrypt before being stored in the database.

The application also handles duplicate email registration and
authentication failures.

Login requests are protected with rate limiting.

------------------------------------------------------------------------

# Product Management

Products contain information including:

-   Name
-   Description
-   Price
-   Image
-   Stock quantity
-   Availability
-   Category
-   Brand
-   Creation date

Products support:

-   Search
-   Filtering
-   Pagination
-   Category filtering
-   Brand filtering
-   Stock management
-   Admin CRUD operations

------------------------------------------------------------------------

# Product Images

Product images are stored using Cloudinary.

The application uses:

-   `image_path` --- the Cloudinary secure URL
-   `image_public_id` --- the Cloudinary public identifier

When a product is created:

``` text
Frontend
   ↓
Multer memory storage
   ↓
File validation
   ↓
Cloudinary
   ↓
Cloudinary URL + public ID
   ↓
PostgreSQL
```

When a product image is updated, the new image is uploaded first. The
database is updated with the new Cloudinary information, and the
previous Cloudinary image is removed when appropriate.

This avoids storing product image files directly on the application
server.

------------------------------------------------------------------------

# Shopping Cart

Authenticated customers can:

-   Add products to their cart
-   Increase quantities
-   Decrease quantities
-   Enter quantities directly
-   Remove products
-   View their cart

Cart ownership is enforced using the authenticated user's ID.

The database also protects relationships using foreign keys.

------------------------------------------------------------------------

# Checkout and Orders

The checkout system creates orders and handles stock changes using
PostgreSQL transactions.

The order process includes:

``` text
Cart
 ↓
Checkout
 ↓
Order creation
 ↓
Stock reduction
 ↓
Payment
 ↓
Order confirmation
```

Transactions help ensure that related database operations succeed or
fail together.

Customers can view their own orders and order details.

Order ownership checks prevent users from accessing other customers'
orders.

------------------------------------------------------------------------

# Order Cancellation

Customers can cancel eligible orders.

Cancellation logic uses a shared transaction so that related database
changes remain consistent.

The cancellation process also handles the appropriate
stock/payment/order state changes defined by the application.

------------------------------------------------------------------------

# Wishlist

Authenticated customers can manage a personal wishlist.

The wishlist system uses:

-   `wishlists`
-   `wishlist_items`

The database enforces uniqueness for wishlist items so the same product
cannot be added repeatedly to the same wishlist.

------------------------------------------------------------------------

# Payments

The project integrates KPay for payment processing.

The payment flow includes:

-   Payment initiation
-   Payment status checking
-   Payment status polling
-   Webhook handling

The KPay webhook route is registered before the global JSON body parser
because webhook handling requires the request body to be processed
correctly for signature verification.

Payment-related routes are organized under:

``` text
/api/v1/payments
```

The webhook endpoint is:

``` text
/api/v1/webhooks/kpay
```

------------------------------------------------------------------------

# Admin Dashboard

The admin dashboard provides protected management functionality for the
application.

Admin sections include:

-   Dashboard
-   Products
-   Orders
-   Customers
-   Categories
-   Brands
-   Payments
-   Shipment
-   Analytics

The admin interface also includes responsive sidebar behavior for
tablets.

Very small phone screens display a message recommending a tablet or
larger screen for the admin experience.

------------------------------------------------------------------------

# Database

The application uses PostgreSQL.

The production database is hosted on Neon.

The database contains tables for areas including:

-   Users
-   Products
-   Categories
-   Brands
-   Carts
-   Orders
-   Payments
-   Shipments
-   Wishlists
-   Wishlist items
-   And related application data

The database schema is available in:

``` text
sql/schema.sql
```

The application connects to PostgreSQL through a connection pool.

Production uses the `DATABASE_URL` environment variable.

------------------------------------------------------------------------

# API Structure

The API uses the following base URL:

``` text
/api/v1
```

Main route groups include:

``` text
/api/v1/users
/api/v1/products
/api/v1/cart
/api/v1/payments
/api/v1/wishlist
/api/v1/shipments
/api/v1/categories
/api/v1/brands
/api/v1/webhooks/kpay
```

Additional order, dashboard, customer, and analytics routes are also
registered under the API version.

------------------------------------------------------------------------

# Security

The project includes several security measures:

-   JWT authentication
-   Password hashing with bcrypt
-   Role-based authorization
-   Request validation
-   Rate limiting for authentication
-   Helmet security headers
-   CORS configuration
-   PostgreSQL parameterized queries
-   Ownership checks
-   Environment variables for secrets
-   File type validation for uploaded images
-   File size limits for uploads

Secrets and environment variables are not committed to the Git
repository.

------------------------------------------------------------------------

# Image Upload Validation

Product image uploads are restricted to:

``` text
JPEG
PNG
WebP
```

The application validates:

1.  The uploaded MIME type
2.  The actual file type from the file buffer
3.  The maximum file size

The current maximum upload size is:

``` text
5 MB
```

------------------------------------------------------------------------

# Environment Variables

The application requires environment variables for local development and
production.

Example:

``` env
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration

KPAY_API_KEY=your_kpay_api_key
KPAY_SECRET_KEY=your_kpay_secret_key
KPAY_WEBHOOK_SECRET=your_kpay_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Do not copy real credentials into `.env` examples or commit them to Git.

The `.env` file is excluded through `.gitignore`.

------------------------------------------------------------------------

# Local Development

## 1. Clone the repository

``` bash
git clone https://github.com/Fokochristian/E-COMMERCE-FULLSTACK-PROJECT.git
```

Then enter the project directory:

``` bash
cd E-COMMERCE-FULLSTACK-PROJECT
```

## 2. Install dependencies

``` bash
npm install
```

## 3. Configure environment variables

Create a `.env` file in the project root and provide the required
values.

## 4. Configure PostgreSQL

Create a PostgreSQL database and configure the required connection
string.

The database schema can be found in:

``` text
sql/schema.sql
```

## 5. Start the backend

``` bash
node app.js
```

The backend listens on the port defined by `PORT`.

For local development, the API is configured to run on port `5000`.

## 6. Run the frontend

The frontend is made of static HTML, CSS, and JavaScript files.

During development, the frontend can be served with a static development
server such as VS Code Live Server.

The local frontend used during development runs on:

``` text
http://127.0.0.1:5500
```

The backend runs separately.

------------------------------------------------------------------------

# Production Deployment

The application is deployed using multiple services.

## Frontend --- Cloudflare Pages

The static frontend is deployed through Cloudflare Pages.

Cloudflare builds directly from the GitHub repository and publishes the:

``` text
frontend
```

directory.

Live frontend:

https://e-commerce-fullstack-project.pages.dev/

## Backend --- Render

The Express API is deployed as a Render Web Service.

Render runs:

``` bash
npm install
```

during the build process and:

``` bash
node app.js
```

as the start command.

Live backend:

https://e-commerce-api-nux3.onrender.com/

## Database --- Neon

The production PostgreSQL database is hosted on Neon.

The backend connects to Neon using:

``` env
DATABASE_URL
```

## Images --- Cloudinary

Product images are stored and delivered through Cloudinary.

------------------------------------------------------------------------

# CORS

The backend allows requests from the production frontend as well as the
local development frontend.

Configured origins include:

``` text
http://127.0.0.1:5500
https://e-commerce-fullstack-project.pages.dev
```

------------------------------------------------------------------------

# Frontend API Configuration

The frontend communicates with the backend through Axios.

The production API base URL is:

``` text
https://e-commerce-api-nux3.onrender.com/api/v1
```

The API configuration is located in:

``` text
frontend/js/api.js
```

------------------------------------------------------------------------

# Responsive Design

The customer-facing application is responsive across desktop and mobile
layouts.

The customer navigation changes depending on screen size.

Desktop navigation includes:

``` text
Store
Search
Cart
Wishlist
My Orders
Dashboard
Logout
```

On mobile, the navigation collapses into a menu.

The admin dashboard also includes responsive sidebar behavior for
tablet-sized screens.

------------------------------------------------------------------------

# Error Handling

The backend uses centralized error handling middleware.

The project also includes:

-   Custom error classes
-   HTTP status codes
-   Validation errors
-   Authentication errors
-   Authorization errors
-   Database error handling
-   Upload errors
-   404 API responses

A global frontend 404 page is also included.

------------------------------------------------------------------------

# Loading States

The application includes loading feedback for important operations.

Examples include:

-   Store product loading spinner
-   Admin product save button spinner
-   Product management loading states
-   Other asynchronous UI states

The goal is to provide feedback instead of leaving the user wondering
whether an operation is still running.

------------------------------------------------------------------------

# Key Engineering Concepts Practiced

This project was built as a practical learning project and covers
several important full-stack concepts:

-   REST API development
-   Express routing
-   MVC-style separation
-   Layered backend architecture
-   PostgreSQL database design
-   SQL relationships
-   Foreign keys
-   Transactions
-   Authentication
-   Authorization
-   JWT
-   Password hashing
-   Request validation
-   Error handling
-   Rate limiting
-   CORS
-   Security headers
-   File uploads
-   Cloud storage
-   External API integration
-   Webhooks
-   Frontend/backend communication
-   Responsive UI development
-   Production deployment
-   Environment variables
-   Git and GitHub
-   Cloud-based database hosting

------------------------------------------------------------------------

# Deployment Architecture Summary

``` text
                         USERS
                           |
                           v
                +----------------------+
                |   Cloudflare Pages   |
                |      Frontend        |
                |   HTML/CSS/JS/Axios  |
                +----------+-----------+
                           |
                           | HTTPS API Requests
                           v
                +----------------------+
                |        Render        |
                |     Express API      |
                +----+------------+----+
                     |            |
                     |            |
                     v            v
          +----------------+   +----------------+
          |     Neon       |   |   Cloudinary   |
          |   PostgreSQL   |   | Product Images |
          +----------------+   +----------------+
                     |
                     v
                +-----------+
                |   KPay    |
                | Payments  |
                +-----------+
```

------------------------------------------------------------------------

# Project Status

The application is currently deployed and operational.

Completed areas include:

-   Customer storefront
-   Authentication
-   Product browsing
-   Search and filtering
-   Pagination
-   Product details
-   Shopping cart
-   Checkout
-   Payments
-   Orders
-   Order cancellation
-   Wishlist
-   Admin dashboard
-   Product management
-   Category management
-   Brand management
-   Customer management
-   Payment management
-   Shipment management
-   Analytics
-   Responsive customer UI
-   Responsive admin layout
-   Cloudinary image storage
-   Neon production database
-   Render API deployment
-   Cloudflare Pages frontend deployment

------------------------------------------------------------------------

# Future Improvements

Possible future improvements include:

-   Additional UI/visual polish
-   Customer product reviews, if required
-   Additional payment functionality such as refund support
-   More advanced automated testing
-   CI/CD improvements
-   More detailed monitoring and logging
-   Additional performance optimization

These are intentionally left as future improvements rather than
requirements for the current deployed version.

------------------------------------------------------------------------

# Author

**Foko Christian**

Software Engineering Student\
Cameroon

This project was built as a practical full-stack learning and portfolio
project with the goal of developing real-world software engineering and
freelance development skills.
