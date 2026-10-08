const validatePaymentMethod = (paymentMethod) => {
    if(!paymentMethod) {
        return "Payment method is required"
    }

    const allowedMethods = ["MTN MONEY", "ORANGE MONEY"]

    if(!allowedMethods.includes(paymentMethod)) {
        return "Invalid payment method"
    }

    return null
}

const validateOrderId = (orderId) => {
    if(!orderId) {
        return "Order ID is required"
    }

    if(!Number.isInteger(Number(orderId)) || Number(orderId) <= 0) {
        return "Order ID must be a positive integer"
    }

    return null
}

const validatePhoneNumber = (phoneNumber) => {
    if(!phoneNumber) {
        return  "Phone number is required"

    }

    if(typeof phoneNumber !== "string") {
        return  "Phone number must be a string"
        
    }

    const normalizedPhoneNumber = phoneNumber.trim().replace(/\s+/g, "")

    if(!/^6\d{8}$/.test(normalizedPhoneNumber)) {
        return "Phone number must be a valid Cameroon phone number"
    }

    return {
        valid: true,
        phoneNumber: `237${normalizedPhoneNumber}`
    }
}

const validatePaymentCreation = (data) => {
    const errors = {}

    const orderIdError = validateOrderId(data.orderId)

    if(orderIdError) {
        errors.orderId = orderIdError
    }

    const paymentMethodError = validatePaymentMethod(data.paymentMethod)

    if(paymentMethodError) {
        errors.paymentMethod = paymentMethodError
    }

    const phoneNumberError = validatePhoneNumber(data.phoneNumber)

    if (!phoneNumberError.valid) {
        errors.phoneNumber = phoneNumberError
    }

    return {
        valid: Object.keys(errors).length === 0, 
        errors,
        phoneNumber: phoneNumberError.phoneNumber || null
    }
}





module.exports = {validatePaymentCreation }