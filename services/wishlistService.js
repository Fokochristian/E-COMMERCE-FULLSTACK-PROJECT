const pool = require("../config/db")
const {BadRequestError, NotFoundError} = require("../errors/index")
const {createWishlist, getWishlistByUserId, getWishlistItems,addWishlistItem,removeWishlistItem,getWishlistItem} = require("../models/wishlistModel")

const {findProductById} = require("../models/productModel")

const getMyWishlist = async (userId) => {
    let wishlist = await getWishlistByUserId(pool, userId)

    if(!wishlist) {
        wishlist = await createWishlist(pool, userId)
    }

    const items = await getWishlistItems(pool, wishlist.id)

    return {wishlist, items}
}

const addToWishlist = async (userId, productId) => {
    const product = await findProductById(productId)

    if(!product) {
        throw new NotFoundError(`No product found with ID: ${productId}`)
    }

    let wishlist = await getWishlistByUserId(pool, userId)

    if(!wishlist) {
        wishlist = await createWishlist(pool, userId)
    }

    const existingItem = await getWishlistItem(pool, wishlist.id, productId)

    if(existingItem) {
        throw new BadRequestError("Product is already in your wishlist")
    }

    const item = await addWishlistItem(pool, wishlist.id, productId)

    return item
}


const removeFromWishlist = async (userId, productId) => {
    const wishlist = await getWishlistByUserId(pool, userId)

    if(!wishlist) {
        throw new NotFoundError("Wishlist not found")
    }

    const item = await getWishlistItem(pool, wishlist.id, productId)

    if(!item) {
        throw new NotFoundError(`Product with ID: ${productId} is not in your wishlist`)
    }

    const removedItem = await removeWishlistItem(pool, wishlist.id, productId)

    return removedItem
}

module.exports = {getMyWishlist,addToWishlist, removeFromWishlist}