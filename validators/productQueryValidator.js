const validateProductQuery = (query) => {
    const errors = []

    const allowedFields = ["search", "category", "brand", "minPrice", "maxPrice", "page", "limit"]

    const unknownFields = Object.keys(query).filter(field => !allowedFields.includes(field))

    if(unknownFields.length > 0) {
        errors.push(`Invalid query parameter(s): ${unknownFields.join(", ")}`)
    }

    const {search, category, brand, minPrice, maxPrice, page, limit} = query

    if(search !== undefined && typeof search !== "string") {
        errors.push("Search must be a string")
    }

    if(category !== undefined) {
        if(!/^[1-9]\d*$/.test(category)) {
            errors.push("category must be a positive integer")
        }
    }

    if(brand !== undefined) {
        if(!/^[1-9]\d*$/.test(brand)) {
            errors.push("brand must be a positive integer")
        }
    }

    if(minPrice !== undefined) {
        if(minPrice === "") {
            errors.push("minPrice must be a valid non-negative number")

        } else {
            const minimumPrice = Number(minPrice)

            if(!Number.isFinite(minimumPrice) || minimumPrice < 0) {
                errors.push("minPrice must be a valid non-negative number")
            }
        }
    }

    if(maxPrice !== undefined) {
        if(maxPrice === "") {
            errors.push("maxPrice must be a valid non-negative number")

        } else {
            const maximumPrice = Number(maxPrice)

            if(!Number.isFinite(maximumPrice) || maximumPrice < 0) {
                errors.push("maxPrice must be a valid non-neagtive number")
            }
        }
    }

    if(minPrice !== undefined && maxPrice !== undefined) {
        const minimumPrice = Number(minPrice)
        const maximumPrice = Number(maxPrice)

        if(Number.isFinite(minimumPrice) && Number.isFinite(maximumPrice) && minimumPrice > maximumPrice) {
            errors.push("minPrice cannot be greater than maxPrice")
        }
    }

    if(page !== undefined) {
        if(!/^[1-9]\d*$/.test(page)) {
            errors.push("page must be a positive integer")
        }
    }

    if(limit !== undefined) {
       if(!/^[1-9]\d*$/.test(limit) || Number(limit) > 100) {
            errors.push("limit must be an integer between 1 and 100")
        }         
    }

    return {
        valid: errors.length === 0,
        errors
    }
}


module.exports = { validateProductQuery }