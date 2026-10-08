const API_BASE_URL = "https://e-commerce-api-nux3.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/users/login")
    ) {
      localStorage.removeItem("token");

      const isAdminPage = window.location.pathname.includes("/admin/");

      if (isAdminPage) {
        window.location.href = "../login.html";
      } else {
        window.location.href = "login.html";
      }
    }

    return Promise.reject(error);
  },
);

// Get All Products Feature
const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

// Get Single Product Feature
const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

// Register Feature
const registerUser = async (firstName, lastName, email, password) => {
  const response = await api.post("/users/register", {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
  });

  return response.data;
};

// Login Feature
const loginUser = async (email, password) => {
  const response = await api.post("/users/login", {
    email,
    password,
  });

  return response.data;
};

// Get Cart Feature
const getcart = async () => {
  const response = await api.get("/cart");

  return response.data;
};

const addToCart = async (productId, quantity) => {
  const response = await api.post("/cart", {
    productId,
    quantity,
  });

  return response.data;
};

const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.patch(`/cart/items/${cartItemId}`, {
    quantity,
  });

  return response.data;
};

const removeCartItem = async (cartItemId) => {
  const response = await api.delete(`/cart/items/${cartItemId}`);

  return response.data;
};

// Wishlist Features
const getWishlist = async () => {
  const response = await api.get("/wishlist");

  return response.data;
};

const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);

  return response.data;
};

const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);

  return response.data;
};

// Checkout Features
const checkout = async (recipientName, phoneNumber, address) => {
  const response = await api.post("/orders/checkout", {
    recipient_name: recipientName,
    phoneNumber,
    address,
  });

  return response.data;
};

const getOrders = async () => {
  const response = await api.get("/orders");

  return response.data;
};

const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
};

const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/cancel/${orderId}`);

  return response.data;
};

// Categories Filter Feature
const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

// Brand Filter Feature
const getBrands = async () => {
  const response = await api.get("/brands");

  return response.data;
};

// Payment Feature
const createPayment = async (orderId, paymentMethod, phoneNumber) => {
  const response = await api.post("/payments", {
    orderId,
    paymentMethod,
    phoneNumber,
  });

  return response.data;
};

// ADMIN FEATURES
const getDashboardData = async () => {
  const response = await api.get("/admin/dashboard");

  return response.data;
};

const getAdminProducts = async (params = {}) => {
  const response = await api.get("/products/admin", { params });

  return response.data;
};

const getAdminProduct = async (productId) => {
  const response = await api.get(`/products/admin/${productId}`);

  return response.data;
};

const createProduct = async (productData) => {
  const response = await api.post("/products/admin", productData);

  return response.data;
};

const updateProduct = async (productId, productData) => {
  const response = await api.patch(`/products/admin/${productId}`, productData);

  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/admin/${productId}`);

  return response.data;
};

const getAdminCategories = async () => {
  const response = await api.get("/categories/admin");

  return response.data;
};

const createCategory = async (name) => {
  const response = await api.post("/categories/admin", {
    name,
  });

  return response.data;
};

const updateCategory = async (categoryId, name) => {
  const response = await api.patch(`/categories/admin/${categoryId}`, {
    name,
  });

  return response.data;
};

const getAdminBrands = async () => {
  const response = await api.get("/brands/admin");

  return response.data;
};

const createBrand = async (name) => {
  const response = await api.post("/brands/admin", {
    name,
  });

  return response.data;
};

const updateBrand = async (brandId, name) => {
  const response = await api.patch(`/brands/admin/${brandId}`, {
    name,
  });

  return response.data;
};

const restoreProduct = async (productId) => {
  const response = await api.patch(`/products/admin/${productId}/restore`);

  return response.data;
};

const getAdminOrders = async (params = {}) => {
  const response = await api.get("/admin/orders", {
    params,
  });

  return response.data;
};

const getAdminOrder = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);

  return response.data;
};

const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/admin/orders/${orderId}`, {
    status,
  });

  return response.data;
};

const getAdminCustomers = async (params = {}) => {
  const response = await api.get("/admin/customers", {
    params,
  });

  return response.data;
};

const getAdminPayments = async (params = {}) => {
  const response = await api.get("/payments/admin", {
    params,
  });

  return response.data;
};

const getAdminShipments = async (params = {}) => {
  const response = await api.get("/shipments/admin", {
    params,
  });

  return response.data;
};

const updateShipmentStatus = async (shipmentId, status) => {
  const response = await api.patch(`/shipments/status/${shipmentId}`, {
    status,
  });

  return response.data;
};

const getAdminAnalytics = async (params = {}) => {
  const response = await api.get("/analytics/admin", {
    params,
  });

  return response.data;
};

export {
  getProducts,
  getProductById,
  loginUser,
  registerUser,
  getcart,
  addToCart,
  updateCartItem,
  removeCartItem,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkout,
  createPayment,
  getOrderById,
  cancelOrder,
  getOrders,
  getCategories,
  createCategory,
  updateCategory,
  getBrands,
  createBrand,
  updateBrand,
  getDashboardData,
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  getAdminBrands,
  restoreProduct,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  getAdminCustomers,
  getAdminPayments,
  getAdminShipments,
  updateShipmentStatus,
  getAdminAnalytics
};
