const validateCategoryName = (name) => {
    const errors = []

    if (name === null || name === undefined || name === "") {
        errors.push("Category name is required")

        return {
            valid: false,
            errors
        }
    }

    if (typeof name !== "string") {
        errors.push("Category must be a string")

        return {
            valid: false,
            errors
        }
    }

    const trimmedName = name.trim()

    if (trimmedName === "") {
        errors.push("Category name is required")
    }

    if (trimmedName.length > 50) {
        errors.push("Category name must not exceed 50 characters")
    }

    if (!/[a-zA-ZÀ-ÿ]/.test(trimmedName)) {
        errors.push("Category name must contain at least one letter")
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

module.exports = {
    validateCategoryName
}