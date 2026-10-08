import { requireAuth } from "./auth.js"
import { setupNavigation } from "./navigation.js"
import { getOrderById, createPayment } from "./api.js"

requireAuth()
setupNavigation()

const params = new URLSearchParams(window.location.search)
const orderId = params.get("id")


const paymentOrderId = document.querySelector("#payment-order-id")
const paymentMessage = document.querySelector("#payment-message")
const paymentForm = document.querySelector("#payment-form")

const paymentMethodError = document.querySelector("#paymentMethod-error")

const phoneNumberError =document.querySelector("#phoneNumber-error")

const displayPaymentError = (data) => {
    const errors = data.errors

    if(errors?.paymentMethod) {
        paymentMethodError.textContent = errors.paymentMethod
    }

    if(errors?.phoneNumber) {
        phoneNumberError.textContent = errors.phoneNumber
    }

}

const clearPaymentError = () => {
    paymentMethodError.textContent = ""
    phoneNumberError.textContent = ""
}

const loadOrder = async () => {
    if(!orderId) {
        paymentMessage.textContent = "Order ID is missing"
        return
    }

    try {
        const data = await getOrderById(orderId)
        const order = data.order

        paymentOrderId.textContent = `Order #${order.id} - Total: ${order.total_amount} FCFA`

        if(order.status !== "pending") {
            paymentForm.style.display = "none"
            paymentMessage.textContent = `This order has already been ${order.status}.`
        }
    } catch (error) {
        paymentMessage.textContent = error.response?.data?.message ||  "Unable to load order."
    }
}

loadOrder()


const submitButton = paymentForm.querySelector("button[type='submit']")

paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    paymentMessage.textContent = ""

    clearPaymentError()

    const paymentMethod = document.querySelector("#payment-method").value
    const phoneNumber = document.querySelector("#payment-phone").value

    
    submitButton.disabled = true
    submitButton.textContent = "Initiating payment..."

    try {
        await createPayment(orderId, paymentMethod, phoneNumber)

        paymentMessage.textContent = "Payment initiated. Please complete the payment on your phone."
        

        submitButton.textContent = "Payment pending..."

        startPaymentStatusPolling()
    } catch (error) {
        const data = error.response?.data

        if(data?.errors) {
            displayPaymentError(data)

        } else {
            paymentMessage.textContent = error.response?.data?.message || "Unable to initiate payment"

            
        }
        submitButton.disabled = false
        submitButton.textContent = "Try again" 
    }
})


const checkPaymentStatus = async () => {
    const data = await getOrderById(orderId)
    const order = data.order

    return {
        orderStatus: order.status,
        paymentStatus: order.payment?.status || null
    }
}

let pollingActive = false

const startPaymentStatusPolling = () => {
    if (pollingActive) return

    pollingActive = true

    const intervalId = setInterval(async () => {
        try {
            const status = await checkPaymentStatus()


            if(status.orderStatus === "paid" || status.paymentStatus === "successful") {
                clearInterval(intervalId)
                clearTimeout(timeoutId)
                pollingActive = false

                paymentMessage.textContent = "Payment successful"
                submitButton.textContent = "Payment completed"

                setTimeout(() => {
                    window.location.href = "orders.html"
                }, 1500)

                return
            }

            if (status.paymentStatus === "failed") {
                clearInterval(intervalId)
                clearTimeout(timeoutId)
                pollingActive = false

                paymentMessage.textContent = "Payment failed. You can try again"
                submitButton.textContent = "Try again"
                submitButton.disabled = false

                return
            }

            if (status.orderStatus === "cancelled") {
                clearInterval(intervalId)
                clearTimeout(timeoutId)
                pollingActive = false

                paymentMessage.textContent = "This order has been cancelled"
                submitButton.textContent = "Back to my Orders"
                submitButton.disabled = false
                submitButton.type = "button"

                submitButton.onclick = () => {
                    window.location.href = "orders.html"
                }

                return
            }
        } catch (error) {
            console.error("Payment status check failed:", error)
        }
    }, 5000)

    const timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        pollingActive = false
        paymentMessage.textContent = "Payment status could not be confirmed. Please check your order later"

        submitButton.disabled = false
        submitButton.textContent = "Check My Orders"
        submitButton.type = "button"

        submitButton.onclick = () => {
            window.location.href = "orders.html"
        }
    }, 120000)
}

document.querySelector("#payment-method").addEventListener("input", () => {
    paymentMethodError.textContent = ""
})

document.querySelector("#payment-phone").addEventListener("input", () => {
    phoneNumberError.textContent = ""
})

