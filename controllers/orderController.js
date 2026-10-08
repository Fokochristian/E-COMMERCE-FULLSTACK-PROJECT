const {placeOrder, getOrders:getOrdersInDB, getMyOrder:getMyOrderInDB, getAllOrdersAdmin, updateOrderStatusAdmin, cancelOrder:cancelOrderInDB, getOrderByAdmin} = require("../services/orderService")
const {StatusCodes} = require("http-status-codes")
const {validateOrderStatus, validateCheckout, validateOrderQuery} = require("../validators/orderValidator")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")
const { BadRequestError } = require("../errors/index")


const checkout = async (req, res) => {
    const userId = req.user.userId
    const {recipient_name, phoneNumber, address} = req.body || {}
    const validation = validateCheckout(req.body || {})

    if(!validation.valid) {
        throw new BadRequestError("validation failed",validation.errors)
    }

    const order = await placeOrder(userId, recipient_name, phoneNumber, address)

    return  res.status(StatusCodes.CREATED).json({success: true, message: "Order created successfully", order})
}

const getOrders = async (req, res) => {
    const userId = req.user.userId
    const orders = await getOrdersInDB(userId)

    return res.status(StatusCodes.OK).json({success: true, orders})
}

const getMyOrder = async (req, res) => {
    const userId = req.user.userId
    const {orderId} = req.params
    const validation = validatePositiveIntegerParam(orderId, "Order ID")

    if(!validation.valid) {
        throw new BadRequestError(validation.error)
    }

    const order = await getMyOrderInDB(userId, orderId)

    return res.status(StatusCodes.OK).json({success: true, order})
}

const getAllOrdersForAdmin = async (req, res) => {
    const validation = validateOrderQuery(req.query)

    if (!validation.valid) {
        throw new BadRequestError(
            validation.errors.join(", ")
        )
    }


    const {
        status,
        page = "1",
        limit = "25"
    } = req.query


    const cleanStatus = status || null

    const pageNumber = Number(page)
    const limitNumber = Number(limit)


    const { orders, total, overview } = await getAllOrdersAdmin(
        cleanStatus,
        pageNumber,
        limitNumber
    )


    const totalPages = Math.ceil(total / limitNumber)


    return res.status(StatusCodes.OK).json({
        success: true,
        orders,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages
        },
        overview
    })
}

const getOrderByIdForAdmin = async (req, res) => {
    const {orderId} = req.params

    const validation = validatePositiveIntegerParam(orderId, "Order ID")

    if(!validation.valid) {
        throw new BadRequestError(validation.error)
    }

    const order = await getOrderByAdmin(orderId)

    return res.status(StatusCodes.OK).json({
        success: true,
        order
    })
}

const updateOrderStatusByAdmin = async ( req, res) => {
    const {orderId} = req.params
    const{status} = req.body || {}
    
    const idValidation = validatePositiveIntegerParam(orderId, "Order ID")

    if(!idValidation.valid) {
        throw new BadRequestError(idValidation.error)
    }

    const validation = validateOrderStatus(status || {})

    if(!validation.valid) {
        throw new BadRequestError("validation failed",validation.errors)
    }
    
    
    const result = await updateOrderStatusAdmin(orderId, status)

    if(status === "cancelled") {
        return res.status(StatusCodes.OK).json({success:true,message:"Order cancelled successfully", order: result.updatedOrder, shipment: result.shipment, refund: result.refund})
    }

    return res.status(StatusCodes.OK).json({success : true, message: "Order status updated successfully", order: result})
}

const cancelOrder = async (req,res) => {
    const userId = req.user.userId
    const { orderId } = req.params
    const validation = validatePositiveIntegerParam(orderId, "Order ID")

    if(!validation.valid) {
        throw new BadRequestError(validation.error)
    }

    const  result = await cancelOrderInDB(userId, orderId)

    return res.status(StatusCodes.OK).json({success: true, message: "Order cancelled successfully", order: result.updatedOrder, shipment: result.shipment, refund: result.refund})
}


module.exports = {checkout, getOrders, getMyOrder, getAllOrdersForAdmin, updateOrderStatusByAdmin, cancelOrder, getOrderByIdForAdmin}