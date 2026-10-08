const { getAllCategories, createCategory, updateCategory, getSingleCategoryByName, getCategoryById} = require("../models/categoryModel")

const { BadRequestError, NotFoundError, ConflictError} = require("../errors/index")

const getCategories = async () => {
    const categories = await getAllCategories()

    return categories
}

const addCategories = async (name) => {
    const existingCategory = await getSingleCategoryByName(name)

    if(existingCategory) {
        throw new ConflictError(`Category with Name ${name} already exists`)
    }

    const newCategory = await createCategory(name)

    return newCategory

}

const editCategory = async (categoryId, name) => {
    const category = await getCategoryById(categoryId)

    if(!category) {
        throw new NotFoundError(`No category with ID: ${categoryId}`)
    }

    const existingCategory = await getSingleCategoryByName(name, categoryId)

    if(existingCategory) {
        throw new ConflictError(`Category with Name ${name} already exists`)
    }

    const newCategory = await updateCategory(categoryId, name)

    return newCategory
}

module.exports = {getCategories, addCategories, editCategory}