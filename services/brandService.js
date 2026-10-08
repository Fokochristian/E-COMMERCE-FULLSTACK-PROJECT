const {getAllBrands, createBrand, updateBrand, getSingleBrandByName, getBrandById} = require("../models/brandModel")

const {BadRequestError, NotFoundError, ConflictError} = require("../errors/index")


const getBrands = async () => {
    const brands = await getAllBrands()

    return brands
}

const addBrands = async (name) => {
    const existingBrand = await getSingleBrandByName(name)

    if(existingBrand) {
        throw new ConflictError(`Brand with Name ${name} already exists`)
    }

    const newBrand = await createBrand(name)

    return newBrand
}

const editBrand = async (brandId, name) => {
    const brand = await getBrandById(brandId)

    if(!brand) {
        throw new NotFoundError(`No brand with ID: ${brandId}`)
    }

    const existingBrand = await getSingleBrandByName(name, brandId)


    if(existingBrand) {
        throw new ConflictError(`Brand with Name ${name} already exists`)
    }

    const newBrand = await updateBrand(brandId, name)

    return newBrand
}

module.exports = { getBrands, addBrands, editBrand}