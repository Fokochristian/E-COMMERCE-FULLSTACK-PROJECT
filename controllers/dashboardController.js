const {getDashboardData} = require("../services/dashboardService")
const {StatusCodes} = require("http-status-codes")

const getDashboard = async (req, res) => {
    const {metrics, recentOrders} = await getDashboardData()

    return res.status(StatusCodes.OK).json({success: true, dashboard: metrics, recentOrders})
}

module.exports = {getDashboard}