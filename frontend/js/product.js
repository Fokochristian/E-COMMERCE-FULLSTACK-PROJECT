import { getProductById, addToCart } from "./api.js"
import { setupNavigation } from "./navigation.js"



  

const params = new URLSearchParams(window.location.search)

const productId = params.get("id")

const productDetails = document.querySelector("#product-details")

const loadProduct = async () => {
    const product = await getProductById(productId)

    document.title = `${product.product.name} | Orxeva`

    const metaDescription = document.querySelector(
        'meta[name="description"]'
    )

    metaDescription.setAttribute(
        "content",
        product.product.description
    )

    const canonicalUrl = document.querySelector(
        'link[rel="canonical"]'
    )

    canonicalUrl.setAttribute(
        "href",
        `${window.location.origin}${window.location.pathname}?id=${productId}`
    )

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.product.name,
        "description": product.product.description,
        "image": [product.product.image_path],
        "offers": {
            "@type": "Offer",
            "price": Number(product.product.price),
            "priceCurrency": "XAF",
            "availability": product.product.stock_quantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "url": `${window.location.origin}${window.location.pathname}?id=${productId}`
        }
    }

    const productSchemaScript = document.createElement("script")

    productSchemaScript.type = "application/ld+json"

    productSchemaScript.textContent = JSON.stringify(productSchema)

    document.head.appendChild(productSchemaScript)

    const productName = document.createElement("h2")
    productName.textContent = product.product.name

    productDetails.appendChild(productName)

    const productImage = document.createElement("img")
    productImage.src = product.product.image_path
    productImage.alt = product.product.name

    productDetails.appendChild(productImage)

    const productDescription = document.createElement("p")
    productDescription.textContent = product.product.description

    productDetails.appendChild(productDescription)

    const productPrice = document.createElement("p")
    productPrice.textContent = `${product.product.price} FCFA`

    productDetails.appendChild(productPrice)

    const productStock = document.createElement("p")
    productStock.textContent = `Stock: ${product.product.stock_quantity}`
    productDetails.appendChild(productStock)

    const quantitylabel = document.createElement("label")
    quantitylabel.textContent = "Quantity"
    quantitylabel.setAttribute("for", "product-quantity")

    const quantityInput = document.createElement("input")
    quantityInput.type = "number"
    quantityInput.id = "product-quantity"
    quantityInput.name = "quantity"
    quantityInput.min = "1"
    quantityInput.value = "1"

    productDetails.appendChild(quantitylabel)
    productDetails.appendChild(quantityInput)

    const addToCartButton = document.createElement("button")
    addToCartButton.type = "button"
    addToCartButton.textContent = "Add to cart"

    productDetails.appendChild(addToCartButton)

    addToCartButton.addEventListener("click", async () => {
        addToCartButton.disabled = true
        addToCartButton.textContent = "Adding..."

        try {
            const quantity = Number(quantityInput.value)
        
            const data = await addToCart(productId, quantity)

            addToCartButton.textContent = "Added!"

            setTimeout(() => {
                addToCartButton.disabled = false
                addToCartButton.textContent = "Add to cart"
            }, 500)
            
        } catch (error) {
            addToCartButton.disabled = false
            addToCartButton.textContent = "Add to cart"


        }
    })


}

setupNavigation()
loadProduct()

