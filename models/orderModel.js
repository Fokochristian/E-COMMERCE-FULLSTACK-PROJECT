const pool = require("../config/db")


const createOrder = async (db, userId, totalAmount) => {
    const result = await db.query(`INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING *`, [userId, totalAmount])
    return result.rows[0]
}

const createOrderItem = async (db, orderId, productId, quantity, priceAtPurchase, imagePath) => {
    const result = await db.query(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, image_path) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [orderId,productId,quantity,priceAtPurchase, imagePath])
    return result.rows[0]
}

const reduceProductStock = async (db, productId, quantity) => {
    const result = await db.query(`UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING *`,[quantity, productId])
    return result.rows[0]
}

const getOrdersByUserId = async (userId) => {
    const result = await pool.query(`SELECT orders.*, JSON_AGG(JSON_BUILD_OBJECT('product_id', order_items.product_id, 'product_name', products.name, 'quantity', order_items.quantity, 'price_at_purchase', order_items.price_at_purchase, 'image_path', order_items.image_path )) AS items FROM orders JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id WHERE orders.user_id = $1 GROUP BY orders.id`, [userId])
    return result.rows 
}

const getOrderById = async (userId, orderId) => {
    const result = await pool.query(`
        SELECT 
            orders.*,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'product_id', order_items.product_id,
                    'product_name', products.name,
                    'quantity', order_items.quantity,
                    'price_at_purchase', order_items.price_at_purchase,
                    'image_path', order_items.image_path
                )
            ) AS items
        FROM orders
        JOIN order_items
            ON orders.id = order_items.order_id
        JOIN products
            ON order_items.product_id = products.id
        WHERE orders.id = $1
        AND orders.user_id = $2
        GROUP BY orders.id
    `, [orderId, userId])

    return result.rows[0]
}

const getAllOrders = async (status = null, page = 1, limit = 25) => {
    const offset = (page - 1) * limit

    const result = await pool.query(`
        SELECT
            orders.*,
            users.first_name,
            users.last_name,
            users.email,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'product_id', order_items.product_id,
                    'product_name', products.name,
                    'quantity', order_items.quantity,
                    'price_at_purchase', order_items.price_at_purchase,
                    'image_path', order_items.image_path
                )
            ) AS items
        FROM orders
        JOIN users ON orders.user_id = users.id
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id
        WHERE ($1::TEXT IS NULL OR orders.status = $1::TEXT)
        GROUP BY orders.id, users.id
        ORDER BY orders.created_at DESC
        LIMIT $2 OFFSET $3
    `, [status, limit, offset])


    const countResult = await pool.query(`
        SELECT COUNT(*)
        FROM orders
        WHERE ($1::TEXT IS NULL OR status = $1::TEXT)
    `, [status])


    const overviewResult = await pool.query(`
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending,
            COUNT(*) FILTER (WHERE status = 'paid') AS paid,
            COUNT(*) FILTER (WHERE status = 'shipped') AS shipped,
            COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
            COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
        FROM orders
    `)


    const overview = overviewResult.rows[0]

    return {
        orders: result.rows,
        total: Number(countResult.rows[0].count),
        overview: {
            total: Number(overview.total),
            pending: Number(overview.pending),
            paid: Number(overview.paid),
            shipped: Number(overview.shipped),
            delivered: Number(overview.delivered),
            cancelled: Number(overview.cancelled)
        }
    }
}

const getOrderByIdForAdmin = async (orderId) => {
    const result = await pool.query(`
        SELECT
            orders.*,
            users.first_name,
            users.last_name,
            users.email,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'product_id', order_items.product_id,
                    'product_name', products.name,
                    'quantity', order_items.quantity,
                    'price_at_purchase', order_items.price_at_purchase,
                    'image_path', order_items.image_path
                )
            ) AS items
        FROM orders
        JOIN users
            ON orders.user_id = users.id
        JOIN order_items
            ON orders.id = order_items.order_id
        JOIN products
            ON order_items.product_id = products.id
        WHERE orders.id = $1
        GROUP BY orders.id, users.id
    `, [orderId])

    return result.rows[0]
}


const updateOrderStatus = async (db,orderId, status) => {
    const result = await db.query(`UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`, [status, orderId])
    return result.rows[0]
}

const getOrderStatus = async (orderId) => {
    const result = await pool.query(`SELECT status FROM orders WHERE id = $1`, [orderId])
    return result.rows[0]
}

const restoreOrderStock =async (db, orderId) => {
    const result = await db.query(`UPDATE products SET stock_quantity = stock_quantity + order_items.quantity FROM order_items WHERE products.id = order_items.product_id AND order_items.order_id = $1 RETURNING products.*`,[orderId])

    return result.rows
}

const getOrderStatusForUpdate = async (db, orderId) => {
    const result = await db.query(`SELECT status FROM orders WHERE id = $1 FOR UPDATE`, [orderId])

    return result.rows[0]
}


module.exports = {createOrder, createOrderItem, reduceProductStock, getOrdersByUserId, getOrderById, getAllOrders, updateOrderStatus, getOrderStatus,restoreOrderStock, getOrderStatusForUpdate, getOrderByIdForAdmin}