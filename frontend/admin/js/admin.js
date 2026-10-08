import { requireAuth, isAdmin, logout } from "../../js/auth.js";
import {
  getDashboardData,
  getAdminOrder,
  updateAdminOrderStatus,
} from "../../js/api.js";

const projectAdminPage = () => {
  requireAuth();

  if (!isAdmin()) {
    window.location.href = "unauthorized.html";
    return;
  }

  document.body.classList.add("authorized");
};

const setActiveNavigation = () => {
  const currentPage = window.location.pathname.split("/").pop();

  const navigationLinks = document.querySelectorAll(".admin-nav-link");

  navigationLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

const setupLogout = () => {
  const logoutButton = document.querySelector("#admin-logout-button");

  if (!logoutButton) return;

  logoutButton.addEventListener("click", logout);
};

const displayOrderDetails = (order) => {
  const orderDetails = document.querySelector("#order-details");

  if (!orderDetails) return;

  orderDetails.innerHTML = `
        <div class="order-details-summary">
            <p>
                <strong>Order ID:</strong>
                #${order.id}
            </p>

            <p>
                <strong>Customer:</strong>
                ${order.first_name} ${order.last_name}
            </p>

            <p>
                <strong>Email:</strong>
                ${order.email}
            </p>

            <p>
                <strong>Status:</strong>
                <span class="order-status ${order.status}">
                    ${order.status}
                </span>
            </p>

            <p>
                <strong>Total:</strong>
                ${Number(order.total_amount).toLocaleString()} FCFA
            </p>

            <p>
                <strong>Date:</strong>
                ${new Date(order.created_at).toLocaleDateString()}
            </p>
        </div>

        <div class="order-items">
            <h3>Order Items</h3>

            ${order.items
              .map(
                (item) => `
                <div class="order-item">
                    <img
                        src="${item.image_path}"
                        alt="${item.product_name}"
                    >

                    <div class="order-item-info">
                        <h4>${item.product_name}</h4>

                        <p>
                            Quantity: ${item.quantity}
                        </p>

                        <p>
                            Price:
                            ${Number(item.price_at_purchase).toLocaleString()} FCFA
                        </p>
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
};

const animateNumber = (element, target, suffix = "", duration = 1000) => {
  const startTime = performance.now();

  const updateNumber = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const currentValue = Math.floor(target * progress);

    element.textContent = `${currentValue.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  };

  requestAnimationFrame(updateNumber);
};

const showDashboardSkeletons = () => {
    const metricCards = document.querySelectorAll(".dashboard-metric-card")
    const recentOrdersSection = document.querySelector(".dashboard-recent-orders")

    metricCards.forEach((card) => {
        card.classList.add("loading")
    })

    if (recentOrdersSection) {
        recentOrdersSection.classList.add("loading")
    }
}

const hideDashboardSkeletons = () => {
    const metricCards = document.querySelectorAll(".dashboard-metric-card")
    const recentOrdersSection = document.querySelector(".dashboard-recent-orders")

    metricCards.forEach((card) => {
        card.classList.remove("loading")
    })

    if (recentOrdersSection) {
        recentOrdersSection.classList.remove("loading")
    }
}
const loadDashboardData = async () => {
    showDashboardSkeletons()

    const startTime = performance.now()

    try {
        const data = await getDashboardData()

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        hideDashboardSkeletons()

        animateNumber(
            document.querySelector("#total-products"),
            Number(data.dashboard.total_products)
        )

        animateNumber(
            document.querySelector("#total-customers"),
            Number(data.dashboard.total_customers)
        )

        animateNumber(
            document.querySelector("#total-orders"),
            Number(data.dashboard.total_orders)
        )

        animateNumber(
            document.querySelector("#total-revenue"),
            Number(data.dashboard.total_revenue),
            " FCFA"
        )

        displayRecentOrders(data.recentOrders)
        setupRecentOrderActionMenus()
        setupViewOrderActions()
        setupCancelOrderActions()
    } catch (error) {
        hideDashboardSkeletons()
        console.error("Failed to load dashboard data:", error)

        window.alert("Failed to load dashboard")
    }
}

const displayRecentOrders = (orders) => {
  const recentOrdersList = document.querySelector("#recent-orders-list");

  if (!recentOrdersList) return;

  recentOrdersList.innerHTML = orders
    .map(
      (order) => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.first_name} ${order.last_name}</td>
            <td>${Number(order.total_amount).toLocaleString()} FCFA</td>
            <td>
                <span class="order-status ${order.status}">
                    ${order.status}
                </span>    
            </td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
           <td>
                <div class="product-actions">
                    <button
                        type="button"
                        class="product-actions-button"
                        aria-label="Order actions"
                    >
                        ⋮
                    </button>

                    <div class="product-actions-menu" hidden>
                        <button
                            type="button"
                            class="view-order-action"
                            data-order-id="${order.id}"
                        >
                            <i class="fa-solid fa-eye"></i>
                            View Order
                        </button>

                        ${
                          order.status === "pending" || order.status === "paid"
                            ? `
                                    <button
                                        type="button"
                                        class="cancel-order-action"
                                        data-order-id="${order.id}"
                                    >
                                        <i class="fa-solid fa-xmark"></i>
                                        Cancel Order
                                    </button>
                                `
                            : ""
                        }
                    </div>
                </div>
            </td>
        </tr>`,
    )
    .join("");
};

const setupRecentOrderActionMenus = () => {
  const actionButtons = document.querySelectorAll(".product-actions-button");

  actionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const menu = button.nextElementSibling;

      document
        .querySelectorAll(".product-actions-menu")
        .forEach((otherMenu) => {
          if (otherMenu !== menu) {
            otherMenu.hidden = true;
          }
        });

      menu.hidden = !menu.hidden;
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".product-actions-menu").forEach((menu) => {
      menu.hidden = true;
    });
  });
};

const setupViewOrderActions = () => {
  const viewButtons = document.querySelectorAll(".view-order-action");
  const orderModal = document.querySelector("#order-modal");

  if (!orderModal) return;

  viewButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const orderId = button.dataset.orderId;

      try {
        const data = await getAdminOrder(orderId);
        const order = data.order.order;

        displayOrderDetails(order);

        orderModal.hidden = false;
      } catch (error) {
        console.error("Failed to load order:", error);

        const message =
          error.response?.data?.message || "Failed to load order.";

        window.alert(message);
      }
    });
  });
};

const setupCancelOrderActions = () => {
  const cancelButtons = document.querySelectorAll(".cancel-order-action");

  cancelButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const orderId = button.dataset.orderId;

      const confirmed = window.confirm(
        `Are you sure you want to cancel order #${orderId}?`,
      );

      if (!confirmed) return;

      try {
        await updateAdminOrderStatus(orderId, "cancelled");

        await loadDashboardData();
      } catch (error) {
        console.error("Failed to cancel order:", error);

        const message =
          error.response?.data?.message || "Failed to cancel order.";

        window.alert(message);
      }
    });
  });
};

const setupOrderModal = () => {
  const orderModal = document.querySelector("#order-modal");
  const closeButton = document.querySelector("#close-order-modal");
  const overlay = document.querySelector("#order-modal-overlay");

  if (!orderModal) return;

  const closeModal = () => {
    orderModal.hidden = true;
  };

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }
};

setActiveNavigation();
projectAdminPage();
setupLogout();
setupOrderModal();
loadDashboardData();
