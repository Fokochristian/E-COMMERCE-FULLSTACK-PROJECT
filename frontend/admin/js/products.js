import { requireAuth, isAdmin, logout } from "../../js/auth.js"
import { getAdminBrands, getAdminProducts, getAdminCategories, createProduct, getAdminProduct, updateProduct, deleteProduct, restoreProduct } from "../../js/api.js"


const PRODUCTS_PER_PAGE = 25

let currentPage = 1
let totalPages = 1
let editingProductId = null


const projectAdminPage = () => {
    requireAuth()

    if (!isAdmin()) {
        window.location.href = "unauthorized.html"
        return
    }

    document.body.classList.add("authorized")
}



const setupLogout = () => {
    const logoutButton = document.querySelector("#admin-logout-button")

    if (!logoutButton) return

    logoutButton.addEventListener("click", logout)
}


const populateCategoryOptions = (categories) => {
    const categoryFilter = document.querySelector("#product-category")
    const categoryForm = document.querySelector("#product-form-category")

    if (!categoryFilter || !categoryForm) return

    categories.forEach((category) => {
        const filterOption = document.createElement("option")
        filterOption.value = category.id
        filterOption.textContent = category.name

        categoryFilter.appendChild(filterOption)


        const formOption = document.createElement("option")
        formOption.value = category.id
        formOption.textContent = category.name

        categoryForm.appendChild(formOption)
    })
}


const populateBrandOptions = (brands) => {
    const brandFilter = document.querySelector("#product-brand")
    const brandForm = document.querySelector("#product-form-brand")

    if (!brandFilter || !brandForm) return

    brands.forEach((brand) => {
        const filterOption = document.createElement("option")
        filterOption.value = brand.id
        filterOption.textContent = brand.name

        brandFilter.appendChild(filterOption)


        const formOption = document.createElement("option")
        formOption.value = brand.id
        formOption.textContent = brand.name

        brandForm.appendChild(formOption)
    })
}


const getCategoryName = (categoryId, categories) => {
    const category = categories.find(
        (category) => Number(category.id) === Number(categoryId)
    )

    return category ? category.name : "Unknown"
}


const getBrandName = (brandId, brands) => {
    const brand = brands.find(
        (brand) => Number(brand.id) === Number(brandId)
    )

    return brand ? brand.name : "Unknown"
}


const displayProducts = (products, categories, brands) => {
    const productsList = document.querySelector("#products-list")

    if (!productsList) return


    if (products.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="8">No products found.</td>
            </tr>
        `

        return
    }


    productsList.innerHTML = products.map((product) => `
        <tr>
            <td>
                <img
                    src="${product.image_path}"
                    alt="${product.name}"
                    class="product-thumbnail"
                >
            </td>

            <td>${product.name}</td>

            <td>
                ${getCategoryName(product.category_id, categories)}
            </td>

            <td>
                ${getBrandName(product.brand_id, brands)}
            </td>

            <td>
                ${Number(product.price).toLocaleString()} FCFA
            </td>

            <td>
                ${product.stock_quantity}
            </td>

            <td>
                <span class="product-status ${product.is_available ? "available" : "unavailable"}">
                    ${product.is_available ? "Available" : "Unavailable"}
                </span>
            </td>

            <td>
                <div class="product-actions">
                    <button
                        type="button"
                        class="product-actions-button"
                        aria-label="Product actions"
                    >
                        ⋮
                    </button>

                    <div class="product-actions-menu" hidden>
                        <button type="button" class="edit-product-action"
                        data-product-id="${product.id}"
                        >
                            <i class="fa-solid fa-pen"></i>
                            Edit
                        </button>

                        <button
                            type="button"
                            class="${product.is_available ? "delete-product-action" : "restore-product-action"}"
                            data-product-id="${product.id}"
                        >
                            ${product.is_available ? "Mark unavailable" : "Mark available"}
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `).join("")


    setupProductActionMenus()
    setupEditProductActions()
    setupDeleteProductActions()
    setupRestoreProductActions()
}


const updateProductsCount = (total, page, limit, products) => {
    const startElement = document.querySelector("#products-start")
    const endElement = document.querySelector("#products-end")
    const totalElement = document.querySelector("#products-total")

    if (!startElement || !endElement || !totalElement) return


    if (total === 0) {
        startElement.textContent = "0"
        endElement.textContent = "0"
        totalElement.textContent = "0"

        return
    }


    const start = (page - 1) * limit + 1
    const end = start + products.length - 1

    startElement.textContent = start
    endElement.textContent = end
    totalElement.textContent = total
}


const renderPagination = (pagination) => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")
    const currentPageDisplay = document.querySelector("#current-page-display")

    if (!previousButton || !nextButton || !currentPageDisplay) return


    currentPage = pagination.page
    totalPages = pagination.totalPages


    previousButton.disabled = currentPage === 1
    nextButton.disabled = currentPage === totalPages || totalPages === 0

    currentPageDisplay.textContent = `${currentPage} / ${totalPages}`
    
}


const setupProductActionMenus = () => {
    const actionButtons = document.querySelectorAll(".product-actions-button")

    actionButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation()

            const menu = button.nextElementSibling

            document
                .querySelectorAll(".product-actions-menu")
                .forEach((otherMenu) => {
                    if (otherMenu !== menu) {
                        otherMenu.hidden = true
                    }
                })

            menu.hidden = !menu.hidden
        })
    })
}


const setupPaginationControls = () => {
    const previousButton = document.querySelector("#previous-page")
    const nextButton = document.querySelector("#next-page")

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            if (currentPage > 1) {
                loadProducts(currentPage - 1)
            }
        })
    }


    if (nextButton) {
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                loadProducts(currentPage + 1)
            }
        })
    }
}


const getProductFilters = () => {
    const filterForm = document.querySelector("#product-filter-form")

    if (!filterForm) return {}

    const formData = new FormData(filterForm)

    return {
        search: formData.get("search")?.trim() || "",
        category: formData.get("category") || undefined,
        brand: formData.get("brand") || undefined,
        minPrice: formData.get("minPrice") || undefined,
        maxPrice: formData.get("maxPrice") || undefined
    }
}

const showProductSkeletons = () => {
    const productsTableSection = document.querySelector(".products-table-section")

    if (!productsTableSection) return

    productsTableSection.classList.add("loading")
}


const hideProductSkeletons = () => {
    const productsTableSection = document.querySelector(".products-table-section")

    if (!productsTableSection) return

    productsTableSection.classList.remove("loading")
}


const loadProducts = async (page = 1) => {
    showProductSkeletons()

    const startTime = performance.now()

    try {
        const filters = getProductFilters()

        const params = {
            ...filters,
            page,
            limit: PRODUCTS_PER_PAGE
        }

        const data = await getAdminProducts(params)

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        displayProducts(
            data.allProducts,
            window.productCategories,
            window.productBrands
        )

        updateProductsCount(
            data.pagination.total,
            data.pagination.page,
            data.pagination.limit,
            data.allProducts
        )

        renderPagination(data.pagination)

        hideProductSkeletons()
    } catch (error) {
        hideProductSkeletons()

        console.error("Failed to load products:", error)
    
    }
}

const loadProductOptions = async () => {
    const [categoriesData, brandsData] = await Promise.all([
        getAdminCategories(),
        getAdminBrands()
    ])


    const categories = categoriesData.categories
    const brands = brandsData.brands


    window.productCategories = categories
    window.productBrands = brands



    populateCategoryOptions(categories)
    populateBrandOptions(brands)
}


const setupProductFilters = () => {
    const filterForm = document.querySelector("#product-filter-form")
    const resetButton = document.querySelector("#reset-product-filters")


    if (filterForm) {
        filterForm.addEventListener("submit", (event) => {
            event.preventDefault()

            loadProducts(1)
        })
    }


    if (resetButton) {
        resetButton.addEventListener("click", () => {
            filterForm.reset()
            loadProducts(1)
        })
    }
}

const setupProductModal = () => {
    const addProductButton = document.querySelector("#add-product-button")
    const productModal = document.querySelector("#product-modal")
    const cancelProductButton = document.querySelector("#cancel-product-form")
    const closeProductModal = document.querySelector("#close-product-modal")
    const productModalOverlay = document.querySelector("#product-modal-overlay")
    const productForm = document.querySelector("#product-form")

    if(!addProductButton || !productModal) return

    addProductButton.addEventListener("click", () => {
        editingProductId = null

        productForm.reset()
        clearProductFormErrors()
        
        const currentProductImage = document.querySelector("#current-product-image")
        currentProductImage.innerHTML = ""
        currentProductImage.hidden = true

        document.querySelector("#product-modal-title").textContent = "Add product"

        document.querySelector("#product-image").required = true

        productModal.hidden = false
    })

    cancelProductButton.addEventListener("click", () => {
        productModal.hidden = true
    })

    closeProductModal.addEventListener("click", () => {
        productModal.hidden = true
    })

    productModalOverlay.addEventListener("click", () => {
        productModal.hidden = true
    })


}

const clearProductFormErrors = () => {
    const errorElements = document.querySelectorAll(".form-error")

    errorElements.forEach((element) => {
        element.textContent = ""
        element.hidden = true
    })
}


const displayProductFormErrors = (errors) => {
    clearProductFormErrors()

    if(!errors) return

    const fieldErrorMap = {
        name: "#product-name-error",
        description: "#product-description-error",
        price: "#product-price-error",
        stock_quantity: "#product-stock-error",
        category_id: "#product-category-error",
        brand_id: "#product-brand-error"
    }

    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.querySelector(fieldErrorMap[field])

        if(!errorElement) return

        errorElement.textContent = message
        errorElement.hidden = false
    })
}


const setupProductForm = () => {
    const productForm = document.querySelector("#product-form")
    const productModal = document.querySelector("#product-modal")
    const saveProductButton = document.querySelector("#save-product-button")

    if(!productForm || !productModal || !saveProductButton) return

    productForm.addEventListener("submit", async (event) => {
        event.preventDefault()

        clearProductFormErrors()

        const formData = new FormData(productForm)

        saveProductButton.disabled = true
        
        saveProductButton.innerHTML = `
            <span class="button-spinner"></span>
            Saving...
        `

        try {
            let data

            if(editingProductId) {
                data = await updateProduct(editingProductId, formData)
                
            } else {
                data = await createProduct(formData)
        
            }

            productForm.reset()
            productModal.hidden = true
            await loadProducts(1)

        } catch (error) {
            const backendErrors = error.response?.data?.errors

            displayProductFormErrors(backendErrors)

        } finally {
            saveProductButton.disabled = false
            saveProductButton.innerHTML = "Save Product"
        }
    })
}


const setupEditProductActions = () => {
    const editButtons = document.querySelectorAll(".edit-product-action")

    editButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.productId

            editingProductId = productId
            
            clearProductFormErrors()

            document.querySelector("#product-image").required = false

            try {
                const data = await getAdminProduct(productId)

               const product = data.product

               const currentProductImage = document.querySelector("#current-product-image")

               currentProductImage.innerHTML = `<img src = "${product.image_path}"
               alt="${product.name}"
               class="current-product-image-preview">
               `

               currentProductImage.hidden = false

                document.querySelector("#product-name").value = product.name
                document.querySelector("#product-description").value = product.description
                document.querySelector("#product-price").value = product.price
                document.querySelector("#product-stock").value = product.stock_quantity
                document.querySelector("#product-form-category").value = product.category_id
                document.querySelector("#product-form-brand").value = product.brand_id

                document.querySelector("#product-modal").hidden = false
                document.querySelector("#product-modal-title").textContent = "Edit Product"

            } catch (error) {
                console.error("failed to load product:", error)
                window.alert("Failed to load product")
            }
        })
    })
}

const setupDeleteProductActions = () => {
    const deleteButtons = document.querySelectorAll(".delete-product-action")

    deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.productId

            const confirmed = window.confirm("Are yo sure you want to mark this product as unvailable?")

            if(!confirmed) return

            try {
                await deleteProduct(productId)
                await loadProducts(currentPage)
            } catch (error) {
                console.error("Failed to mark product as unvailable:", error)
                window.alert*("Failed to mark product as unavailable")
            }
        })
    })
}

const setupRestoreProductActions = () => {
    const restoreButtons = document.querySelectorAll(".restore-product-action")

    restoreButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.productId

            const confirmed = window.confirm("Are you sure want to mark this product as available")

            if(!confirmed) return

            try {
                await restoreProduct(productId)
                await loadProducts(currentPage)
            } catch (error) {
                console.error("Failed to mark product as available:", error)
                window.alert("Failed to mark product available")
            }
        })
    })
}


document.addEventListener("click", () => {
    document
        .querySelectorAll(".product-actions-menu")
        .forEach((menu) => {
            menu.hidden = true
        })
})


const initializeProductsPage = async () => {
    projectAdminPage()
    setupLogout()
    setupPaginationControls()
    setupProductFilters()
    setupProductModal()
    setupProductForm()

    try {
        await loadProductOptions()
        await loadProducts(1)
    } catch (error) {
        console.error("Failed to initialize products page:")

        window.alert("Failed to load products")
    }
    
}


initializeProductsPage()

