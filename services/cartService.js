const {  NotFoundError} = require("../errors/index");
const {findOrCreateCart, findCartItem, createCartItem, increaseCartItemQuantity, getCartByUserId, setCartItemQuantity,findCartItemByUser, deleteCartItem, getCartTotal} = require("../models/cartModel")
const {findProductById} = require("../models/productModel")



const addProductToCart = async (userId, productId, quantity) => {
    const cart = await findOrCreateCart(userId)
    const product = await findProductById(productId)

    if(!product) {
        throw new NotFoundError(`No item  found with ID: ${productId}`)
    }

    const cartItem = await findCartItem(cart.id, productId)

    if(!cartItem) {
        const newCartItem = await createCartItem(cart.id, productId, quantity)
        return newCartItem
    } 

    const updatedCartItem = await increaseCartItemQuantity(cartItem.id, quantity)
    return updatedCartItem

}

const getMyCart = async (userId) => {
    const cartItems = await getCartByUserId(userId)
    const total = await getCartTotal(userId)
    return {cartItems, total}

    // To clean up the total in postman
    // const {total} = await getCartTotal(userId)
}

// CHATGPT TAUGHT ME ABOUT PARALLER EXECUTION
// const getMyCart = async (userId) => {
//     const [cartItems, total] = await Promise.all([getCartByUserId(userId),getCartTotal(userId)])
//     return {cartItems, total}
// }

const updateCartItem = async (userId, cartItemId, quantity) => {
    const cartItem = await findCartItemByUser(cartItemId, userId)

    if(!cartItem) {
        throw new NotFoundError(`No cart item found with ID: ${cartItemId}`)
    }

    const updatedCartItem = await setCartItemQuantity(cartItemId,quantity)
    return updatedCartItem
}

const removeCartItem = async (userId, cartItemId) => {
    const cartItem = await findCartItemByUser(cartItemId, userId)

    if(!cartItem) {
        throw new NotFoundError(`No cart item found with ID: ${cartItemId}`)
    }

    const deletedItem = await deleteCartItem(cartItemId)
    return deletedItem
}


module.exports = {addProductToCart, getMyCart, updateCartItem, removeCartItem}