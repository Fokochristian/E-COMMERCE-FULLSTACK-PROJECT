import { requireAuth, isAdmin, logout } from "../../js/auth.js"
import { getAdminOrders, getAdminOrder, updateAdminOrderStatus } from "../../js/api.js"


const ORDERS_PER_PAGE = 25

let currentPage = 1
let totalPages = 1


const projectAdminPage = () => {
    requireAuth()

    if (!isAdmin()) {
        window.location.href = "unauthorized.html"
        return
    }

    document.body.classList.add("authorized")
}


const setupLogout = () => {
    const logoutButton = document.querySelector("#admin-logout-button")

    if (!logoutButton) return

    logoutButton.addEventListener("click", logout)
}


const animateNumber = (element, target, suffix = "", duration = 1000) => {
    const startTime = performance.now()

    const updateNumber = (currentTime) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.min(elapsedTime / duration, 1)

        const currentValue = Math.floor(target * progress)

        element.textContent = `${currentValue.toLocaleString()}${suffix}`

        if (progress < 1) {
            requestAnimationFrame(updateNumber)
        }
    }

    requestAnimationFrame(updateNumber)
}

const displayOverview = (overview) => {
    if (!overview) return

    const totalOrders = document.querySelector("#total-orders")
    const pendingOrders = document.querySelector("#pending-orders")
    const paidOrders = document.querySelector("#paid-orders")
    const shippedOrders = document.querySelector("#shipped-orders")
    const deliveredOrders = document.querySelector("#delivered-orders")
    const cancelledOrders = document.querySelector("#cancelled-orders")

    if (totalOrders) {
        animateNumber(totalOrders, Number(overview.total))
    }

    if (pendingOrders) {
        animateNumber(pendingOrders, Number(overview.pending))
    }

    if (paidOrders) {
        animateNumber(paidOrders, Number(overview.paid))
    }

    if (shippedOrders) {
        animateNumber(shippedOrders, Number(overview.shipped))
    }

    if (deliveredOrders) {
        animateNumber(deliveredOrders, Number(overview.delivered))
    }

    if (cancelledOrders) {
        animateNumber(cancelledOrders, Number(overview.cancelled))
    }
}

const displayOrders = (orders) => {
    const ordersList = document.querySelector("#orders-list")

    if (!ordersList) return

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <tr>
                <td colspan="6">No orders found.</td>
            </tr>
        `

        return
    }

    ordersList.innerHTML = orders.map((order) => `
        <tr>
            <td>
                #${order.id}
            </td>

            <td>
                ${order.first_name} ${order.last_name}
            </td>

            <td>
                ${Number(order.total_amount).toLocaleString()} FCFA
            </td>

            <td>
                <span class="order-status ${order.status}">
                    ${order.status}
                </span>
            </td>

            <td>
                ${new Date(order.created_at).toLocaleDateString()}
            </td>

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
        </tr>
    `).join("")

    setupOrderActionMenus()
    setupViewOrderActions()
    setupCancelOrderActions()
}


const updateOrdersCount = (total, page, limit, orders) => {
    const startElement = document.querySelector("#orders-start")
    const endElement = document.querySelector("#orders-end")
    const totalElement = document.querySelector("#orders-total")

    if (!startElement || !endElement || !totalElement) return

    if (total === 0) {
        startElement.textContent = "0"
        endElement.textContent = "0"
        totalElement.textContent = "0"

        return
    }

    const start = (page - 1) * limit + 1
    const end = start + orders.length - 1

    startElement.textContent = start
    endElement.textContent = end
    totalElement.textContent = total
}


const renderPagination = (pagination) => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")
    const currentPageDisplay = document.querySelector("#current-page-display")

    if (!previousButton || !nextButton || !currentPageDisplay) return

    currentPage = pagination.page
    totalPages = pagination.totalPages

    previousButton.disabled = currentPage === 1
    nextButton.disabled = currentPage === totalPages || totalPages === 0

    currentPageDisplay.textContent = `${currentPage} / ${totalPages}`
}


const setupOrderActionMenus = () => {
    const actionButtons = document.querySelectorAll(".product-actions-button")

    actionButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation()

            const menu = button.nextElementSibling

            document
                .querySelectorAll(".product-actions-menu")
                .forEach((otherMenu) => {
                    if (otherMenu !== menu) {
                        otherMenu.hidden = true
                    }
                })

            menu.hidden = !menu.hidden
        })
    })
}

const displayOrderDetails = (order) => {
    const orderDetails = document.querySelector("#order-details")

    if (!orderDetails) return

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
                ${order.status}
            </p>

            <p>
                <strong>Total:</strong>
                ${Number(order.total_amount).toLocaleString()} FCFA
            </p>

            <p>
                <strong>Date:</strong>
                ${new Date(order.created_at).toLocaleString()}
            </p>

        </div>

        <div class="order-items">

            <h3>Order Items</h3>

            ${order.items.map((item) => `
                <div class="order-item">

                    <img
                        src="${item.image_path}"
                        alt="${item.product_name}"
                    >

                    <div class="order-item-info">

                        <p>
                            <strong>${item.product_name}</strong>
                        </p>

                        <p>
                            Quantity: ${item.quantity}
                        </p>

                        <p>
                            Price: ${Number(item.price_at_purchase).toLocaleString()} FCFA
                        </p>

                    </div>

                </div>
            `).join("")}

        </div>
    `
}


const setupViewOrderActions = () => {
    const viewButtons = document.querySelectorAll(".view-order-action")
    const orderModal = document.querySelector("#order-modal")

    if (!orderModal) return

    viewButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.orderId

            try {
                const data = await getAdminOrder(orderId)

                const order = data.order.order

                displayOrderDetails(order)

                orderModal.hidden = false

            } catch (error) {
                console.error("Failed to load order:", error)
                window.alert("failed to load order")
            }
        })
    })
}


const setupOrderModal = () => {
    const orderModal = document.querySelector("#order-modal")
    const closeOrderModal = document.querySelector("#close-order-modal")
    const orderModalOverlay = document.querySelector("#order-modal-overlay")

    if (!orderModal) return

    if (closeOrderModal) {
        closeOrderModal.addEventListener("click", () => {
            orderModal.hidden = true
        })
    }

    if (orderModalOverlay) {
        orderModalOverlay.addEventListener("click", () => {
            orderModal.hidden = true
        })
    }
}

const setupPaginationControls = () => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            if (currentPage > 1) {
                loadOrders(currentPage - 1)
            }
        })
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                loadOrders(currentPage + 1)
            }
        })
    }
}


const getOrderFilters = () => {
    const filterForm = document.querySelector("#order-filter-form")

    if (!filterForm) return {}

    const formData = new FormData(filterForm)

    return {
        status: formData.get("status") || undefined
    }
}

const showOrderSkeletons = () => {
    const overviewCards = document.querySelectorAll(".orders-overview-card")
    const ordersTableSection = document.querySelector(".orders-table-section")

    overviewCards.forEach((card) => {
        card.classList.add("loading")
    })

    if (ordersTableSection) {
        ordersTableSection.classList.add("loading")
    }
}

const hideOrderSkeletons = () => {
    const overviewCards = document.querySelectorAll(".orders-overview-card")
    const ordersTableSection = document.querySelector(".orders-table-section")

    overviewCards.forEach((card) => {
        card.classList.remove("loading")
    })

    if (ordersTableSection) {
        ordersTableSection.classList.remove("loading")
    }
}

const loadOrders = async (page = 1) => {
    showOrderSkeletons()

    const startTime = performance.now()

    try {
        const filters = getOrderFilters()

        const params = {
            ...filters,
            page,
            limit: ORDERS_PER_PAGE
        }

        const data = await getAdminOrders(params)

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        displayOverview(data.overview)
        displayOrders(data.orders)

        updateOrdersCount(
            data.pagination.total,
            data.pagination.page,
            data.pagination.limit,
            data.orders
        )

        renderPagination(data.pagination)

        hideOrderSkeletons()

    } catch (error) {
        hideOrderSkeletons()
        console.error("Failed to load orders:", error)

        window.alert("Failed to load orders")
    }
}

const setupOrderFilters = () => {
    const filterForm = document.querySelector("#order-filter-form")
    const resetButton = document.querySelector("#reset-order-filters")

    if (filterForm) {
        filterForm.addEventListener("submit", (event) => {
            event.preventDefault()

            loadOrders(1)
        })
    }

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            filterForm.reset()

            loadOrders(1)
        })
    }
}

const setupCancelOrderActions = () => {
    const cancelButtons = document.querySelectorAll(".cancel-order-action")

    cancelButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.orderId

            const confirmed = window.confirm(
                `Are you sure you want to cancel order #${orderId}?`
            )

            if (!confirmed) return

            try {
                await updateAdminOrderStatus(orderId, "cancelled")

                await loadOrders(currentPage)

            } catch (error) {
                console.error("Failed to cancel order:", error)

                window.alert("Failed to cancel order")
            }
        })
    })
}


document.addEventListener("click", () => {
    document
        .querySelectorAll(".product-actions-menu")
        .forEach((menu) => {
            menu.hidden = true
        })
})


const initializeOrdersPage = async () => {
    projectAdminPage()

    setupLogout()
    setupPaginationControls()
    setupOrderFilters()
    setupOrderModal()

    await loadOrders(1)
}


initializeOrdersPage()

