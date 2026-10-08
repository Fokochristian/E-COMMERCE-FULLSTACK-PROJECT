const pool = require("../config/db")

const {getShipmentStatusForUpdate, updateShipmentStatus, getAllShipments} = require("../models/shipmentModel")
const {getOrderStatusForUpdate, updateOrderStatus} = require("../models/orderModel")
const {BadRequestError, NotFoundError} = require("../errors/index")


const updateShipmentStatusAdmin = async (shipmentId, status) => {
    const client = await pool.connect()

    try {
        await client.query("BEGIN")
        
        const currentShipment = await getShipmentStatusForUpdate(client, shipmentId)

        if(!currentShipment) {
            throw new NotFoundError(`No shipment found with ID: ${shipmentId}`)
        }

        const allowedTransitions = {pending: ["shipped"], shipped: ["delivered"], delivered: [], cancelled: []}

        if(currentShipment.status !== status) {
            if(!allowedTransitions[currentShipment.status].includes(status)) {
                throw new BadRequestError(`Cannot change shipment status from ${currentShipment.status} to ${status}`)
            }
        }

        const currentOrder = await getOrderStatusForUpdate(client, currentShipment.order_id)

        if(!currentOrder) {
            throw new NotFoundError(`No order found with ID: ${currentShipment.order_id}`)
        }

        if(status === "shipped" && currentOrder.status !== "paid") {
            throw new BadRequestError(`Shipment cannot be shipped because order is ${currentOrder.status}`)
        }

        if(status === "delivered" && currentOrder.status !== "shipped") {
            throw new BadRequestError(`Shipment cannot be delivered because order is ${currentOrder.status}`)
        }

        const updatedShipment = await updateShipmentStatus(client, shipmentId, status)

        let updatedOrder = currentOrder

        if(status === "shipped") {
            updatedOrder =  await updateOrderStatus(client, currentShipment.order_id, "shipped")
        }

        if(status === "delivered") {
            updatedOrder = await updateOrderStatus(client, currentShipment.order_id, "delivered")
        }

        await client.query("COMMIT")

        return {
            shipment: updatedShipment,
            order: updatedOrder
        }
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

const getAllShipmentsAdmin = async (status, page, limit) => {
    const shipments = await getAllShipments(status, page, limit)

    return shipments
}



module.exports = {updateShipmentStatusAdmin, getAllShipmentsAdmin}