const pool = require("../config/db")

// Used to create user
const createUser = async (userData) => {
    const { first_name, last_name, email, password } = userData
    const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, role, created_at`,
        [first_name, last_name, email, password]
    )
    return result.rows[0]
}

// Used to login and also to find duplicate emails
const findUserByEmail = async (email) => {
    const result =await pool.query(
        `SELECT * FROM users WHERE email=$1`,[email]
    )
    return result.rows[0]
}


module.exports = { createUser, findUserByEmail }