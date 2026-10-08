const pool = require("../config/db")


const createPayment = async (orderId, amount, paymentMethod) => {
    const result =  await pool.query(`INSERT INTO payments (order_id, amount, payment_method) VALUES ($1, $2, $3) RETURNING *`, [orderId, amount, paymentMethod])

    return result.rows[0]
}

const updatePayment = async (db,paymentId, status, transactionReference) => {
    const result =  await db.query(`UPDATE payments SET status = $1, transaction_reference = $2 WHERE id = $3 RETURNING *`, [status, transactionReference,paymentId])

    return result.rows[0]
}

const getPaymentsByOrderId = async (orderId) => {
    const result = await pool.query(`SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`, [orderId])

    return result.rows
}

const getPaymentById = async (paymentId) => {
    const result = await pool.query(`SELECT * FROM payments WHERE id =$1`,[paymentId])

    return result.rows[0]
}

const getPaymentByIdForUpdate = async (db, paymentId) => {
    const result = await db.query(`SELECT * FROM payments WHERE id = $1 FOR UPDATE`, [paymentId])

    return result.rows[0]
}

const getSuccessfulPaymentByOrderId = async (db, orderId) => {
    const result = await db.query(`SELECT *  FROM payments WHERE order_id = $1 AND status = 'successful' ORDER BY created_at DESC LIMIT 1`, [orderId])

    return result.rows[0]
}

const updateProviderPaymentId = async (db, paymentId, providerPaymentId) => {
    const result = await db.query(`UPDATE payments SET provider_payment_id = $1 WHERE id = $2 RETURNING *`, [providerPaymentId, paymentId])

    return result.rows[0]
}

const getAllPayments = async (status = null, paymentMethod = null, search = null, page = 1, limit = 25) => {
    const offset = (page - 1) * limit

    const result = await pool.query(`
        SELECT
            payments.id,
            payments.order_id,
            payments.amount,
            payments.status,
            payments.payment_method,
            payments.transaction_reference,
            payments.provider_payment_id,
            payments.created_at,
            users.first_name,
            users.last_name,
            users.email
        FROM payments
        JOIN orders
            ON payments.order_id = orders.id
        JOIN users
            ON orders.user_id = users.id
        WHERE
            ($1::TEXT IS NULL OR payments.status = $1::TEXT)
            AND ($2::TEXT IS NULL OR payments.payment_method = $2::TEXT)
            AND (
                $3::TEXT IS NULL
                OR CAST(payments.id AS TEXT) ILIKE '%' || $3 || '%'
                OR CAST(payments.order_id AS TEXT) ILIKE '%' || $3 || '%'
                OR users.first_name ILIKE '%' || $3 || '%'
                OR users.last_name ILIKE '%' || $3 || '%'
                OR users.email ILIKE '%' || $3 || '%'
                OR payments.transaction_reference ILIKE '%' || $3 || '%'
            )
        ORDER BY payments.created_at DESC
        LIMIT $4 OFFSET $5
    `, [status, paymentMethod, search, limit, offset])

    const countResult = await pool.query(`
        SELECT COUNT(*)
        FROM payments
        JOIN orders
            ON payments.order_id = orders.id
        JOIN users
            ON orders.user_id = users.id
        WHERE
            ($1::TEXT IS NULL OR payments.status = $1::TEXT)
            AND ($2::TEXT IS NULL OR payments.payment_method = $2::TEXT)
            AND (
                $3::TEXT IS NULL
                OR CAST(payments.id AS TEXT) ILIKE '%' || $3 || '%'
                OR CAST(payments.order_id AS TEXT) ILIKE '%' || $3 || '%'
                OR users.first_name ILIKE '%' || $3 || '%'
                OR users.last_name ILIKE '%' || $3 || '%'
                OR users.email ILIKE '%' || $3 || '%'
                OR payments.transaction_reference ILIKE '%' || $3 || '%'
            )
    `, [status, paymentMethod, search])

    const overviewResult = await pool.query(`
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending,
            COUNT(*) FILTER (WHERE status = 'successful') AS successful,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed
        FROM payments
    `)


    const overview = overviewResult.rows[0]

    return {
        payments: result.rows,
        total: Number(countResult.rows[0].count),
        overview: {
            total: Number(overview.total),
            pending: Number(overview.pending),
            successful: Number(overview.successful),
            failed: Number(overview.failed)
        }
    }
}


module.exports = { createPayment, updatePayment, getPaymentsByOrderId, getPaymentById, getPaymentByIdForUpdate, getSuccessfulPaymentByOrderId, updateProviderPaymentId, getAllPayments}