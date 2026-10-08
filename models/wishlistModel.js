const pool = require("../config/db")

const createWishlist = async (db, userId) => {
    const result = await db.query(`INSERT INTO wishlists (user_id) VALUES ($1) RETURNING *`, [userId])

    return result.rows[0]
}

const getWishlistByUserId = async (db,userId) => {
    const result = await db.query(`SELECT * FROM wishlists WHERE user_id = $1`, [userId])

    return result.rows[0]
}


const getWishlistItems = async (db, wishlistId) => {
    const result = await db.query(`SELECT wishlist_items.id, wishlist_items.wishlist_id, wishlist_items.product_id, wishlist_items.created_at, products.name, products.price, products.description, products.image_path, products.stock_quantity  FROM wishlist_items JOIN products ON wishlist_items.product_id = products.id WHERE wishlist_items.wishlist_id = $1 ORDER BY wishlist_items.created_at DESC`, [wishlistId])

    return result.rows
}

const addWishlistItem = async (db, wishlistId, productId) => {
    const result = await db.query(`INSERT INTO wishlist_items (wishlist_id, product_id) VALUES($1, $2) RETURNING *`, [wishlistId, productId])

    return result.rows[0]
}

const removeWishlistItem = async (db, wishlistId, productId) => {
    const result = await db.query(`DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2 RETURNING *`, [wishlistId, productId])

    return result.rows[0]
}

const getWishlistItem = async (db, wishlistId, productId) => {
    const result = await db.query(`SELECT * FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2`, [wishlistId, productId])

    return result.rows[0]
}

module.exports = { createWishlist, getWishlistByUserId, getWishlistItems, addWishlistItem, removeWishlistItem, getWishlistItem}

