import { requireAuth, isAdmin, logout } from "../../js/auth.js"

import {
    getAdminPayments
} from "../../js/api.js"


const currentPage = 1
const limit = 25

let page = currentPage


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

const displayPaymentOverview = (overview) => {

    const totalPayments = document.querySelector("#total-payments")
    const pendingPayments = document.querySelector("#pending-payments")
    const successfulPayments = document.querySelector("#successful-payments")
    const failedPayments = document.querySelector("#failed-payments")

    if (totalPayments) {
        animateNumber(
            totalPayments,
            Number(overview.total)
        )
    }

    if (pendingPayments) {
        animateNumber(
            pendingPayments,
            Number(overview.pending)
        )
    }

    if (successfulPayments) {
        animateNumber(
            successfulPayments,
            Number(overview.successful)
        )
    }

    if (failedPayments) {
        animateNumber(
            failedPayments,
            Number(overview.failed)
        )
    }
}


const displayPayments = (payments) => {

    const paymentsList = document.querySelector("#payments-list")

    if (!paymentsList) return


    if (payments.length === 0) {

        paymentsList.innerHTML = `
            <tr>
                <td colspan="7">
                    No payments found.
                </td>
            </tr>
        `

        return
    }


    paymentsList.innerHTML = payments.map((payment) => {

        const customerName =
            `${payment.first_name} ${payment.last_name}`


        const createdAt =
            new Date(payment.created_at).toLocaleString()


        return `
            <tr>

                <td>
                    #${payment.id}
                </td>

                <td>
                    #${payment.order_id}
                </td>

                <td>
                    ${customerName}
                </td>

                <td>
                    ${payment.amount}
                </td>

                <td>
                    ${payment.payment_method || "—"}
                </td>

                <td>
                    <span class="payment-status ${payment.status}">
                        ${payment.status}
                    </span>
                </td>

                <td>
                    ${createdAt}
                </td>

            </tr>
        `

    }).join("")
}


const updatePagination = (total) => {

    const startElement = document.querySelector("#payments-start")
    const endElement = document.querySelector("#payments-end")
    const totalElement = document.querySelector("#payments-total")
    const currentPageDisplay =
        document.querySelector("#current-page-display")

    const previousButton =
        document.querySelector("#previous-page")

    const nextButton =
        document.querySelector("#next-page")


    const totalPages =
        Math.max(1, Math.ceil(total / limit))


    const start =
        total === 0
            ? 0
            : ((page - 1) * limit) + 1


    const end =
        Math.min(page * limit, total)


    if (startElement) {
        startElement.textContent = start
    }

    if (endElement) {
        endElement.textContent = end
    }

    if (totalElement) {
        totalElement.textContent = total
    }

    if (currentPageDisplay) {
        currentPageDisplay.textContent =
            `${page}/${totalPages}`
    }

    if (previousButton) {
        previousButton.disabled = page <= 1
    }

    if (nextButton) {
        nextButton.disabled = page >= totalPages
    }
}


const getPaymentFilters = () => {

    const status =
        document.querySelector("#payment-status")?.value || null

    const paymentMethod =
        document.querySelector("#payment-method")?.value || null

    const search =
        document.querySelector("#payment-search")?.value.trim() || null


    return {
        status,
        paymentMethod,
        search
    }
}

const showPaymentSkeletons = () => {
    const overviewCards = document.querySelectorAll(
        ".payments-overview-card"
    )

    const paymentsTableSection = document.querySelector(
        ".payments-table-section"
    )

    overviewCards.forEach((card) => {
        card.classList.add("loading")
    })

    if (paymentsTableSection) {
        paymentsTableSection.classList.add("loading")
    }
}

const hidePaymentSkeletons = () => {
    const overviewCards = document.querySelectorAll(
        ".payments-overview-card"
    )

    const paymentsTableSection = document.querySelector(
        ".payments-table-section"
    )

    overviewCards.forEach((card) => {
        card.classList.remove("loading")
    })

    if (paymentsTableSection) {
        paymentsTableSection.classList.remove("loading")
    }
}


const loadPayments = async () => {
    showPaymentSkeletons()

    const startTime = performance.now()

    const filters = getPaymentFilters()

    try {
        const data = await getAdminPayments({
            ...filters,
            page,
            limit
        })

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        displayPaymentOverview(data.overview)
        displayPayments(data.payments)
        updatePagination(data.total)

        hidePaymentSkeletons()

    } catch (error) {
        hidePaymentSkeletons()

        console.error(
            "Failed to load payments:",error
        )

        window.alert("Failed to load payments")

    }
}

const setupPaymentFilters = () => {

    const filterForm =
        document.querySelector("#payment-filter-form")

    if (!filterForm) return


    filterForm.addEventListener("submit", async (event) => {

        event.preventDefault()

        page = 1

        await loadPayments()
    })


    const resetButton =
        document.querySelector("#reset-payment-filters")

    if (!resetButton) return


    resetButton.addEventListener("click", async () => {

        filterForm.reset()

        page = 1

        await loadPayments()
    })
}


const setupPagination = () => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")

    if (previousButton) {
        previousButton.addEventListener("click", async () => {
            if (page <= 1) return

            page--
            await loadPayments()
        })
    }

    if (nextButton) {
        nextButton.addEventListener("click", async () => {
            if (nextButton.disabled) return

            const filters = getPaymentFilters()

            try {
                const data = await getAdminPayments({
                    ...filters,
                    page: page + 1,
                    limit
                })

                const totalPages = Math.max(
                    1,
                    Math.ceil(data.total / limit)
                )

                if (page < totalPages) {
                    page++

                    displayPaymentOverview(data.overview)
                    displayPayments(data.payments)
                    updatePagination(data.total)
                }
            } catch (error) {
                console.error(
                    "Failed to load next payments page:",
                    error
                )

                window.alert("Failed to load next payment page")
            }
        })
    }
}


const initializePaymentsPage = async () => {

    projectAdminPage()

    setupLogout()

    setupPaymentFilters()

    setupPagination()

    await loadPayments()
}


initializePaymentsPage()