const {getBrands, addBrands, editBrand} = require("../services/brandService")
const {StatusCodes} = require("http-status-codes")
const {validateBrandName} = require("../validators/brandValidator")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")
const {BadRequestError} = require("../errors/index")

const getAllBrands = async (req, res) => {
    const brands = await getBrands()

    return res.status(StatusCodes.OK).json({success: true, brands})
}

const createBrand = async (req, res) => {
    const {name} = req.body || {}
    const validation = validateBrandName(name || {})

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const brand = await addBrands(name)

    return res.status(StatusCodes.CREATED).json({success: true, message: "Brand created successfully", brand})
}

const updateBrand = async ( req, res ) => {
    const {brandId} = req.params
    const {name} = req.body || {}

    const idValidation = validatePositiveIntegerParam(brandId, "Brand ID")

    if(!idValidation.valid) {
        throw new BadRequestError(idValidation.error)
    }

    const validation = validateBrandName(name)

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const brand = await editBrand(brandId, name)

    return res.status(StatusCodes.OK).json({success: true, message: " Brand updated succesfully", brand})
}

module.exports = { getAllBrands, updateBrand, createBrand}