import { requireAuth } from "./auth.js"
import {setupNavigation} from "./navigation.js"
import { checkout } from "./api.js"


requireAuth()
setupNavigation()

const checkoutForm = document.querySelector("#checkout-form")
const checkoutMessage = document.querySelector("#checkout-message")

const recipientNameError = document.querySelector("#recipient-name-error")
const phoneNumberError = document.querySelector("#phoneNumber-error")
const deliveryAddressError = document.querySelector("#delivery-address-error")

const displayCheckoutErrors = (data) => {
    const errors = data.errors

    if(errors?.recipient_name) {
        recipientNameError.textContent = errors.recipient_name
    }

    if(errors?.phoneNumber) {
        phoneNumberError.textContent = errors.phoneNumber
    }

    if(errors?.address) {
        deliveryAddressError.textContent = errors.address
    }
}

const clearCheckoutErrors = () => {
    recipientNameError.textContent = ""
    phoneNumberError.textContent = ""
    deliveryAddressError.textContent = ""
}

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    checkoutMessage.textContent = ""

    clearCheckoutErrors()

    const recipientName = document.querySelector("#recipient-name").value
    const phoneNumber = document.querySelector("#phone-number").value
    const address = document.querySelector("#address").value

    try {
        const data = await checkout(
            recipientName,
            phoneNumber,
            address
        )
        
        window.location.href = `order-success.html?id=${data.order.id}`
    } catch (error) {
        const data = error.response?.data

        if(data?.errors) {
            displayCheckoutErrors(data)
        } else {
            checkoutMessage.textContent = "Checkout failed"
        }
        
    }
})

document.querySelector("#recipient-name").addEventListener("input", () => {
    recipientNameError.textContent = ""
})

document.querySelector("#phone-number").addEventListener("input", () => {
    phoneNumberError.textContent = ""
})

document.querySelector("#address").addEventListener("input", () => {
    deliveryAddressError.textContent = ""
})

