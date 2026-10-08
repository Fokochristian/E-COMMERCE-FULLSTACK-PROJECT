const pool = require("../config/db")

const createShipment = async ( db, orderId, recipientName, phoneNumber, address, shippingCost) => {
    const result = await db.query(`INSERT INTO  shipments (order_id, recipient_name, phoneNumber, address, shipping_cost) VALUES ($1, $2, $3, $4, $5) RETURNING *`,[orderId, recipientName, phoneNumber, address, shippingCost])

    return result.rows[0]
}


const getShipmentByOrderId = async (orderId) => {
    const result = await pool.query(`SELECT * FROM shipments WHERE order_id = $1`, [orderId])

    return result.rows[0]
}

const getShipmentStatusForUpdate = async (db, shipmentId) => {
    const result = await db.query(`SELECT * FROM shipments WHERE id = $1 FOR UPDATE`, [shipmentId])

    return result.rows[0]
}

const updateShipmentStatus = async (db, shipmentId, status) => {
    const result = await db.query(`UPDATE shipments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [status, shipmentId] )

    return result.rows[0]
}

const getShipmentByOrderIdForUpdate = async (db, orderId) => {
    const result = await db.query(`SELECT * FROM shipments WHERE order_id = $1 FOR UPDATE`, [orderId])

    return result.rows[0]
}

const getAllShipments = async (status = null, page = 1, limit = 25) => {
    const offset = (page - 1) * limit

    const result = await pool.query(`
        SELECT
            shipments.*,
            orders.status AS order_status,
            orders.total_amount,
            users.first_name,
            users.last_name,
            users.email
        FROM shipments
        JOIN orders
            ON shipments.order_id = orders.id
        JOIN users
            ON orders.user_id = users.id
        WHERE
            ($1::TEXT IS NULL OR shipments.status = $1::TEXT)
        ORDER BY shipments.created_at DESC
        LIMIT $2 OFFSET $3
    `, [status, limit, offset])

    const countResult = await pool.query(`
        SELECT COUNT(*)
        FROM shipments
        WHERE
            ($1::TEXT IS NULL OR status = $1::TEXT)
    `, [status])

    const overviewResult = await pool.query(`
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending,
            COUNT(*) FILTER (WHERE status = 'shipped') AS shipped,
            COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
            COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
        FROM shipments
    `)

    const overview = overviewResult.rows[0]

    return {
        shipments: result.rows,
        total: Number(countResult.rows[0].count),
        overview: {
            total: Number(overview.total),
            pending: Number(overview.pending),
            shipped: Number(overview.shipped),
            delivered: Number(overview.delivered),
            cancelled: Number(overview.cancelled)
        }
    }
}



module.exports = { createShipment, getShipmentByOrderId, getShipmentStatusForUpdate, updateShipmentStatus, getShipmentByOrderIdForUpdate, getAllShipments }