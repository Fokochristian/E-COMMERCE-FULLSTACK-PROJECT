const validatePositiveIntegerParam = (value, paramName) => {
    if(typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return {
            valid: false,
            error: `${paramName} must be a positive integer`
        }
    }

    return  {
        valid: true,
        error: null
    }
}

module.exports = { validatePositiveIntegerParam}