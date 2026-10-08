import { requireAuth } from "./auth.js"
import { getOrders } from "./api.js"
import { setupNavigation } from "./navigation.js"

setupNavigation()
requireAuth()

const orderList = document.querySelector("#orders-list")
const ordersMessage = document.querySelector("#orders-message")

const loadOrders = async () => {
    try {
        const data = await getOrders()

        if(data.orders.length === 0) {
            ordersMessage.textContent = "You haven't placed any order yet."

            return
        }

        data.orders.forEach((order) => {
            const orderArticle = document.createElement("article")

            const orderHeading = document.createElement("h2")
            orderHeading.textContent = `Order #${order.id}`

            const orderStatus = document.createElement('p')
            orderStatus.textContent = `Status: ${order.status}`

            const orderTotal = document.createElement("p")
            orderTotal.textContent = `Total: ${order.total_amount} FCFA`

            const viewOrderLink = document.createElement("a")
            viewOrderLink.href = `order.html?id=${order.id}`
            viewOrderLink.textContent = "View order"

            orderArticle.appendChild(orderHeading)
            orderArticle.appendChild(orderStatus)
            orderArticle.appendChild(orderTotal)
            orderArticle.appendChild(viewOrderLink)

            orderList.appendChild(orderArticle)
        })

    } catch(error) {
        ordersMessage.textContent = error.response?.data?.message || "Unable to load orders."
    }
}

loadOrders()