const validateName = (name) => {
    if(!name) {
        return "Product name must be provided"
    }

    if(typeof name !=="string") {
        return "Product name must be a string"
    }
    
    if(name.trim().length < 2) {
        return "Product name must atleast contain 2 characters"
    }

    return null
}

const validateDescription = (description) => {
    if(!description) {
        return "Description must be provided"
    }
    if(typeof description !== "string") {
        return "Description must be a string"
    }

    if(description.trim().length < 10) {
        return "Description must atleast contain 10 characters"
    }

    return null
}

const validatePrice = (price) => {
    if(price === undefined || price === null || !price) {
        return "Price must be provided"
    }

    if(price <= 0) {
        return "Price must be greater than 0"
    }
    return null
}

const validatedStockQuantity = (stock_quantity) => {
    if(stock_quantity === undefined || stock_quantity === null || !stock_quantity) {
        return "Stock quantity must be provided"
    }

    if(stock_quantity < 0 ) {
        return "Stock quantity can't be negative"
    }
    if(!Number.isInteger(stock_quantity) ) {
        return "Stock quantity should be a number with no decimals"
    }

    return null
}

const validateCategory = (category_id) => {
    if(category_id === undefined || category_id === null || !category_id) {
        return "Category is required"
    }

    if(!Number.isInteger(category_id)) {
        return "category_id must be a number with no decimals"
    }

    return null
}

const validateBrand = (brand_id) => {
    if(brand_id === undefined || brand_id === null || !brand_id) {
        return "Brand is required"
    }

    if(!Number.isInteger(brand_id)) {
        return "brand_id must be a number with no decimals"
    }

    return null
}



const validateProduct = (data) => {
    const errors = {}

    const allowedFields = ["name", "description", "price", "stock_quantity", "category_id", "brand_id"]

    const unknownFields = Object.keys(data).filter(field => !allowedFields.includes(field))

    if(unknownFields.length > 0) {
        errors.general = `Invalid field(s): ${unknownFields.join(", ")}`
    }

    const nameError = validateName(data.name)
    if(nameError) {
        errors.name = nameError
    }

    const descriptionError = validateDescription(data.description)
    if(descriptionError) {
        errors.description = descriptionError
    }

    const priceError = validatePrice(data.price)
    if(priceError){
        errors.price = priceError
    }

    const stockQuantityError = validatedStockQuantity(data.stock_quantity)
    if(stockQuantityError){
        errors.stock_quantity = stockQuantityError
    }

    const categoryError = validateCategory(data.category_id)
    if(categoryError){
        errors.category_id = categoryError
    }

    const brandError = validateBrand(data.brand_id)
    if(brandError){
        errors.brand_id = brandError
    }

    

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}

const validateProductUpdate = (data) => {
    const errors = {}

    const allowedFields = [
        "name",
        "description",
        "price",
        "stock_quantity",
        "category_id",
        "brand_id"
    ]

    const unknownFields = Object.keys(data).filter(
        field => !allowedFields.includes(field)
    )

    if (unknownFields.length > 0) {
        errors.general = `Invalid field(s): ${unknownFields.join(", ")}`
    }

    if (Object.keys(data).length === 0) {
        errors.general = "Please provide at least one field to update"
    }

    if (data.name !== undefined) {
        const nameError = validateName(data.name)

        if (nameError) {
            errors.name = nameError
        }
    }

    if (data.description !== undefined) {
        const descriptionError = validateDescription(data.description)

        if (descriptionError) {
            errors.description = descriptionError
        }
    }

    if (data.price !== undefined) {
        const priceError = validatePrice(data.price)

        if (priceError) {
            errors.price = priceError
        }
    }

    if (data.stock_quantity !== undefined) {
        const stockQuantityError = validatedStockQuantity(data.stock_quantity)

        if (stockQuantityError) {
            errors.stock_quantity = stockQuantityError
        }
    }

    if (data.category_id !== undefined) {
        const categoryError = validateCategory(data.category_id)

        if (categoryError) {
            errors.category_id = categoryError
        }
    }

    if (data.brand_id !== undefined) {
        const brandError = validateBrand(data.brand_id)

        if (brandError) {
            errors.brand_id = brandError
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}

module.exports = {validateProduct, validateProductUpdate}