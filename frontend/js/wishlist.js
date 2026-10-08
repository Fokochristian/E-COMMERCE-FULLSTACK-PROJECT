import { getWishlist, removeFromWishlist } from "./api.js"
import { setupNavigation } from "./navigation.js"
import { requireAuth } from "./auth.js"

const wishlistList = document.querySelector("#wishlist-list")
const wishlistTemplate = document.querySelector("#wishlist-product-template")
const wishlistError = document.querySelector("#wishlist-error")

const loadWishlist = async () => {
    try {
        const data = await getWishlist()

        wishlistList.innerHTML = ""

        if(data.items.length === 0) {
            const emptyMessage = document.createElement("p")
            emptyMessage.textContent = "Your wishlist is empty"
            wishlistList.appendChild(emptyMessage)
            return
        }

        data.items.forEach((product) => {
            const wishlistProduct = wishlistTemplate.content.cloneNode(true)

            wishlistProduct.querySelector(".wishlist-product-name").textContent = product.name

            wishlistProduct.querySelector(".wishlist-product-image").src = product.image_path

            wishlistProduct.querySelector(".wishlist-product-image").alt = product.name

            wishlistProduct.querySelector(".wishlist-product-price").textContent = `${product.price} FCFA`

            wishlistProduct.querySelector(".wishlist-product-brand").textContent = product.brand_name

            wishlistProduct.querySelector(".wishlist-product-category").textContent = product.category_name

            wishlistProduct.querySelector(".wishlist-product-stock").textContent = `Stock: ${product.stock_quantity}`

            wishlistProduct.querySelector(".wishlist-product-link").href = `product.html?id=${product.product_id}`

            const removeButton = wishlistProduct.querySelector(".wishlist-remove")

            removeButton.addEventListener("click", async () => {
                removeButton.disabled = true
                removeButton.textContent = "Removing..."

                try {
                    await removeFromWishlist(product.product_id)

                    await loadWishlist()
                } catch (error) {
                    console.error(error)
                    removeButton.disabled = false
                    removeButton.textContent = "Remove from wishlist"
                }
            } )

            wishlistList.appendChild(wishlistProduct)
        })
    } catch(error) {
        console.error(error)

        wishlistError.textContent = "Unable  to load your wishlist. Please try again"
    }
}

const initializerWishlist = async () => {
    setupNavigation()
    requireAuth()
    await loadWishlist()
}

initializerWishlist()