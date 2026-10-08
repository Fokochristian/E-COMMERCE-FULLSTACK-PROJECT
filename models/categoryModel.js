const pool = require("../config/db")


const createCategory = async (name) => {
    const result = await pool.query(`INSERT INTO categories (name) VALUES ($1) RETURNING id, name`, [name])

    return result.rows[0]
}

const getAllCategories = async () => {
    const result = await pool.query(`SELECT id, name FROM categories ORDER BY name ASC`)

    return result.rows
}

const updateCategory = async (categoryId, name) => {
    const result = await pool.query(`UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name`, [name, categoryId])

    return result.rows[0]
}

// for when you want to check for update if that name exists and exclude that name or item
const getSingleCategoryByName = async (name, categoryId = null) => {
    const result = await pool.query(`SELECT name FROM categories WHERE name = $1 AND ($2::BIGINT IS NULL OR id <> $2::BIGINT) `, [name, categoryId])

    return result.rows[0]
}

const getCategoryById = async (categoryId) => {
    const result = await pool.query(`SELECT * FROM categories WHERE id = $1`, [categoryId])

    return result.rows[0]
}


module.exports = {
    getAllCategories,
    createCategory, 
    updateCategory,
    getSingleCategoryByName,
    getCategoryById
}