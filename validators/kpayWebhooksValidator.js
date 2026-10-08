const validateKpayWebhook = (data) => {
    const errors = []

    const allowedEvents = [
        "payment.completed",
        "payment.failed",
        "refund.completed",
        "refund.failed"
    ]

    if(!data.event) {
        errors.push("event is required")
    }

    if(!allowedEvents.includes(data.event)) {
        errors.push(`Unsupported event: ${data.event}`)
    }

    if(!data.externalId) {
        errors.push("externalId is required")
    }

    if(data.event === "payment.completed" || data.event === "payment.failed") {
        const paymentId = Number(data.externalId)

        if(!Number.isInteger(paymentId) || paymentId <= 0) {
            errors.push("Invalid payment externalId")
        }
    } else if(data.event === "refund.completed" || data.event === "refund.failed") {
        const refundId = Number(data.externalId)

        if(!Number.isInteger(refundId) || refundId <= 0) {
            errors.push("Invalid refund externalId")
        }
    }

    if(!data.reference) {
        errors.push("reference is required")
    }

    if(typeof data.reference !== "string") {
        errors.push("reference must be a string")
    }

    return {valid: errors.length === 0, errors}
}

module.exports = {validateKpayWebhook}