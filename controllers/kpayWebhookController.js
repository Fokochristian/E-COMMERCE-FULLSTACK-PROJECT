const {markPaymentSuccessful, markPaymentFailed} = require("../services/paymentService")
const {StatusCodes} = require("http-status-codes")
const {validateKpayWebhook} = require("../validators/kpayWebhooksValidator")
const {BadRequestError} =  require("../errors/index")
const {processRefundCompleted, processRefundFailed} = require("../services/refundService")


const handleKpayWebhook = async(req, res) => {
    const event = req.body
    
    const validation = validateKpayWebhook(event)

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const{event: eventType, externalId, reference, status} =event


    if(eventType === "payment.completed" && status === "COMPLETED") {

        await markPaymentSuccessful(Number(externalId), reference)
        
    } else if(eventType === "payment.failed" && status === "FAILED"){

        await markPaymentFailed(Number(externalId), reference)

    } else if(eventType === "refund.completed" && status === "COMPLETED") {

        await processRefundCompleted(Number(externalId), reference)

    } else if(eventType === "refund.failed" && status === "FAILED") {

        await processRefundFailed(Number(externalId), reference)

    } else {
        console.log(`Ignoring K-PAY event: ${eventType} with status ${status}`)
    }

    res.status(StatusCodes.OK).json({success: true})

}

module.exports = { handleKpayWebhook}