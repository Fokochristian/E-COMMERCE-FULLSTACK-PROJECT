const pool = require("../config/db")


const getAnalyticsOverview = async (startDate = null, endDate = null) => {
    const result = await pool.query(`
        SELECT
            COALESCE(SUM(orders.total_amount), 0) AS total_revenue,
            COUNT(orders.id) AS total_orders,
            COALESCE(SUM(order_items.quantity), 0) AS units_sold,
            COALESCE(
                AVG(orders.total_amount),
                0
            ) AS average_order_value
        FROM orders
        LEFT JOIN order_items
            ON orders.id = order_items.order_id
        WHERE
            orders.status IN ('shipped', 'delivered')
            AND ($1::TIMESTAMPTZ IS NULL OR orders.created_at >= $1::TIMESTAMPTZ)
            AND ($2::TIMESTAMPTZ IS NULL OR orders.created_at < $2::TIMESTAMPTZ)
    `, [startDate, endDate])

    return result.rows[0]
}


const getRevenueOverTime = async (startDate = null, endDate = null) => {
    const result = await pool.query(`
        SELECT
            DATE(orders.created_at) AS date,
            COALESCE(SUM(orders.total_amount), 0) AS revenue
        FROM orders
        WHERE
            orders.status IN ('shipped', 'delivered')
            AND ($1::TIMESTAMPTZ IS NULL OR orders.created_at >= $1::TIMESTAMPTZ)
            AND ($2::TIMESTAMPTZ IS NULL OR orders.created_at < $2::TIMESTAMPTZ)
        GROUP BY DATE(orders.created_at)
        ORDER BY DATE(orders.created_at) ASC
    `, [startDate, endDate])

    return result.rows
}


const getOrderStatusBreakdown = async (
    startDate = null,
    endDate = null
) => {
    const result = await pool.query(`
        SELECT
            status,
            COUNT(*) AS count
        FROM orders
        WHERE
            ($1::TIMESTAMPTZ IS NULL OR created_at >= $1::TIMESTAMPTZ)
            AND ($2::TIMESTAMPTZ IS NULL OR created_at < $2::TIMESTAMPTZ)
        GROUP BY status
        ORDER BY status
    `, [startDate, endDate])

    return result.rows
}


const getTopSellingProducts = async (
    startDate = null,
    endDate = null
) => {
    const result = await pool.query(`
        SELECT
            products.id,
            products.name,
            SUM(order_items.quantity) AS units_sold,
            COALESCE(
                SUM(
                    order_items.quantity * order_items.price_at_purchase
                ),
                0
            ) AS revenue
        FROM order_items
        JOIN orders
            ON order_items.order_id = orders.id
        JOIN products
            ON order_items.product_id = products.id
        WHERE
            orders.status IN ('shipped', 'delivered')
            AND ($1::TIMESTAMPTZ IS NULL OR orders.created_at >= $1::TIMESTAMPTZ)
            AND ($2::TIMESTAMPTZ IS NULL OR orders.created_at < $2::TIMESTAMPTZ)
        GROUP BY
            products.id,
            products.name
        ORDER BY
            units_sold DESC
        LIMIT 10
    `, [startDate, endDate])

    return result.rows
}


module.exports = {
    getAnalyticsOverview,
    getRevenueOverTime,
    getOrderStatusBreakdown,
    getTopSellingProducts
}