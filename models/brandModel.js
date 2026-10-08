const pool = require("../config/db")

const createBrand = async (name) => {
    const result = await pool.query(`INSERT INTO brands (name) VALUES ($1) RETURNING id, name`, [name])

    return result.rows[0]
}

const getAllBrands = async () => {
    const result = await pool.query(`SELECT id, name FROM brands ORDER BY name ASC`)

    return result.rows
}

const updateBrand = async (brandId, name) => {
    const result = await pool.query(`UPDATE brands SET name = $1 WHERE id = $2 RETURNING id, name`, [name, brandId])

    return result.rows[0]
}

const getSingleBrandByName = async (name, brandId = null) => {
    const result = await pool.query(`SELECT name FROM brands WHERE name =$1 AND ($2::BIGINT IS NULL OR id <> $2::BIGINT)` , [name, brandId])

    return result.rows[0]
}

const getBrandById = async (brandId) => {
    const result = await pool.query(`SELECT * FROM brands WHERE id = $1`, [brandId])

    return result.rows[0]
}

module.exports = {getAllBrands, createBrand, updateBrand, getSingleBrandByName, getBrandById}