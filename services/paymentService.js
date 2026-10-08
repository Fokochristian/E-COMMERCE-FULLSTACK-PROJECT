const pool = require("../config/db")
const {BadRequestError, NotFoundError} = require("../errors/index")
const {getOrderById , getOrderStatusForUpdate, updateOrderStatus} = require("../models/orderModel")
const {createPayment, getPaymentsByOrderId, updatePayment, getPaymentByIdForUpdate, updateProviderPaymentId, getAllPayments} = require("../models/paymentModel")
const {initializeKpayPayment} = require("./kpayService")



const createPaymentAttempt = async (userId, orderId, paymentMethod, phoneNumber) => {
    const order = await getOrderById(userId, orderId)

    if(!order) {
        throw new NotFoundError(`No order found with ID: ${orderId}`)
    }

   if (order.status !== "pending") {
    throw new BadRequestError(`Cannot make a payment for an order with status ${order.status}`)
   }

    const payments  =  await getPaymentsByOrderId(order.id)

    const pendingPayment = payments.find(payment => payment.status === "pending")

    if(pendingPayment) {
        throw new BadRequestError("There is already a payment attempt in progress for this order ")
    }

    const payment = await createPayment(order.id, order.total_amount, paymentMethod)

    const providerMap = {
        "MTN MONEY": "MTN_MOMO_CMR",
        "ORANGE MONEY": "ORANGE_CMR"
    }

    const provider = providerMap[paymentMethod]

    try {
        const kpayPayment = await initializeKpayPayment(order.total_amount, provider, phoneNumber, String(payment.id))
        const updatedPayment = await updateProviderPaymentId(pool, payment.id, kpayPayment.id)

        return {payment: updatedPayment, kpayPayment}
    } catch (error) {
        await updatePayment(pool, payment.id,"failed",null)

        throw error
    }
}

const getAllPaymentsForAdmin = async (status = null, paymentMethod = null, search = null, page = 1, limit = 25) => {
    const payments = await getAllPayments(status, paymentMethod, search, page, limit)

    return payments
}

const markPaymentSuccessful = async (paymentId, transactionReference) => {
  
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const payment = await getPaymentByIdForUpdate(client, paymentId)

        if(!payment) {
            throw new NotFoundError(`No payment with ID: ${paymentId}`)
        }
        
        if(payment.status === "successful") {

            if(payment.transaction_reference === transactionReference) {
                await client.query("COMMIT")

                return {payment, duplicate: true}
            }

            throw new BadRequestError("Payment has already been completed with a different transaction reference")
        }

        if(payment.status !== "pending") {
            throw new BadRequestError(`Payment cannot be completed because it is already ${payment.status}`)
        }

        const currentOrder = await getOrderStatusForUpdate(client, payment.order_id)

        if(!currentOrder) {
            throw new NotFoundError(`No order found with ID: ${payment.order_id}`)
        }

        if(currentOrder.status !== "pending") {
            throw new BadRequestError(`Order cannot be marked as paid because it is already ${currentOrder.status}`)
        }

        const updatedPayment = await updatePayment(client, paymentId, "successful", transactionReference)

        const updatedOrder = await updateOrderStatus(client, payment.order_id, "paid")

        await client.query("COMMIT")

        return { payment: updatedPayment, order: updatedOrder}
    } catch(error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

const markPaymentFailed = async (paymentId, transactionReference) => {

    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        const payment = await getPaymentByIdForUpdate(client, paymentId)

        if(!payment) {
            throw new NotFoundError(`No payment with ID: ${paymentId}`)
        }

          
        if(payment.status === "failed") {

            if(payment.transaction_reference === transactionReference) {
                await client.query("COMMIT")

                return {payment, duplicate: true}
            }

            throw new BadRequestError("Payment has already been completed with a different transaction reference")
        }

        if(payment.status !== "pending") {
            throw new BadRequestError(`Payment cannot be failed because it is already ${payment.status}`)
        }

        const updatedPayment = await updatePayment(client, paymentId, "failed", transactionReference)

        await client.query("COMMIT")

        return updatedPayment

    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}



module.exports = { createPaymentAttempt, markPaymentSuccessful, markPaymentFailed, getAllPaymentsForAdmin}