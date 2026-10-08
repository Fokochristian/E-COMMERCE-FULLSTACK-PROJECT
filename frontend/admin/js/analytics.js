import { requireAuth, isAdmin, logout } from "../../js/auth.js"
import { getAdminAnalytics } from "../../js/api.js"

let revenueChart = null
let orderStatusChart = null
let topProductsChart = null

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

    const totalRevenue = document.querySelector("#total-revenue")
    const totalOrders = document.querySelector("#total-orders")
    const unitsSold = document.querySelector("#units-sold")
    const averageOrderValue = document.querySelector("#average-order-value")

    if (totalRevenue) {
        animateNumber(
            totalRevenue,
            Number(overview.total_revenue),
            " FCFA"
        )
    }

    if (totalOrders) {
        animateNumber(
            totalOrders,
            Number(overview.total_orders)
        )
    }

    if (unitsSold) {
        animateNumber(
            unitsSold,
            Number(overview.units_sold)
        )
    }

    if (averageOrderValue) {
        animateNumber(
            averageOrderValue,
            Number(overview.average_order_value),
            " FCFA"
        )
    }
}

const displayRevenueChart = (revenueData) => {
    const canvas = document.querySelector("#revenue-chart")

    if (!canvas) return

    if (revenueChart) {
        revenueChart.destroy()
    }

    revenueChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: revenueData.map((item) => {
                return new Date(item.date).toLocaleDateString()
            }),
            datasets: [
                {
                    label: "Revenue",
                    data: revenueData.map((item) => {
                        return Number(item.revenue)
                    }),
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    })
}

const displayOrderStatusChart = (statusData) => {
    const canvas = document.querySelector("#order-status-chart")

    if (!canvas) return

    if (orderStatusChart) {
        orderStatusChart.destroy()
    }

    orderStatusChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: statusData.map((item) => item.status),
            datasets: [
                {
                    data: statusData.map((item) => {
                        return Number(item.count)
                    })
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    })
}

const displayTopProductsChart = (products) => {
    const canvas = document.querySelector("#top-products-chart")

    if (!canvas) return

    if (topProductsChart) {
        topProductsChart.destroy()
    }

    topProductsChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: products.map((product) => product.name),
            datasets: [
                {
                    label: "Units Sold",
                    data: products.map((product) => {
                        return Number(product.units_sold)
                    })
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    })
}

const getAnalyticsFilters = () => {
    const filterForm = document.querySelector("#analytics-filter-form")

    if (!filterForm) return {}

    const formData = new FormData(filterForm)

    return {
        startDate: formData.get("startDate") || undefined,
        endDate: formData.get("endDate") || undefined
    }
}


const showAnalyticsSkeletons = () => {
    const overviewCards = document.querySelectorAll(
        ".analytics-overview-card"
    )

    const chartSections = document.querySelectorAll(
        ".analytics-chart-section"
    )

    overviewCards.forEach((card) => {
        card.classList.add("loading")
    })

    chartSections.forEach((section) => {
        section.classList.add("loading")
    })
}


const hideAnalyticsSkeletons = () => {
    const overviewCards = document.querySelectorAll(
        ".analytics-overview-card"
    )

    const chartSections = document.querySelectorAll(
        ".analytics-chart-section"
    )

    overviewCards.forEach((card) => {
        card.classList.remove("loading")
    })

    chartSections.forEach((section) => {
        section.classList.remove("loading")
    })
}


const loadAnalytics = async () => {

    showAnalyticsSkeletons()

    const startTime = performance.now()

    const filters = getAnalyticsFilters()

    try {

        const data = await getAdminAnalytics(filters)


        const elapsedTime = performance.now() - startTime

        const minimumLoadingTime = 800

        const remainingTime = minimumLoadingTime - elapsedTime


        if (remainingTime > 0) {

            await new Promise((resolve) => {
                setTimeout(resolve, remainingTime)
            })

        }


        displayOverview(data.overview)

        displayRevenueChart(data.revenueOverTime)

        displayOrderStatusChart(data.orderStatusBreakdown)

        displayTopProductsChart(data.topSellingProducts)


        hideAnalyticsSkeletons()

    } catch (error) {

        hideAnalyticsSkeletons()

        console.error(
            "Failed to load analytics:", error
        )

        window.alert("Failed to load analytics.")
    }
}



const setupAnalyticsFilters = () => {
    const filterForm = document.querySelector("#analytics-filter-form")
    const resetButton = document.querySelector("#reset-analytics-filters")

    if (filterForm) {
        filterForm.addEventListener("submit", async (event) => {
            event.preventDefault()

            try {
                await loadAnalytics()
            } catch (error) {
                console.error("Failed to load analytics:", error)

                const message =
                    error.response?.data?.message ||
                    "Failed to load analytics."

                window.alert(message)
            }
        })
    }

    if (resetButton) {
        resetButton.addEventListener("click", async () => {
            filterForm.reset()

            try {
                await loadAnalytics()
            } catch (error) {
                console.error("Failed to load analytics:", error)

                const message =
                    error.response?.data?.message ||
                    "Failed to load analytics."

                window.alert(message)
            }
        })
    }
}

const initializeAnalyticsPage = async () => {
    projectAdminPage()
    setupLogout()
    setupAnalyticsFilters()

    try {
        await loadAnalytics()
    } catch (error) {
        console.error("Failed to load analytics:", error)

        const message =
            error.response?.data?.message ||
            "Failed to load analytics."

        window.alert(message)
    }
}

initializeAnalyticsPage()