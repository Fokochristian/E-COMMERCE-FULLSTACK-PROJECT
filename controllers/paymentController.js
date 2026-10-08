const {createPaymentAttempt, getAllPaymentsForAdmin} = require("../services/paymentService")
const {StatusCodes} = require("http-status-codes")
const {validatePaymentCreation} = require("../validators/paymentValidator")
const {BadRequestError} = require("../errors/index")


const createPayment = async (req, res) => {
    const {orderId, paymentMethod, phoneNumber} = req.body || {}
    const validation = validatePaymentCreation(req.body || {})

    if(!validation.valid) {
        throw new BadRequestError("Validation failed", validation.errors)
    }
    
    const userId = req.user.userId

    const payment = await createPaymentAttempt(userId, orderId, paymentMethod, validation.phoneNumber)

    res.status(StatusCodes.CREATED).json({success: true, payment})
}


const getAdminPayments = async (req, res) => {
    const {
        status = null,
        paymentMethod = null,
        search = null,
        page = 1,
        limit = 25
    } = req.query

    const payments = await getAllPaymentsForAdmin(
        status,
        paymentMethod,
        search,
        Number(page),
        Number(limit)
    )

    return res.status(StatusCodes.OK).json({
        success: true,
        ...payments
    })
}



module.exports = {createPayment, getAdminPayments}