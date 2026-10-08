const {getMyWishlist, addToWishlist, removeFromWishlist} = require("../services/wishlistService")
const {StatusCodes} = require("http-status-codes")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")
const { BadRequestError } = require("../errors")

const getWishlist = async (req, res) => {
    const userId = req.user.userId

    const result = await getMyWishlist(userId)

    return res.status(StatusCodes.OK).json({success: true,wishlist: result.wishlist, items: result.items})
}

const addWishlistItem = async (req, res) => {
    const userId = req.user.userId
    const {productId} = req.params
    const validation = validatePositiveIntegerParam(productId, "Product ID")

    if(!validation.valid) {
        throw new BadRequestError(validation.error)
    }

    const item = await addToWishlist(userId, productId)

    return res.status(StatusCodes.CREATED).json({success: true, message: "Product added to wishlist successfully", item})
}

const removeWishlistItem = async (req, res) => {
    const userId = req.user.userId
    const {productId} = req.params
    const validation = validatePositiveIntegerParam(productId, "Product ID")

    if(!validation.valid) {
        throw new BadRequestError(validation.error)
    }

    const item = await removeFromWishlist(userId, productId)

    return res.status(StatusCodes.OK).json({success: true, message: "Product removed from wishlist successfully", item})
}

module.exports = { getWishlist, addWishlistItem, removeWishlistItem}