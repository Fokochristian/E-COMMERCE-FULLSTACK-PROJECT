const pool = require("../config/db")


const createRefund = async (db, paymentId, amount, reason) => {
    const result = await db.query(`INSERT INTO refunds (payment_id, amount, reason) VALUES ($1, $2, $3) RETURNING *`, [paymentId, amount, reason])

    return result.rows[0]
}

const getRefundById = async (refundId) => {
    const result = await pool.query(`SELECT * FROM refunds WHERE id = $1`, [refundId])

    return result.rows[0]
}

const getRefundByPaymentId = async (db,paymentId) => {
    const result = await db.query(`SELECT * FROM refunds WHERE payment_id = $1 ORDER BY created_at DESC`, [paymentId])

    return result.rows
}

const getRefundByIdForUpdate = async (db, refundId) => {
    const result = await db.query(`SELECT * FROM refunds WHERE id = $1 FOR UPDATE`, [refundId])

    return result.rows[0]
}

const updateProviderRefundId = async (db, refundId, providerRefundId) => {
    const result = await db.query(`UPDATE refunds SET provider_refund_id = $1 WHERE id = $2 RETURNING *`,[providerRefundId, refundId])

    return result.rows[0]
}

const updateRefund = async (db, refundId, status, refundReference) => {
    const result = await db.query(`UPDATE refunds SET status = $1, refund_reference = $2 WHERE id = $3 RETURNING *`, [status, refundReference, refundId])

    return result.rows[0]
}

module.exports = {createRefund, getRefundById, getRefundByPaymentId, getRefundByIdForUpdate, updateProviderRefundId, updateRefund}