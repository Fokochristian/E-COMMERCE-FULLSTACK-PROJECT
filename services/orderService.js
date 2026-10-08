const pool = require("../config/db");
const {SHIPPING_COST} = require("../config/shippingCost.js")
const {createShipment, getShipmentByOrderId, updateShipmentStatus, getShipmentByOrderIdForUpdate} = require("../models/shipmentModel.js")
const {getCartByUserId, getCartTotal, clearCartItems} = require("../models/cartModel.js")
const {BadRequestError, NotFoundError} = require("../errors/index.js")
const {createOrder, createOrderItem, reduceProductStock, getOrdersByUserId, getOrderById, getAllOrders, updateOrderStatus, getOrderStatus, restoreOrderStock, getOrderStatusForUpdate, getOrderByIdForAdmin} =  require("../models/orderModel.js")
const {getSuccessfulPaymentByOrderId, getPaymentsByOrderId} = require("../models/paymentModel.js")
const {createRefundAttempt, processKpayRefund} = require("../services/refundService.js")

const placeOrder = async (userId, recipientName, phoneNumber, address) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cartItems = await getCartByUserId(userId, client)
    
    if(cartItems.length === 0) {
      throw new BadRequestError("Cart is empty")
    }

    const {total} = await getCartTotal(userId, client)

    const orderTotal = Number(total) + SHIPPING_COST


    const order =  await createOrder(client, userId, orderTotal)

    for (const item of cartItems) {
      await createOrderItem(client, order.id, item.product_id, item.quantity, item.price, item.image_path)

      const updatedProduct = await reduceProductStock(client, item.product_id, item.quantity)

      if (!updatedProduct) {
        throw new BadRequestError(`Not enough stock for product: ${item.name}`)
      }

    }

    await createShipment(client, order.id, recipientName, phoneNumber, address, SHIPPING_COST)

    await clearCartItems(client, userId)

    await client.query("COMMIT");

    return order

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release()
  }
};

const getOrders = async (userId) => {
  const orders = await getOrdersByUserId(userId)

  return orders
}

const getMyOrder = async (userId, orderId) => {
  const order = await getOrderById(userId, orderId)

  if(!order) {
    throw new NotFoundError(`No order found with ID: ${orderId}`)
  }

  const shipment = await getShipmentByOrderId(orderId)

  const payments = await getPaymentsByOrderId(orderId)
  const latestPayment = payments[0] || null

  const payment = latestPayment ? {
    id: latestPayment.id,
    status: latestPayment.status,
    payment_method: latestPayment.payment_method,
    transaction_reference: latestPayment.transaction_reference,
    created_at: latestPayment.created_at
  } : null

  return {
    ...order,
    shipment,
    payment
  }
}

const getAllOrdersAdmin = async (status, page, limit) => {
  const orders = await  getAllOrders(status, page, limit)

  return orders
}

const getOrderByAdmin = async (orderId) => {
  const order = await getOrderByIdForAdmin(orderId)

  if(!order) {
    throw new NotFoundError(`No order found with ID: ${orderId}`)
  }

  return {order}
}

const updateOrderStatusAdmin = async (orderId, status) => {
    const currentOrder = await getOrderStatus(orderId)

  if(!currentOrder) {
    throw new NotFoundError(`No order found with ID: ${orderId}`)
  }

  const allowedTransitions = {
    pending: [ "cancelled"],
    paid: ["cancelled"]
  }

  if(currentOrder.status !== status) {
    
    if(!allowedTransitions[currentOrder.status]?.includes(status)) { 
      throw new BadRequestError( `Cannot change order status from ${currentOrder.status} to ${status}` ) 
    }
    
  }

  if(status === "cancelled") {
    return await cancelOrderTransaction(orderId)
  }

  const order = await updateOrderStatus(pool,orderId, status)

  return order
}

const cancelOrderTransaction = async (orderId) => {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const currentOrder = await getOrderStatusForUpdate(client, orderId)
    
    if(!currentOrder) {
      throw new NotFoundError(`No order found with ID: ${orderId}`)
    }

    const currentShipment = await getShipmentByOrderIdForUpdate(client, orderId)

    if(!currentShipment) {
      throw new NotFoundError(`No shipment found for order ID: ${orderId}`)
    }

    if(currentOrder.status === "cancelled") {
      await client.query("COMMIT")
      return {updatedOrder: currentOrder, shipment: currentShipment, refund: null}
    }

    if(currentOrder.status === "shipped" || currentOrder.status === "delivered") {
      throw new BadRequestError(`Order cannot be cancelled because it is already ${currentOrder.status}`)
    }

    const successfulPayment = await getSuccessfulPaymentByOrderId(client,orderId)

    let refund = null
    let providerPaymentId = null

    if(successfulPayment) {
      const refundData = await createRefundAttempt(client, successfulPayment.id, "Order cancelled")

      refund = refundData.refund
      providerPaymentId = refundData.providerPaymentId
    }

    await restoreOrderStock(client, orderId)

    const updatedOrder = await updateOrderStatus(client, orderId, "cancelled")

    const updatedShipment = await updateShipmentStatus(client, currentShipment.id, "cancelled")

    await client.query("COMMIT")

    if(refund && providerPaymentId) {
      const refundResult = await processKpayRefund (refund.id, providerPaymentId, refund.reason)

      return { updatedOrder, shipment: updatedShipment, refund: refundResult.refund, kpayRefund: refundResult.kpayRefund}
    }

    return {updatedOrder, shipment: updatedShipment, refund: null}


  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

const cancelOrder = async (userId,orderId) => {
  const order = await getOrderById(userId, orderId)

  if(!order) {
    throw new NotFoundError(`No order found with ID: ${orderId}`)
  }

  const result = await cancelOrderTransaction(orderId)

  return result
}



module.exports = { placeOrder, getOrders, getMyOrder, getAllOrdersAdmin, updateOrderStatusAdmin, cancelOrder, getOrderByAdmin }
