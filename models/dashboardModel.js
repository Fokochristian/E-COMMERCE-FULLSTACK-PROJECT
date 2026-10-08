const pool = require("../config/db")

const getDashboardMetrics = async () => {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*)
             FROM products
             WHERE is_available = true) AS total_products,

            (SELECT COUNT(*)
             FROM users
             WHERE role = 'customer') AS total_customers,

            (SELECT COUNT(*)
             FROM orders) AS total_orders,

            (
                (SELECT COALESCE(SUM(amount), 0)
                 FROM payments
                 WHERE status = 'successful')
                -
                (SELECT COALESCE(SUM(amount), 0)
                 FROM refunds
                 WHERE status = 'successful')
            ) AS total_revenue
    `)

    return result.rows[0]
}

const getRecentOrders = async (limit = 20) => {
    const result = await pool.query(`
        SELECT
            orders.id,
            orders.status,
            orders.total_amount,
            orders.created_at,
            users.first_name,
            users.last_name
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        ORDER BY orders.created_at DESC
        LIMIT $1
    `, [limit])

    return result.rows
}

module.exports = { getDashboardMetrics, getRecentOrders }