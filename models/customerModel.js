const pool = require("../config/db")

const getAllCustomers = async (search = null, page = 1, limit = 25) => {
    const offset = (page - 1) * limit

    const result = await pool.query(
        `
        SELECT
            id,
            first_name,
            last_name,
            email,
            role,
            created_at
        FROM users
        WHERE role = 'customer'
        AND (
            $1::TEXT IS NULL
            OR first_name ILIKE '%' || $1 || '%'
            OR last_name ILIKE '%' || $1 || '%'
            OR email ILIKE '%' || $1 || '%'
        )
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        `,
        [search, limit, offset]
    )

    const countResult = await pool.query(
        `
        SELECT COUNT(*)
        FROM users
        WHERE role = 'customer'
        AND (
            $1::TEXT IS NULL
            OR first_name ILIKE '%' || $1 || '%'
            OR last_name ILIKE '%' || $1 || '%'
            OR email ILIKE '%' || $1 || '%'
        )
        `,
        [search]
    )

    return {
        customers: result.rows,
        total: Number(countResult.rows[0].count)
    }
}

module.exports = {
    getAllCustomers
}