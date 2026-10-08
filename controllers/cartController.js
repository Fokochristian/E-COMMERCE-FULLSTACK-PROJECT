const {StatusCodes} = require("http-status-codes")
const {addProductToCart, getMyCart, updateCartItem, removeCartItem} = require("../services/cartService")
const {validateCartQuantity, validateProductId} = require("../validators/cartValidator")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")
const {BadRequestError} = require("../errors/index")

const addToCart = async (req, res) => {
    const {productId, quantity} = req.body || {}
    const validation = validateProductId(productId || {})
    const quantityValidation = validateCartQuantity(quantity || {})

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    if(!quantityValidation.valid) {
        throw new BadRequestError(quantityValidation.errors.join(", "))
    }
    
    const userId = req.user.userId

    const cartItem = await addProductToCart(userId, productId, quantity)

    return res.status(StatusCodes.OK).json({success: true, message: "Product added to cart successfully", cartItem})
}

const getCart = async (req, res) => {
    const userId = req.user.userId
    const {cartItems, total} = await getMyCart(userId)

    return res.status(StatusCodes.OK).json({success: true, cartItems, total})
}

const updateCart = async (req, res) => {
    const userId = req.user.userId
    const {cartItemId} = req.params
    const {quantity} = req.body || {}
    const validation = validateCartQuantity(quantity || {})
    const idValidation = validatePositiveIntegerParam(cartItemId, "Cart Item ID")

    if(!idValidation.valid) {
        throw new BadRequestError(idValidation.error)
    }

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const updatedCartItem = await updateCartItem(userId, cartItemId, quantity)

    return res.status(StatusCodes.OK).json({success: true, message: "Cart updated successfully", updatedCartItem})
}

const removeCartItemFromCart = async (req, res) => {
    const userId = req.user.userId
    const {cartItemId} = req.params
    const validation = validatePositiveIntegerParam(cartItemId, "Cart Item ID")

    if(!validation.valid) {
        throw new BadRequestError(validation.error)
    }

    const deletedCartItem = await removeCartItem(userId, cartItemId)
    return res.status(StatusCodes.OK).json({success: true, message: "Item successfully deleted from cart ", deletedCartItem})
}

module.exports = {addToCart, getCart, updateCart, removeCartItemFromCart} 