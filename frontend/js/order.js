import { requireAuth } from "./auth.js"
import {getOrderById,cancelOrder} from "./api.js"
import { setupNavigation } from "./navigation.js"

setupNavigation()
requireAuth()

const params = new URLSearchParams(window.location.search)
const orderId = params.get("id")

const orderDetails = document.querySelector("#order-details")
const orderMessage = document.querySelector("#order-message")


const loadOrder = async () => {
    if(!orderId) {
        orderMessage.textContent = "Order ID is missing."
        return
    }

    try {
        const data = await getOrderById(orderId)

        const order = data.order
        


        const orderStatus = document.createElement("p")
        orderStatus.textContent  = `Status: ${order.status}`

        const orderTotal = document.createElement("p")
        orderTotal.textContent = `Total: ${order.total_amount} FCFA`

        const formattedDate = new Intl.DateTimeFormat("en-CM", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(order.created_at))

        const orderDate = document.createElement("p")
        orderDate.textContent = `Date: ${formattedDate}`

        const itemsHeading = document.createElement("h2")
        itemsHeading.textContent = "Items"

        const itemsList = document.createElement("ul")

        order.items.forEach((item) => {
            const itemElement = document.createElement("li")

            const itemImage = document.createElement("img")
            itemImage.src = item.image_path
            itemImage.alt = item.product_name

            const itemInfo = document.createElement("p")
            itemInfo.textContent = `${item.product_name} - ${item.quantity} * ${item.price_at_purchase} FCFA`

            itemElement.appendChild(itemImage)
            itemElement.appendChild(itemInfo)

            itemsList.appendChild(itemElement)
        })

        const shipmentHeading = document.createElement("h2")
        shipmentHeading.textContent = "Delivery Information"

        const recipientName = document.createElement("p")
        recipientName.textContent = `Recipient: ${order.shipment.recipient_name}`

        const phoneNumber = document.createElement("p")
        phoneNumber.textContent = `Phone: ${order.shipment.phonenumber}`

        const address = document.createElement("p")
        address.textContent = `Address: ${order.shipment.address}`

        const shipmentStatus = document.createElement("p")
        shipmentStatus.textContent = `Delivery status: ${order.shipment.status}`

        const refundInfo = document.createElement("p")

        if(data.refund) {
            refundInfo.textContent = `Refund status: ${data.refund.status}`
        }

        const cancelButton = document.createElement("button")
        cancelButton.type = "button"
        cancelButton.textContent = "Cancel Order"

        const payButton = document.createElement("button")
        payButton.type = "button"
        payButton.textContent = "Pay for Order"

        if(order.status === "pending") {
            orderDetails.appendChild(payButton)

            payButton.addEventListener("click", () => {
                window.location.href = `payment.html?id=${order.id}`
            })
        }


        if(order.status === "pending" || order.status === "paid") {
            orderDetails.appendChild(cancelButton)

            cancelButton.addEventListener("click", async () => {
                const confirmed = window.confirm("Are you sure want to cancel this order?")

                if(!confirmed) return

                cancelButton.disabled = true
                cancelButton.textContent = "Cancelling..."

                try {
                    const data = await cancelOrder(orderId)


                    order.status = data.order.status

                    cancelButton.remove()
                    payButton.remove()

                    orderStatus.textContent = `Status: ${order.status}`

                    if(data.refund) {
                        refundInfo.textContent = `Refund status: ${data.refund.status}`
                        orderDetails.appendChild(refundInfo)
                    }

                } catch (error) {
                    cancelButton.disabled = false
                    cancelButton.textContent = "Cancel Order"


                    orderMessage.textContent = error.response?.data?.message || "Unable to cancel order"
                }
            })
        }

        orderDetails.appendChild(orderStatus)
        orderDetails.appendChild(orderTotal)
        orderDetails.appendChild(orderDate)
        orderDetails.appendChild(itemsHeading)
        orderDetails.appendChild(itemsList)
        orderDetails.appendChild(shipmentHeading)
        orderDetails.appendChild(recipientName)
        orderDetails.appendChild(phoneNumber)
        orderDetails.appendChild(address)
        orderDetails.appendChild(shipmentStatus)

        if(data.refund) {
            orderDetails.appendChild(refundInfo)
        }
        
    } catch (error) {
        orderMessage.textContent = error.response?.data?.message || "Unable to load order."
    }
}

loadOrder()