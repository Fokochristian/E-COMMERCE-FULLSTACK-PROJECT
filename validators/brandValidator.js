const validateBrandName = (name) => {
    const errors = []

    if (name === null || name === undefined || name === "") {
        errors.push("Brand name is required")
        return {
            valid: false,
            errors
        }
    }

    if (typeof name !== "string") {
        errors.push("Brand must be a string")
        return {
            valid: false,
            errors
        }
    }

    const trimmedName = name.trim()

    if (trimmedName === "") {
        errors.push("Brand name is required")
    }

    if (trimmedName.length > 50) {
        errors.push("Brand name must not exceed 50 characters")
    }

    if (!/[a-zA-ZÀ-ÿ]/.test(trimmedName)) {
        errors.push("Brand name must contain at least one letter")
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

module.exports = {
    validateBrandName
}