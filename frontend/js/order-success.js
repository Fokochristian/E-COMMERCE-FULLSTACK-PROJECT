import { setupNavigation } from "./navigation.js"
import { requireAuth } from "./auth.js"

setupNavigation()
requireAuth()

const params = new URLSearchParams(window.location.search)
const orderId = params.get("id")

const orderIdElement = document.querySelector("#order-id")
const viewOrderLink = document.querySelector("#view-order-link")
const payOrderLink = document.querySelector("#pay-order-link")

if(!orderId) {
    orderIdElement.textContent = "Order information is unavailable."
    viewOrderLink.style.display = "none"
    payOrderLink.style.display = "none"
} else {
    orderIdElement.textContent = `Order ID: ${orderId}`
    viewOrderLink.href = `order.html?id=${orderId}`
    payOrderLink.href = `payment.html?id=${orderId}`
}