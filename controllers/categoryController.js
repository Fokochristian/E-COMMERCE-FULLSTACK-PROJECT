const {getCategories, addCategories, editCategory} = require("../services/categoryService")
const {StatusCodes} = require("http-status-codes")
const {validateCategoryName} = require("../validators/categoryValidator")
const {BadRequestError} = require("../errors/index")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")


const getAllCategories = async (req, res) => {
    const categories = await getCategories()

    return res.status(StatusCodes.OK).json({success: true, categories})
}

const createCategory = async (req, res) => {
    const {name} = req.body || {}
    const validation = validateCategoryName(name)

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const category = await addCategories(name)

    return res.status(StatusCodes.CREATED).json({success: true, message: "Category created successfully", category})
}

const updateCategory = async (req, res) => {
    const {categoryId} = req.params
    const {name} = req.body || {}

    const idValidation = validatePositiveIntegerParam(categoryId, "Category ID")

    if(!idValidation.valid) {
        throw new BadRequestError(idValidation.error)
    }

    const validation = validateCategoryName(name)

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const category = await editCategory(categoryId, name)

    return res.status(StatusCodes.OK).json({success: true, message: "Category updated succeesfully", category})
}

module.exports ={ getAllCategories, createCategory, updateCategory}
