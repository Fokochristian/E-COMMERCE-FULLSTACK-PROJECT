const { StatusCodes } = require("http-status-codes")
const { getAllCustomers } = require("../models/customerModel")
const { BadRequestError } = require("../errors/index")

const getAllCustomersForAdmin = async (req, res) => {
    const {
        search,
        page = "1",
        limit = "25"
    } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new BadRequestError("Page must be a positive integer")
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
        throw new BadRequestError("Limit must be a positive integer")
    }

    const cleanSearch = search?.trim() || null

    const { customers, total } = await getAllCustomers(
        cleanSearch,
        pageNumber,
        limitNumber
    )

    const totalPages = Math.ceil(total / limitNumber)

    return res.status(StatusCodes.OK).json({
        success: true,
        customers,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages
        }
    })
}

module.exports = {
    getAllCustomersForAdmin
}