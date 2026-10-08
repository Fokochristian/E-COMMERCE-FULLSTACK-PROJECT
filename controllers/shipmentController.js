const {updateShipmentStatusAdmin, getAllShipmentsAdmin} = require("../services/shipmentService")
const {BadRequestError} = require("../errors/index")
const {StatusCodes} = require("http-status-codes")
const {validateShipmentStatus} = require("../validators/shipmentValidator")
const {validatePositiveIntegerParam} = require("../validators/paramsValidator")


const updateShipmentStatusByAdmin = async (req, res) => {
    const {shipmentId} = req.params
    const {status} = req.body || {}
    const validation = validateShipmentStatus(status || {})
    const idValidation = validatePositiveIntegerParam(shipmentId, "Shipment ID")

    if(!idValidation.valid) {
        throw new BadRequestError(idValidation.error)
    }

    if(!validation.valid) {
        throw new BadRequestError(validation.errors.join(", "))
    }

    const result = await updateShipmentStatusAdmin(shipmentId, status)

    return res.status(StatusCodes.OK).json({success: true, message: "Shipment status updated successfully", shipment: result.shipment, order: result.order})
}

const getAllShipmentsByAdmin = async (req, res) => {
    const {
        status = null,
        page = 1,
        limit = 25
    } = req.query

    const shipments = await getAllShipmentsAdmin(
        status,
        Number(page),
        Number(limit)
    )

    return res.status(StatusCodes.OK).json({
        success: true,
        ...shipments
    })
}

module.exports = {updateShipmentStatusByAdmin, getAllShipmentsByAdmin}