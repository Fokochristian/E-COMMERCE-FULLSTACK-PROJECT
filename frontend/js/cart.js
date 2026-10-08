import { requireAuth } from "./auth.js"
import { setupNavigation } from "./navigation.js"
import { getcart, updateCartItem, removeCartItem } from "./api.js"

requireAuth()
setupNavigation()

const cartItemsContainer = document.querySelector("#cart-items")

const cartTotal = document.querySelector("#cart-total")

const checkoutLink = document.querySelector("#checkout-link")

const showEmptyCart = () => {
    cartItemsContainer.innerHTML = ""

    cartTotal.textContent = ""

    checkoutLink.style.display = "none"

    const emptyMessage = document.createElement("p")
    emptyMessage.textContent = "Your cart is empty."

    cartItemsContainer.appendChild(emptyMessage)

    const continueShoppingLink = document.createElement("a")
    continueShoppingLink.href = "index.html"
    continueShoppingLink.textContent = "Continue shopping"

   

    cartItemsContainer.appendChild(continueShoppingLink)
}

const loadCart = async () => {
    const data = await getcart()

    checkoutLink.style.display = "inline"

    cartTotal.textContent = `Total: ${data.total.total} FCFA`
    
    
    if (data.cartItems.length === 0) {
        showEmptyCart()
        return
    }

    data.cartItems.forEach((item) => {
        const cartItem = document.createElement("article")

        const productImage = document.createElement("img")
        productImage.src = item.image_path
        productImage.alt = item.name

        const productName = document.createElement("h2")
        productName.textContent = item.name

        const productPrice = document.createElement("p")
        productPrice.textContent = `${item.price} FCFA`

        const quantityContainer = document.createElement("div")

        const quantityInput = document.createElement("input")
        quantityInput.type = "number"
        quantityInput.min = "1"
        quantityInput.value = item.quantity
        quantityInput.setAttribute("aria-label", `Quantity for ${item.name}`)

        const decreaseButton = document.createElement("button")
        decreaseButton.type = "button"
        decreaseButton.textContent = "-"

        decreaseButton.addEventListener("click", async () => {
            if(item.quantity <= 1) {
                return
            }

            const newQuantity = item.quantity - 1

            try {
                await updateCartItem(item.cart_item_id, newQuantity)

                quantityInput.value = newQuantity
                item.quantity = newQuantity

                const updatedCart = await getcart()
                cartTotal.textContent = `Total: ${updatedCart.total.total} FCFA`
            } catch (error) {
                console.error(error)
            }
        })

        quantityInput.addEventListener("change", async () => {
            const newQuantity = Number(quantityInput.value)

            if(!Number.isInteger(newQuantity) || newQuantity < 1) {
                quantityInput.value = item.quantity
                return
            }

            try {
                await updateCartItem(item.cart_item_id, newQuantity)

                item.quantity = newQuantity

                const updatedCart = await getcart()
                cartTotal.textContent = `Total: ${updatedCart.total.total} FCFA`
            } catch (error) {
                console.error(error)

                quantityInput.value = item.quantity
            }
        })

       

        const increaseButton = document.createElement("button")
        increaseButton.type = "button"
        increaseButton.textContent = "+"

        increaseButton.addEventListener("click", async () => {
            const newQuantity = item.quantity + 1

            try {
                await updateCartItem(item.cart_item_id, newQuantity)

                quantityInput.value = newQuantity
                item.quantity = newQuantity

                const updatedCart = await getcart()
                cartTotal.textContent = `Total: ${updatedCart.total.total} FCFA`
            } catch (error) {
                console.error(error)
            }
        })

        const removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.textContent = "Remove"

        removeButton.addEventListener("click", async () => {
            try {
                await removeCartItem(item.cart_item_id)

                cartItem.remove()

                const remainingItems = cartItemsContainer.querySelectorAll("article")

                if(remainingItems.length === 0) {
                    showEmptyCart()
                }
            } catch (error) {
                console.error(error)
            }
        })

        quantityContainer.appendChild(decreaseButton)
        quantityContainer.appendChild(quantityInput)
        quantityContainer.appendChild(increaseButton)


        cartItem.appendChild(productImage)
        cartItem.appendChild(productName)
        cartItem.appendChild(productPrice)
        cartItem.appendChild(quantityContainer)
        cartItem.appendChild(removeButton)

        cartItemsContainer.appendChild(cartItem)
    })

}

loadCart()