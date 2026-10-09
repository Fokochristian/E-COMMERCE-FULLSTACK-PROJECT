const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, ConflictError } = require("../errors/index");
const { validateProduct, validateProductUpdate } = require("../validators/productValidator");
const {validateProductQuery} = require("../validators/productQueryValidator")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")
const cloudinary = require("../config/cloudinary")
const {
  createProduct: createProductInDB,
  getAllProducts: getAllProductsInDB,
  updateProduct: updateProductInDB,
  deleteProduct: deleteProductInDB,
  getAllProductsAdmin: getAllProductsAdminInDB,
  restoreProduct: restoreProductInDB,
  findCategoryById,
  findBrandById,
  findProductById,
  findProductByIdAdmin,
  findName,
  getProductsForSitemap
} = require("../models/productModel")

const createProduct = async (req, res) => {
  let productCreated = false

  try {
    const body = req.body || {}

    const productData = { 
      ...body, 
      price: body.price !== undefined && body.price !== "" 
          ? Number(body.price) 
          : body.price,
      stock_quantity: body.stock_quantity !== undefined && body.stock_quantity !== "" 
          ? Number(body.stock_quantity) 
          : body.stock_quantity,
      category_id: body.category_id !== undefined && body.category_id !== "" 
          ? Number(body.category_id) 
          : body.category_id,
      brand_id: body.brand_id !== undefined && body.brand_id !== "" 
          ? Number(body.brand_id) 
          : body.brand_id
    }

    const validation = validateProduct(productData)
    const validationErrors = { ...validation.errors }

    if(!req.file) {
      validationErrors.image = "Product image must be provided"
    }

    if(Object.keys(validationErrors).length > 0) {
      throw new BadRequestError("Validation failed", validationErrors)
    }

    const cleanName = productData.name.trim()
    const cleanDescription = productData.description.trim()

    const existingName = await findName(cleanName)

    if (existingName) {
      throw new ConflictError(`Product with name: ${productData.name} already exists`)
    }

    const existingCategory = await findCategoryById(productData.category_id)

    if (!existingCategory) {
      throw new BadRequestError("No category found with that Id")
    }

    const existingBrand = await findBrandById(productData.brand_id)

    if (!existingBrand) {
      throw new BadRequestError("No brand found with that Id")
    }

    const newProduct = await createProductInDB({
      name: cleanName,
      description: cleanDescription,
      price: productData.price,
      stock_quantity: productData.stock_quantity,
      category_id: productData.category_id,
      brand_id: productData.brand_id,
      image_path: req.file.cloudinary.url,
      image_public_id: req.file.cloudinary.publicId
    })

    productCreated = true

    return res
      .status(StatusCodes.CREATED)
      .json({
        success: true,
        message: "Product created successfully",
        newProduct
      })

  } catch (error) {
    if(!productCreated && req.file?.cloudinary?.publicId) {
      await cloudinary.uploader.destroy(req.file.cloudinary.publicId)
    }

    throw error
  }
}



const getAllProducts = async (req, res) => {
  const validation = validateProductQuery(req.query)

  if(!validation.valid) {
    throw new BadRequestError(validation.errors.join(", "))
  }

  const {search = "", category, brand, minPrice, maxPrice, page = "1", limit = "12"} = req.query
  const cleanSearch = search.trim()
  const categoryId = category !== undefined ? Number(category) : null
  const brandId = brand !== undefined ? Number(brand) : null
  const minimumPrice = minPrice !== undefined ? Number(minPrice) : null
  const maximumPrice = maxPrice !== undefined ? Number(maxPrice) : null
  const pageNumber = Number(page)
  const limitNumber = Number(limit)
  const {products, total} =  await getAllProductsInDB(cleanSearch, categoryId, brandId, minimumPrice, maximumPrice, pageNumber, limitNumber)
  const totalPages = Math.ceil(total / limitNumber)

  return res.status(StatusCodes.OK).json({success: true, allProducts: products, pagination: {
    page: pageNumber, limit: limitNumber, total, totalPages
  }})
}

const getSitemapProducts = async (req, res) => {
    const products = await getProductsForSitemap()

    res.status(200).json({
        success: true,
        products
    })
}

const getAllProductsAdmin = async (req, res) => {
  const validation = validateProductQuery(req.query)

  if(!validation.valid) {
    throw new BadRequestError(validation.errors.join(", "))
  }
  
  const {search = "", category, brand, minPrice, maxPrice, page = "1", limit = "10"} = req.query
  const cleanSearch = search.trim()
  const categoryId = category !== undefined ? Number(category) : null
  const brandId = brand !== undefined ? Number(brand) : null
  const minimumPrice = minPrice !== undefined ? Number(minPrice) : null
  const maximumPrice = maxPrice !== undefined ? Number(maxPrice) : null
  const pageNumber = Number(page)
  const limitNumber = Number(limit)
  const {products, total} =  await getAllProductsAdminInDB(cleanSearch, categoryId, brandId, minimumPrice, maximumPrice, pageNumber, limitNumber)
  const totalPages = Math.ceil(total / limitNumber)
  
  return res.status(StatusCodes.OK).json({success: true, allProducts: products, pagination: {
    page: pageNumber, limit: limitNumber, total, totalPages
  }})
}

const getSingleProductAdmin = async (req, res) => {
  const {id} = req.params

  const validation = validatePositiveIntegerParam(id, "Product ID")

  if(!validation.valid) {
    throw new BadRequestError(validation.error)
  }

  const product =  await findProductByIdAdmin(id)

  if(!product) {
    throw new NotFoundError(`No product found with ID: ${id}`)
  }

  return res.status(StatusCodes.OK).json({success: true, product})
}

const getSingleProduct = async (req, res) => {
  const {id} = req.params

  const validation = validatePositiveIntegerParam(id, "Product ID")

  if(!validation.valid) {
    throw new BadRequestError(validation.error)
  }

  const product =  await findProductById(id)

  if(!product) {
    throw new NotFoundError(`No product found with ID: ${id}`)
  }

  return res.status(StatusCodes.OK).json({success: true, product})
}

const updateProduct = async (req, res) => {
  const {id} = req.params

  const idValidation = validatePositiveIntegerParam(id, "Product ID")

  if(!idValidation.valid) {
    throw new BadRequestError(idValidation.error)
  }
 
  let productUpdated = false

  try {

    const body = req.body || {}

    if(Object.keys(body).length === 0 && !req.file) {
      throw new BadRequestError("Please provide at least one field to update")
    }

    const productData = { 
    ...body, 
    price: body.price !== undefined && body.price !== "" 
        ? Number(body.price) 
        : body.price,

    stock_quantity: body.stock_quantity !== undefined && body.stock_quantity !== "" 
        ? Number(body.stock_quantity) 
        : body.stock_quantity,

    category_id: body.category_id !== undefined && body.category_id !== "" 
        ? Number(body.category_id) 
        : body.category_id,

    brand_id: body.brand_id !== undefined && body.brand_id !== "" 
        ? Number(body.brand_id) 
        : body.brand_id
}
    const validation = validateProductUpdate(productData)

    if(!validation.valid) {
      throw new BadRequestError("Validation failed", validation.errors)
    }

    const product =  await findProductByIdAdmin(id)

    if(!product) {
      throw new NotFoundError(`No product found with ID: ${id}`)
    }

    if(productData.name !== undefined) {
      const cleanName = req.body.name.trim()

      const existingProduct = await findName(cleanName, id)

      if(existingProduct) {
        throw new ConflictError(`Product with name ${cleanName} already exists`)
      }

      productData.name = cleanName
    }
    
    if(productData.description !== undefined) {
      productData.description = req.body.description.trim()
    }

    if(productData.category_id !== undefined) {
      const category =await findCategoryById(productData.category_id)

      if(!category) {
        throw new BadRequestError("No category found with that ID")
      }
    }

    if(productData.brand_id !== undefined) {
      const brand = await findBrandById(productData.brand_id)

      if(!brand) {
        throw new BadRequestError("No brand found with that ID")
      }
    }

    if(req.file) {
      productData.image_path = req.file.cloudinary.url
      productData.image_public_id = req.file.cloudinary.publicId
    }

    const updatedProduct = await updateProductInDB(id, productData)

    productUpdated = true

    if (req.file && product.image_public_id) {
      await cloudinary.uploader.destroy(product.image_public_id).catch(() => {})
    }

    return res.status(StatusCodes.OK).json({success: true, message: "Product updated successfully", updatedProduct})

  } catch (error) {
   if (!productUpdated && req.file?.cloudinary?.publicId) {
      await cloudinary.uploader.destroy(req.file.cloudinary.publicId)
    }

    
    throw error
  }

}

const deleteProduct = async (req, res) => {
  const {id} = req.params

  const validation = validatePositiveIntegerParam(id, "Product ID")

  if(!validation.valid) {
    throw new BadRequestError(validation.error)
  }
  
  const existingProduct = await findProductByIdAdmin(id)

  if(!existingProduct) {
    throw new NotFoundError(`No product with ID ${id}`)
  }

  const unavailableProduct = await deleteProductInDB(id)

  return res.status(StatusCodes.OK).json({success: true, message: "Product marked as unavailable", unavailableProduct})
}

const restoreProduct = async (req, res) => {
  const {id} = req.params

  const validation = validatePositiveIntegerParam(id, "Product ID")

  if(!validation.valid) {
    throw new BadRequestError(validation.error)
  }

  const existingProduct = await findProductByIdAdmin(id)

  if(!existingProduct) {
    throw new NotFoundError(`No product with ID ${id}`)
  }

  const availableProduct = await restoreProductInDB(id)

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Product marked as available",
    availableProduct
  })
}

module.exports = { createProduct, getAllProducts, getAllProductsAdmin,getSingleProductAdmin, getSingleProduct, updateProduct, deleteProduct, restoreProduct, getSitemapProducts };
