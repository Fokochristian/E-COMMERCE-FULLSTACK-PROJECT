import { requireAuth, isAdmin, logout } from "../../js/auth.js"
import {
    getAdminBrands,
    createBrand,
    updateBrand
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

const clearBrandFormErrors = () => {
    const errorElement = document.querySelector("#brand-form-error")

    if (!errorElement) return

    errorElement.textContent = ""
    errorElement.hidden = true
}

const displayBrands = (brands) => {
    const brandsList = document.querySelector("#brands-list")

    if (!brandsList) return

    if (brands.length === 0) {
        brandsList.innerHTML = `
            <tr>
                <td colspan="3">No brands found.</td>
            </tr>
        `
        return
    }

    brandsList.innerHTML = brands.map((brand) => `
        <tr>
            <td>#${brand.id}</td>
            <td>${brand.name}</td>
            <td>
                <button
                    type="button"
                    class="edit-brand-button"
                    data-brand-id="${brand.id}"
                    data-brand-name="${brand.name}"
                >
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>
            </td>
        </tr>
    `).join("")

    setupEditBrandButtons()
}

const showBrandSkeletons = () => {
    const brandsTableSection = document.querySelector(
        ".brands-table-section"
    )

    if (!brandsTableSection) return

    brandsTableSection.classList.add("loading")
}


const hideBrandSkeletons = () => {
    const brandsTableSection = document.querySelector(
        ".brands-table-section"
    )

    if (!brandsTableSection) return

    brandsTableSection.classList.remove("loading")
}

const loadBrands = async () => {
    showBrandSkeletons()

    const startTime = performance.now()

    try {
        const data = await getAdminBrands()

        const elapsedTime = performance.now() - startTime
        const minimumLoadingTime = 800
        const remainingTime = minimumLoadingTime - elapsedTime

        if (remainingTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }

        displayBrands(data.brands)

        hideBrandSkeletons()

    } catch (error) {
        hideBrandSkeletons()

        console.error("Failed to load brands:", error)

        window.alert("Failed to load brands")
    }
}

const closeBrandModal = () => {
    const modal = document.querySelector("#brand-modal")
    const brandForm = document.querySelector("#brand-form")

    if (!modal || !brandForm) return

    modal.hidden = true

    brandForm.reset()
    delete brandForm.dataset.brandId
}

const openBrandModal = (
    title,
    brandId = null,
    brandName = ""
) => {
    const modal = document.querySelector("#brand-modal")
    const brandForm = document.querySelector("#brand-form")
    const modalTitle = document.querySelector("#brand-modal-title")
    const brandNameInput = document.querySelector("#brand-name")

    if (
        !modal ||
        !brandForm ||
        !modalTitle ||
        !brandNameInput
    ) {
        return
    }

    modalTitle.textContent = title
    brandNameInput.value = brandName

    if (brandId) {
        brandForm.dataset.brandId = brandId
    } else {
        delete brandForm.dataset.brandId
    }

    clearBrandFormErrors()

    modal.hidden = false

    brandNameInput.focus()
}

const setupAddBrandButton = () => {
    const addButton = document.querySelector("#add-brand-button")

    if (!addButton) return

    addButton.addEventListener("click", () => {
        openBrandModal("Add Brand")
        
        
    })
}

const setupEditBrandButtons = () => {
    const editButtons = document.querySelectorAll(".edit-brand-button")

    clearBrandFormErrors()

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const brandId = button.dataset.brandId
            const brandName = button.dataset.brandName

            openBrandModal(
                "Edit Brand",
                brandId,
                brandName
            )
        })
    })
}

const setupBrandModal = () => {
    const closeButton = document.querySelector("#close-brand-modal")
    const cancelButton = document.querySelector("#cancel-brand-form")
    const overlay = document.querySelector("#brand-modal-overlay")

    if (closeButton) {
        closeButton.addEventListener("click", closeBrandModal)
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeBrandModal)
    }

    if (overlay) {
        overlay.addEventListener("click", closeBrandModal)
    }
}

const displayBrandFormError = (message) => {
    const errorElement = document.querySelector("#brand-form-error")

    if (!errorElement) return

    errorElement.textContent = message
    errorElement.hidden = false
}

const setupBrandForm = () => {
    const brandForm = document.querySelector("#brand-form")

    if (!brandForm) return

    brandForm.addEventListener("submit", async (event) => {
        event.preventDefault()

        clearBrandFormErrors()

        const brandNameInput = document.querySelector("#brand-name")

        if (!brandNameInput) return

        const name = brandNameInput.value.trim()

        if (!name) {
            displayBrandFormError("Brand name is required.")
            return
        }

        const brandId = brandForm.dataset.brandId

        try {
            if (brandId) {
                await updateBrand(brandId, name)
            } else {
                await createBrand(name)
            }

            closeBrandModal()
            await loadBrands()

        } catch (error) {
            console.error("Failed to save brand:", error)

            const message =
                error.response?.data?.message ||
                "Failed to save brand."

            displayBrandFormError(message)
        }
    })
}



const initializeBrandsPage = async () => {
    projectAdminPage()

    setupLogout()
    setupAddBrandButton()
    setupBrandModal()
    setupBrandForm()

    await loadBrands()
}

initializeBrandsPage()