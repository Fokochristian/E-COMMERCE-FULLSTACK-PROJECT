const pool = require("../config/db")

const findOrCreateCart = async (userId) => {
    const result = await pool.query(`SELECT * FROM carts WHERE user_id = $1`, [userId])

    if(result.rows[0]){
        return result.rows[0]
    }

    const newCart = await pool.query(`INSERT INTO carts(user_id) VALUES($1) RETURNING *`,[userId])

    return newCart.rows[0]
}

const findCartItem = async (cartId, productId) => {
    const result = await pool.query(`SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`, [cartId, productId])

    return result.rows[0]
}

const createCartItem = async (cartId, productId, quantity) => {
    const result = await pool.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *`, [cartId, productId, quantity])

    return result.rows[0]
}

const increaseCartItemQuantity = async (cartItemId, quantity) => {
    const result = await pool.query(`UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *`,[quantity,cartItemId])

    return result.rows[0]
}

const findCartItemById = async (cartItemId) => {
    const result = await pool.query(`SELECT * FROM cart_items WHERE id = $1`, [cartItemId])

    return result.rows[0]
}

const setCartItemQuantity = async(cartItemId, quantity) => {
    const result = await pool.query(`UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *`, [quantity, cartItemId])

    return result.rows[0]
}

const findCartItemByUser = async (cartItemId, userId) => {
    const result = await pool.query(`SELECT cart_items.* FROM cart_items JOIN carts ON cart_items.cart_id = carts.id WHERE cart_items.id = $1 AND carts.user_id = $2`,[cartItemId,userId])

    return result.rows[0]
}

const getCartByUserId = async (userId, db = pool) => {
    const result = await db.query(`SELECT cart_items.id AS cart_item_id, products.id AS product_id, products.name, products.price, products.image_path, cart_items.quantity FROM carts JOIN cart_items ON carts.id = cart_items.cart_id JOIN products ON cart_items.product_id = products.id WHERE carts.user_id = $1 `, [userId])
    return result.rows
}

const deleteCartItem = async (cartItemId) => {
    const result = await pool.query(`DELETE FROM cart_items WHERE id = $1 RETURNING *`, [cartItemId])
    return result.rows[0]
}

const getCartTotal = async (userId, db = pool) => {
    const result = await db.query(`SELECT SUM(products.price *  cart_items.quantity) AS total FROM carts JOIN cart_items ON carts.id = cart_items.cart_id JOIN products ON cart_items.product_id = products.id WHERE carts.user_id = $1`, [userId])
    return result.rows[0]
}

const clearCartItems = async (db, userId) => {
    const result = await db.query(`DELETE FROM cart_items WHERE cart_id IN ( SELECT id FROM carts WHERE user_id = $1) RETURNING *`, [userId])

    return result.rows

}


module.exports = {findOrCreateCart, findCartItem, createCartItem, increaseCartItemQuantity, getCartByUserId, setCartItemQuantity,findCartItemById,findCartItemByUser, deleteCartItem, getCartTotal, clearCartItems}