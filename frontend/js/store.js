import { getProducts, addToCart, getCategories, getBrands, getWishlist, addToWishlist, removeFromWishlist } from "./api.js"
import { setupNavigation } from "./navigation.js"

const productList = document.querySelector('#product-list')
const productTemplate = document.querySelector('#product-card-template')
const productFilters = document.querySelector("#product-filters")
const productSearch = document.querySelector("#product-search")
const filterError = document.querySelector("#filter-error")
const pagination = document.querySelector("#pagination")
const resetFiltersButton = document.querySelector("#reset-filters")
const productsSection = document.querySelector("section[aria-labelledby='products-heading']")

let currentPage = 1
let wishlistProductIds = new Set()

const loadWishlist = async () => {
    const token = localStorage.getItem("token")

    if(!token) {
        return
    }

    try {
        const data = await getWishlist()

        wishlistProductIds = new Set(data.items.map((item) => item.product_id))

        
    } catch (error) {
        console.error("Failed to load wishlist:", error)
    }
}

const loadCategories = async () => {
    const data = await getCategories()

    const categoryFilter = document.querySelector("#category-filter")

    data.categories.forEach((category) => {
        const option = document.createElement("option")

        option.value = category.id
        option.textContent = category.name

        categoryFilter.appendChild(option)
    })
}

const loadBrands = async () => {
    const data = await getBrands()

    const brandFilter = document.querySelector("#brand-filter")

    data.brands.forEach((brand) => {
        const option = document.createElement("option")

        option.value = brand.id
        option.textContent = brand.name

        brandFilter.appendChild(option)
    })
}



const loadProducts = async (params = {}) => {
    const requestParams = {...params, page: currentPage}

    productList.innerHTML = `
        <div class="products-loader" aria-live="polite">
            <span class="loader-spinner"></span>
            <p>Loading products...</p>
        </div>
    `

    pagination.innerHTML = ""

    try {
        const data = await getProducts(requestParams)

        productList.innerHTML = ""

        if(data.allProducts.length === 0) {
            const emptyMessage = document.createElement("p")

            emptyMessage.textContent =
                "No Products found. Try adjusting your search or filters"

            productList.appendChild(emptyMessage)

            return
        }

        data.allProducts.forEach((product) => {
            const productCard = productTemplate.content.cloneNode(true)

            productCard.querySelector(".product-name").textContent = product.name

            productCard.querySelector(".product-image").src =
                product.image_path

            productCard.querySelector(".product-image").alt = product.name

            productCard.querySelector(".product-price").textContent =
                `${product.price} FCFA`

            productCard.querySelector(".product-brand").textContent =
                product.brand_name

            productCard.querySelector(".product-category").textContent =
                product.category_name

            productCard.querySelector(".product-stock").textContent =
                `Stock: ${product.stock_quantity}`

            productCard.querySelector(".product-link").href =
                `product.html?id=${product.id}`

            const addToCartButton =
                productCard.querySelector(".add-to-cart")

            const wishlistButton =
                productCard.querySelector(".wishlist-button")

            if(wishlistProductIds.has(product.id)) {
                wishlistButton.textContent = "Remove from wishlist"
            }

            wishlistButton.addEventListener("click", async () => {
                const token = localStorage.getItem("token")

                if(!token) {
                    window.location.href = "login.html"
                    return
                }

                const isWishlisted = wishlistProductIds.has(product.id)

                wishlistButton.disabled = true

                try {
                    if(isWishlisted) {

                        await removeFromWishlist(product.id)

                        wishlistProductIds.delete(product.id)

                        wishlistButton.textContent = "Add to wishlist"

                    } else {

                        await addToWishlist(product.id)

                        wishlistProductIds.add(product.id)

                        wishlistButton.textContent = "Remove from wishlist"
                    }

                } catch (error) {
                    console.error(error)

                } finally {
                    wishlistButton.disabled = false
                }
            })

            addToCartButton.addEventListener("click", async () => {
                const token = localStorage.getItem("token")

                if(!token) {
                    window.location.href = "login.html"
                    return
                }

                addToCartButton.disabled = true
                addToCartButton.textContent = "Adding..."

                try {
                    await addToCart(product.id, 1)

                    addToCartButton.textContent = "Added!"

                    setTimeout(() => {
                        addToCartButton.disabled = false
                        addToCartButton.textContent = "Add to cart"
                    }, 500)

                } catch (error) {

                    addToCartButton.disabled = false
                    addToCartButton.textContent = "Add to cart"

                    console.error(error)
                }
            })

            productList.appendChild(productCard)
        })

        renderPagination(data.pagination)

    } catch (error) {

        console.error("Failed to load products:", error)

        productList.innerHTML = `
            <p class="products-error">
                Unable to load products. Please try again.
            </p>
        `
    }
}


const renderPagination = (paginationData) => {

    pagination.innerHTML = ""

    if(!paginationData) {
        return
    }

    const { page, totalPages } = paginationData

    // No pagination needed for one page or less
    if(totalPages <= 1) {
        return
    }


    const pageIndicator = document.createElement("span")

    pageIndicator.textContent =
        `Page ${page} of ${totalPages}`


    if(page > 1) {

        const previousButton = document.createElement("button")

        previousButton.type = "button"
        previousButton.textContent = "Previous"


        previousButton.addEventListener("click", async () => {

            currentPage--

            await loadProducts(getProductFilterParams())


            productsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })
        })


        pagination.appendChild(previousButton)
    }


    pagination.appendChild(pageIndicator)


    if(page < totalPages) {

        const nextButton = document.createElement("button")

        nextButton.type = "button"
        nextButton.textContent = "Next"


        nextButton.addEventListener("click", async () => {

            currentPage++

            await loadProducts(getProductFilterParams())


            productsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })
        })


        pagination.appendChild(nextButton)
    }

}


const getProductFilterParams = () => {

    const formData = new FormData(productFilters)

    const params = {}

    const search = document.querySelector("#search").value.trim()

    const category = formData.get("category")
    const brand = formData.get("brand")
    const minPrice = formData.get("minPrice")
    const maxPrice = formData.get("maxPrice")


    if(minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {

        filterError.textContent =
            "Minimum price cannot be greater than maximum price."

        return null
    }


    if(search) params.search = search

    if(category) params.category = category

    if(brand) params.brand = brand

    if(minPrice) params.minPrice = minPrice

    if(maxPrice) params.maxPrice = maxPrice


    return params
}


productFilters.addEventListener("submit", async (event) => {

    event.preventDefault()

    currentPage = 1

    filterError.textContent = ""

    const params = getProductFilterParams()


    if(!params) {

        productList.innerHTML = ""
        pagination.innerHTML = ""

        return
    }


    await loadProducts(params)
})


productSearch.addEventListener("submit", async (event) => {

    event.preventDefault()

    currentPage = 1

    filterError.textContent = ""

    const params = getProductFilterParams()


    if(!params) {

        productList.innerHTML = ""
        pagination.innerHTML = ""

        return
    }


    await loadProducts(params)
})


resetFiltersButton.addEventListener("click", async () => {

    productFilters.reset()

    productSearch.reset()

    filterError.textContent = ""

    currentPage = 1

    await loadProducts()
})


const initializeStore = async () => {

    setupNavigation()

    await loadCategories()

    await loadBrands()

    await loadWishlist()

    await loadProducts()
}


initializeStore()