import { requireAuth, isAdmin, logout } from "../../js/auth.js"
import { getAdminShipments, updateShipmentStatus } from "../../js/api.js"


const SHIPMENTS_PER_PAGE = 25

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

    const totalShipments = document.querySelector("#total-shipments")
    const pendingShipments = document.querySelector("#pending-shipments")
    const shippedShipments = document.querySelector("#shipped-shipments")
    const deliveredShipments = document.querySelector("#delivered-shipments")
    const cancelledShipments = document.querySelector("#cancelled-shipments")

    if (totalShipments) {
        animateNumber(
            totalShipments,
            Number(overview.total)
        )
    }

    if (pendingShipments) {
        animateNumber(
            pendingShipments,
            Number(overview.pending)
        )
    }

    if (shippedShipments) {
        animateNumber(
            shippedShipments,
            Number(overview.shipped)
        )
    }

    if (deliveredShipments) {
        animateNumber(
            deliveredShipments,
            Number(overview.delivered)
        )
    }

    if (cancelledShipments) {
        animateNumber(
            cancelledShipments,
            Number(overview.cancelled)
        )
    }
}


const displayShipments = (shipments) => {
    const shipmentsList = document.querySelector("#shipments-list")

    if (!shipmentsList) return

    if (shipments.length === 0) {
        shipmentsList.innerHTML = `
            <tr>
                <td colspan="9">No shipments found.</td>
            </tr>
        `

        return
    }

    shipmentsList.innerHTML = shipments.map((shipment) => `
        <tr>

            <td>
                #${shipment.id}
            </td>

            <td>
                #${shipment.order_id}
            </td>

            <td>
                ${shipment.recipient_name}
            </td>

            <td>
                ${shipment.phonenumber}
            </td>

            <td>
                ${shipment.address}
            </td>

            <td>
                ${Number(shipment.shipping_cost).toLocaleString()} FCFA
            </td>

            <td>
                <span class="shipment-status ${shipment.status}">
                    ${shipment.status}
                </span>
            </td>

            <td>
                ${new Date(shipment.created_at).toLocaleDateString()}
            </td>

            <td>
                ${
                    shipment.status === "pending"
                        ? `
                            <button
                                type="button"
                                class="shipment-action-button update-shipment-action"
                                data-shipment-id="${shipment.id}"
                                data-next-status="shipped"
                            >
                                Mark Shipped
                            </button>
                        `
                        : shipment.status === "shipped"
                            ? `
                                <button
                                    type="button"
                                    class="shipment-action-button update-shipment-action"
                                    data-shipment-id="${shipment.id}"
                                    data-next-status="delivered"
                                >
                                    Mark Delivered
                                </button>
                            `
                            : ""
                }
            </td>

        </tr>
    `).join("")

    setupShipmentStatusActions()
}


const updateShipmentsCount = (total, page, limit, shipments) => {
    const startElement = document.querySelector("#shipments-start")
    const endElement = document.querySelector("#shipments-end")
    const totalElement = document.querySelector("#shipments-total")

    if (!startElement || !endElement || !totalElement) return

    if (total === 0) {
        startElement.textContent = "0"
        endElement.textContent = "0"
        totalElement.textContent = "0"

        return
    }

    const start = (page - 1) * limit + 1
    const end = start + shipments.length - 1

    startElement.textContent = start
    endElement.textContent = end
    totalElement.textContent = total
}


const renderPagination = (total, page, limit) => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")
    const currentPageDisplay = document.querySelector("#current-page-display")

    if (!previousButton || !nextButton || !currentPageDisplay) return

    currentPage = page

    totalPages = Math.ceil(total / limit)

    if (totalPages === 0) {
        totalPages = 1
    }

    previousButton.disabled = currentPage === 1

    nextButton.disabled = currentPage === totalPages

    currentPageDisplay.textContent = `${currentPage} / ${totalPages}`
}


const setupShipmentStatusActions = () => {
    const actionButtons = document.querySelectorAll(".update-shipment-action")

    actionButtons.forEach((button) => {
        button.addEventListener("click", async () => {

            const shipmentId = button.dataset.shipmentId
            const nextStatus = button.dataset.nextStatus

            const confirmed = window.confirm(
                `Are you sure you want to mark shipment #${shipmentId} as ${nextStatus}?`
            )

            if (!confirmed) return

            try {
                await updateShipmentStatus(
                    shipmentId,
                    nextStatus
                )

                await loadShipments(currentPage)

            } catch (error) {
                console.error(
                    "Failed to update shipment status:",
                    error
                )

                const message = error.response?.data?.message || " Failed to update shipment status."

                window.alert(message)
            }
        })
    })
}


const setupPaginationControls = () => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")

    if (previousButton) {
        previousButton.addEventListener("click", () => {

            if (currentPage > 1) {
                loadShipments(currentPage - 1)
            }

        })
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {

            if (currentPage < totalPages) {
                loadShipments(currentPage + 1)
            }

        })
    }
}


const getShipmentFilters = () => {
    const filterForm = document.querySelector("#shipment-filter-form")

    if (!filterForm) return {}

    const formData = new FormData(filterForm)

    return {
        status: formData.get("status") || undefined
    }
}

const showShipmentSkeletons = () => {
    const overviewCards = document.querySelectorAll(
        ".shipment-overview-card"
    )

    const shipmentTableSection = document.querySelector(
        ".shipment-table-section"
    )

    overviewCards.forEach((card) => {
        card.classList.add("loading")
    })

    if (shipmentTableSection) {
        shipmentTableSection.classList.add("loading")
    }
}


const hideShipmentSkeletons = () => {
    const overviewCards = document.querySelectorAll(
        ".shipment-overview-card"
    )

    const shipmentTableSection = document.querySelector(
        ".shipment-table-section"
    )

    overviewCards.forEach((card) => {
        card.classList.remove("loading")
    })

    if (shipmentTableSection) {
        shipmentTableSection.classList.remove("loading")
    }
}


const loadShipments = async (page = 1) => {

    showShipmentSkeletons()

    const startTime = performance.now()

    const filters = getShipmentFilters()

    const params = {
        ...filters,
        page,
        limit: SHIPMENTS_PER_PAGE
    }

    try {
        const data = await getAdminShipments(params)

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        displayOverview(data.overview)

        displayShipments(data.shipments)

        updateShipmentsCount(
            data.total,
            page,
            SHIPMENTS_PER_PAGE,
            data.shipments
        )

        renderPagination(
            data.total,
            page,
            SHIPMENTS_PER_PAGE
        )

        hideShipmentSkeletons()

    } catch (error) {
        hideShipmentSkeletons()

        console.error(
            "Failed to load shipments:", error
        )

        window.alert("Failed to load shipments")

        
    }
}

const setupShipmentFilters = () => {
    const filterForm = document.querySelector("#shipment-filter-form")
    const resetButton = document.querySelector("#reset-shipment-filters")

    if (filterForm) {
        filterForm.addEventListener("submit", (event) => {
            event.preventDefault()

            loadShipments(1)
        })
    }

    if (resetButton) {
        resetButton.addEventListener("click", () => {

            filterForm.reset()

            loadShipments(1)

        })
    }
}


const initializeShipmentPage = async () => {

    projectAdminPage()

    setupLogout()
    setupPaginationControls()
    setupShipmentFilters()

    await loadShipments(1)
}


initializeShipmentPage()