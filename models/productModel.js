const pool = require("../config/db")

const createProduct = async (productData) => { 
    const {
        name,
        description,
        price,
        stock_quantity,
        category_id,
        brand_id,
        image_path,
        image_public_id
    } = productData 

    const result = await pool.query(`
        INSERT INTO products (
            name,
            description,
            price,
            stock_quantity,
            category_id,
            brand_id,
            image_path,
            image_public_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `, [
        name,
        description,
        price,
        stock_quantity,
        category_id,
        brand_id,
        image_path,
        image_public_id
    ]) 
 
    return result.rows[0] 
}

const findName = async (name, productId = null) => {
    const result = await pool.query(`SELECT name FROM products WHERE name = $1 AND ($2::BIGINT IS NULL OR id <> $2::BIGINT)`, [name, productId])
    return result.rows[0]
}

const findCategoryById = async (categoryId) => {
    const result = await pool.query(`SELECT id FROM categories WHERE id = $1`, [categoryId])
    return result.rows[0]
}

const findBrandById = async (brandId) => {
    const result = await pool.query(`SELECT id FROM brands WHERE id = $1`, [brandId])
    return result.rows[0]
}

const getAllProducts = async (search, categoryId = null, brandId = null, minimumPrice = null, maximumPrice = null, page = 1, limit = 10) => {
    const offset = (page - 1) * limit

    const result = await pool.query(`
    SELECT
        products.*,
        brands.name AS brand_name,
        categories.name AS category_name
    FROM products
    JOIN brands
        ON products.brand_id = brands.id
    JOIN categories
        ON products.category_id = categories.id
    WHERE products.is_available = true AND stock_quantity <> 0
        AND ($1 = '' OR products.name ILIKE '%' || $1 || '%')
        AND ($2::BIGINT IS NULL OR products.category_id = $2::BIGINT)
        AND ($3::BIGINT IS NULL OR products.brand_id = $3::BIGINT)
        AND ($4::NUMERIC IS NULL OR products.price >= $4::NUMERIC)
        AND ($5::NUMERIC IS NULL OR products.price <= $5::NUMERIC)
    ORDER BY products.created_at DESC
    LIMIT $6 OFFSET $7
`, [
    search,
    categoryId,
    brandId,
    minimumPrice,
    maximumPrice,
    limit,
    offset
])

    const countResult = await pool.query(`SELECT COUNT(*) FROM products WHERE is_available = true AND stock_quantity <> 0 AND ($1 = '' OR name ILIKE '%' || $1 || '%') AND ($2::BIGINT IS NULL OR category_id = $2::BIGINT) AND ($3::BIGINT IS NULL OR brand_id = $3::BIGINT) AND ($4::NUMERIC IS NULL OR price >= $4::NUMERIC) AND ($5::NUMERIC IS NULL OR price <= $5::NUMERIC)`, [search, categoryId, brandId, minimumPrice, maximumPrice])

    return {
        products: result.rows,
        total: Number(countResult.rows[0].count)
    }
}
const getProductsForSitemap = async () => {
    const result = await pool.query(`
        SELECT id
        FROM products
        WHERE is_available = true
        ORDER BY id ASC
    `)

    return result.rows
}

const getAllProductsAdmin = async (search, categoryId = null, brandId = null, minimumPrice = null, maximumPrice = null, page = 1, limit = 10) => {
    const offset = (page - 1) * limit

    const result = await pool.query(`SELECT * FROM products WHERE ($1 = '' OR name ILIKE '%' || $1 || '%') AND ($2::BIGINT IS NULL OR category_id = $2::BIGINT) AND ($3::BIGINT IS NULL OR brand_id = $3::BIGINT) AND ($4::NUMERIC IS NULL OR price >= $4::NUMERIC) AND ($5::NUMERIC IS NULL OR price <= $5::NUMERIC) ORDER BY created_at DESC LIMIT $6 OFFSET $7`, [search, categoryId, brandId, minimumPrice, maximumPrice, limit, offset])
    
    const countResult = await pool.query(`SELECT COUNT(*) FROM products WHERE ($1 = '' OR name ILIKE '%' || $1 || '%') AND ($2::BIGINT IS NULL OR category_id = $2::BIGINT) AND ($3::BIGINT IS NULL OR brand_id = $3::BIGINT) AND ($4::NUMERIC IS NULL OR price >= $4::NUMERIC) AND ($5::NUMERIC IS NULL OR price <= $5::NUMERIC)`, [search, categoryId, brandId, minimumPrice, maximumPrice])
    

    return {
        products: result.rows,
        total: Number(countResult.rows[0].count)
    }
}

const findProductByIdAdmin = async (productId) => {
    const result = await pool.query(`SELECT * FROM products WHERE id =$1 `, [productId])
    return result.rows[0]
}

const findProductById = async (productId) => {
    const result = await pool.query(`SELECT * FROM products WHERE id =$1 AND is_available = true`, [productId])
    return result.rows[0]
}

const updateProduct = async (productId, productData) => {
    const allowedFields = [
        "name",
        "description",
        "price",
        "stock_quantity",
        "category_id",
        "brand_id",
        "image_path",
        "image_public_id"
    ]

    const fields = Object.keys(productData).filter(field => allowedFields.includes(field) && productData[field] !== undefined)
    
    const values = fields.map(field => productData[field])

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ")

    const query = `UPDATE products SET ${setClause} WHERE id = $${fields.length +1} RETURNING *`

    const result = await pool.query(query, [...values,productId])

    return result.rows[0]
}

const deleteProduct = async (productId) => {
    const result = await pool.query(`UPDATE products SET is_available = false WHERE id = $1 RETURNING *`, [productId])
    return result.rows[0]
}

const restoreProduct = async (productId) => {
    const result = await pool.query(
        `UPDATE products SET is_available = true WHERE id = $1 RETURNING *`,
        [productId]
    )

    return result.rows[0]
}

module.exports = {createProduct, findCategoryById, findBrandById, findName, getAllProducts, getAllProductsAdmin, findProductById, findProductByIdAdmin, updateProduct, deleteProduct, restoreProduct, getProductsForSitemap}