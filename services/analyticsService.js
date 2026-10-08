const {
    getAnalyticsOverview,
    getRevenueOverTime,
    getOrderStatusBreakdown,
    getTopSellingProducts
} = require("../models/analyticsModel")

const getAnalytics = async (startDate, endDate) => {
    const [
        overview,
        revenueOverTime,
        orderStatusBreakdown,
        topSellingProducts
    ] = await Promise.all([
        getAnalyticsOverview(startDate, endDate),
        getRevenueOverTime(startDate, endDate),
        getOrderStatusBreakdown(startDate, endDate),
        getTopSellingProducts(startDate, endDate)
    ])

    return {
        overview,
        revenueOverTime,
        orderStatusBreakdown,
        topSellingProducts
    }
}

// PROMISE ALL TO HANDLE REQUEST ON THE DB SIMULTANOUSLY

module.exports = {
    getAnalytics
}