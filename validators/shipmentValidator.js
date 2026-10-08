const validateShipmentStatus = (status) => {
    const errors = []

    const allowedStatuses = ["pending","shipped", "delivered", "cancelled"]

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

module.exports = {validateShipmentStatus}