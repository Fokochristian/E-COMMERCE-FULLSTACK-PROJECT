const kpay = require("../config/kpay")
const {BadRequestError} = require("../errors/index")


const initializeKpayPayment = async (amount,provider,phoneNumber,externalId) => {
    try {

        const response = await kpay.post("/payments/init", {amount,provider,phoneNumber,externalId})

        return response.data

    } catch(error) {

        if(error.response) {
            throw new BadRequestError(error.response.data.message || "K-PAY rejected the payment request")
        }

        throw error
    }
}

const initializeKpayRefund = async (kpayPaymentId, reason, externalId) => {
    try {
        const response = await kpay.post(`/payments/${kpayPaymentId}/refund`, {reason, externalId})

        return response.data
    } catch (error) {
        console.log("KPAY refund error:", error.response?.data)

        throw error
    }
    
}

const getKpayPayment = async (kpayPaymentId) => {
    const response = await kpay.get(`/payments/${kpayPaymentId}`)

    return response.data
}


module.exports = {initializeKpayPayment, initializeKpayRefund, getKpayPayment}