const pool = require("../config/db")
const {BadRequestError, NotFoundError} = require("../errors/index")
const {createRefund, getRefundByPaymentId, updateProviderRefundId,getRefundByIdForUpdate,updateRefund} = require("../models/refundModel")
const {getPaymentByIdForUpdate} = require("../models/paymentModel")
const {initializeKpayRefund} = require("../services/kpayService")

const createRefundAttempt = async (db, paymentId, reason) => {
    const payment = await getPaymentByIdForUpdate(db,paymentId)

    if(!payment) {
        throw new NotFoundError(`No payment found with ID: ${paymentId}`)
    }

    if(payment.status !== "successful") {
        throw new BadRequestError(`Payment cannot be refunded because it is ${payment.status}`)
    }

    const refunds = await getRefundByPaymentId(db,paymentId)

    const pendingRefund = refunds.find(refund => refund.status === "pending")

    if(pendingRefund) {
        throw new BadRequestError("There is already a refund attempt in progress for this payment")
    }

    const refund = await createRefund (db, payment.id, payment.amount, reason)

    return {refund, providerPaymentId: payment.provider_payment_id}
}

const processKpayRefund = async (refundId, providerPaymentId, reason) => {
    const kpayRefund = await initializeKpayRefund(providerPaymentId, reason, String(refundId))

    const updatedRefund = await updateProviderRefundId(pool, refundId, kpayRefund.id)

    return {refund: updatedRefund, kpayRefund}
}

const processRefundCompleted = async (refundId, refundReference) => {
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const refund = await getRefundByIdForUpdate(client, refundId)

        if(!refund) {
            throw new NotFoundError(`No refund found with ID: ${refundId}`)
        }

        if(refund.status === "successful") {
            await client.query("COMMIT")
            return {refund, duplicate: true}
        }

        if(refund.status !== "pending") {
            throw new BadRequestError(`Refund cannot be completed because it is already ${refund.status}`)
        }

        const updatedRefund = await updateRefund(client, refundId, "successful", refundReference)

        await client.query("COMMIT")

        return {refund: updatedRefund}

    } catch(error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
} 


const processRefundFailed = async (refundId, refundReference) => {
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const refund = await getRefundByIdForUpdate(client, refundId)

        if(!refund) {
            throw new NotFoundError(`No refund found with ID: ${refundId}`)
        }

        if(refund.status === "failed") {
            await client.query("COMMIT")
            return {refund, duplicate: true}
        }

        if(refund.status !== "pending") {
            throw new BadRequestError(`Refund cannot be failed because it is already ${refund.status}`)
        }

        const updatedRefund = await updateRefund(client, refundId, "failed", refundReference)

        await client.query("COMMIT")

        return {refund: updatedRefund}

    } catch(error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
} 

module.exports = { createRefundAttempt, processKpayRefund, processRefundCompleted, processRefundFailed}