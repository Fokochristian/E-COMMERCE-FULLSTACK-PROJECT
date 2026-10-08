const validateCartQuantity = (quantity) => {
    const errors = []

    if (quantity === null || quantity === undefined) {
        errors.push("Quantity is required")
    }  
    
    if (!Number.isInteger(Number(quantity)) || quantity < 1) {
        errors.push("Quantity must be a greater number with no decimals")
    }

    return {
        valid: errors.length === 0,
        errors
    }  
}

const validateProductId = (productId) => {
    const errors = []

    if(!productId) {
        errors.push("productId is required")
    }

    if(!Number.isInteger(Number(productId)) || productId < 1) {
        errors.push("productId must be a number greater than one")
    }

    return {
        valid: errors.length === 0, 
        errors
    }
}

module.exports = { validateCartQuantity, validateProductId}