const { StatusCodes } = require("http-status-codes")
const { BadRequestError } = require("../errors/index")
const { getAnalytics } = require("../services/analyticsService")

const getAdminAnalytics = async (req, res) => {
    const {
        startDate = null,
        endDate = null
    } = req.query

    if (startDate && Number.isNaN(Date.parse(startDate))) {
        throw new BadRequestError("Invalid start date")
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
        throw new BadRequestError("Invalid end date")
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestError("Start date must be before end date")
    }

    const analytics = await getAnalytics(
        startDate,
        endDate
    )

    return res.status(StatusCodes.OK).json({
        success: true,
        ...analytics
    })
}

module.exports = {
    getAdminAnalytics
}