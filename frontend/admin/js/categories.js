import { requireAuth, isAdmin, logout } from "../../js/auth.js"
import {
    getAdminCategories,
    createCategory,
    updateCategory
} from "../../js/api.js"


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

const clearCategoryFormErrors = () => {
    const errorElement = document.querySelector("#category-form-error")

    if (!errorElement) return

    errorElement.textContent = ""
    errorElement.hidden = true
}


const displayCategories = (categories) => {
    const categoriesList = document.querySelector("#categories-list")

    if (!categoriesList) return

    if (categories.length === 0) {
        categoriesList.innerHTML = `
            <tr>
                <td colspan="3">No categories found.</td>
            </tr>
        `
        return
    }

    categoriesList.innerHTML = categories.map((category) => `
        <tr>
            <td>#${category.id}</td>
            <td>${category.name}</td>
            <td>
                <button
                    type="button"
                    class="edit-category-button"
                    data-category-id="${category.id}"
                    data-category-name="${category.name}"
                >
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>
            </td>
        </tr>
    `).join("")

    setupEditCategoryButtons()
}


const showCategorySkeletons = () => {
    const categoriesTableSection = document.querySelector(
        ".categories-table-section"
    )

    if (!categoriesTableSection) return

    categoriesTableSection.classList.add("loading")
}


const hideCategorySkeletons = () => {
    const categoriesTableSection = document.querySelector(
        ".categories-table-section"
    )

    if (!categoriesTableSection) return

    categoriesTableSection.classList.remove("loading")
}

const loadCategories = async () => {
    showCategorySkeletons()

    const startTime = performance.now()

    try {
        const data = await getAdminCategories()

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        displayCategories(data.categories)

        hideCategorySkeletons()

    } catch (error) {
        hideCategorySkeletons()

        console.error("Failed to load categories:", error)

        window.alert("Failed to load categories")
    }
}


const openCategoryModal = (title, categoryId = null, categoryName = "") => {
    const modal = document.querySelector("#category-modal")
    const modalTitle = document.querySelector("#category-modal-title")
    const categoryForm = document.querySelector("#category-form")
    const categoryNameInput = document.querySelector("#category-name")
    const errorElement = document.querySelector("#category-form-error")

    if (
        !modal ||
        !modalTitle ||
        !categoryForm ||
        !categoryNameInput
    ) return
    

    clearCategoryFormErrors()

    modalTitle.textContent = title

    categoryForm.dataset.categoryId = categoryId || ""

    categoryNameInput.value = categoryName

    if (errorElement) {
        errorElement.hidden = true
        errorElement.textContent = ""
    }

    modal.hidden = false

    categoryNameInput.focus()
}


const closeCategoryModal = () => {
    const modal = document.querySelector("#category-modal")
    const categoryForm = document.querySelector("#category-form")

    if (!modal || !categoryForm) return

    modal.hidden = true

    categoryForm.reset()
    delete categoryForm.dataset.categoryId
}


const setupAddCategoryButton = () => {
    const addButton = document.querySelector("#add-category-button")

    if (!addButton) return

    addButton.addEventListener("click", () => {
        openCategoryModal("Add Category")

    })
}


const setupEditCategoryButtons = () => {
    const editButtons = document.querySelectorAll(".edit-category-button")

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const categoryId = button.dataset.categoryId
            const categoryName = button.dataset.categoryName

            clearCategoryFormErrors()

            openCategoryModal(
                "Edit Category",
                categoryId,
                categoryName
            )
        })
    })
}


const setupCategoryModal = () => {
    const closeButton = document.querySelector("#close-category-modal")
    const cancelButton = document.querySelector("#cancel-category-form")
    const overlay = document.querySelector("#category-modal-overlay")


    if (closeButton) {
        closeButton.addEventListener("click", closeCategoryModal)
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeCategoryModal)
    }

    if (overlay) {
        overlay.addEventListener("click", closeCategoryModal)
    }
}


const displayCategoryFormError = (message) => {
    const errorElement = document.querySelector("#category-form-error")

    if (!errorElement) return

    errorElement.textContent = message
    errorElement.hidden = false
}


const setupCategoryForm = () => {
    const categoryForm = document.querySelector("#category-form")

    if (!categoryForm) return

    categoryForm.addEventListener("submit", async (event) => {
        event.preventDefault()
        
        clearCategoryFormErrors()

        const categoryNameInput = document.querySelector("#category-name")

        if (!categoryNameInput) return

        const name = categoryNameInput.value.trim()

        if (!name) {
            displayCategoryFormError("Category name is required.")
            return
        }

        const categoryId = categoryForm.dataset.categoryId

        try {
            if (categoryId) {
                await updateCategory(categoryId, name)
            } else {
                await createCategory(name)
            }

            closeCategoryModal()
            await loadCategories()

        } catch (error) {
            console.error("Failed to save category:", error)

            const message =
                error.response?.data?.message ||
                "Failed to save category."

            displayCategoryFormError(message)
        }
    })
}


const initializeCategoriesPage = async () => {
    projectAdminPage()

    setupLogout()
    setupAddCategoryButton()
    setupCategoryModal()
    setupCategoryForm()

    await loadCategories()
}


initializeCategoriesPage()