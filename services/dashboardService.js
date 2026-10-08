const {getDashboardMetrics,getRecentOrders} = require("../models/dashboardModel")


const getDashboardData = async () => {
    const metrics = await getDashboardMetrics()
    const recentOrders = await getRecentOrders()

    return {
        metrics,
        recentOrders
    }
}

module.exports = { getDashboardData }