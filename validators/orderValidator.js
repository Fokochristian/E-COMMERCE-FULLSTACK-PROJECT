const validateOrderStatus = (status) => {
    const errors = []

    const allowedStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"]

    if(status === undefined) {
        errors.push("Status is required")
    }

    if (!allowedStatuses.includes(status)) {
        errors.push("Invalid order status")
    }

    return {
        valid: errors.length === 0,
        errors
    }
}


const validateRecipientName = (recipient_name) => {
    if(!recipient_name) {
       return "Recipient name is required"
    }

    if(recipient_name < 2) {
        return "Recipient name must contain atleast 2 characters"
    }

    if(!/^[a-zA-Z]+$/.test(recipient_name)) {
        return "Recipient name must contain only letters"
    }

    return null
}

const validatePhoneNumber = (phone_number) => {
    if(!phone_number) {
        return "Phone number is required"
    }

    if (typeof phone_number !== "string" || phone_number.trim() === "") { 
        return "Phone number must be a non-empty string" 
    }

    if(!/^6\d{8}$/.test(phone_number)) {
        return "Phone number must be a valid Cameroon phone number"
    }

    return null
}


const validateAddress = (address) => {
    if(!address) {
        return "Address is required"
    }

    if(typeof address !== "string" || address.trim() === "") {
        return "Address must be a non-empty string"
    }

}

const validateCheckout = (data) => {
    const errors = {}

    const allowedFields = ["recipient_name", "phoneNumber", "address"]

    const unknownFields = Object.keys(data).filter(
        field => !allowedFields.includes(field)
    )

    if(unknownFields.length > 0) {
        errors.general = `Unknown fields(s): ${unknownFields.join(", ")}`
    }

    const recipientNameError = validateRecipientName(data.recipient_name)

    if(recipientNameError) {
        errors.recipient_name = recipientNameError
    }

    const phoneNumberError = validatePhoneNumber(data.phoneNumber)

    if(phoneNumberError) {
        errors.phoneNumber = phoneNumberError
    }

    const addressError = validateAddress(data.address)

    if(addressError) {
        errors.address = addressError
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}

const validateOrderQuery = (query) => {
    const errors = []

    const allowedStatuses = [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled"
    ]

    const {
        status,
        page = "1",
        limit = "25"
    } = query


    if (status !== undefined && !allowedStatuses.includes(status)) {
        errors.push("Invalid order status")
    }


    const pageNumber = Number(page)

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        errors.push("Page must be a positive integer")
    }


    const limitNumber = Number(limit)

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
        errors.push("Limit must be a positive integer")
    }


    return {
        valid: errors.length === 0,
        errors
    }
}

module.exports = { validateOrderStatus, validateCheckout, validateOrderQuery}