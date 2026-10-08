import { registerUser } from "./api.js"


const registerForm = document.querySelector("#register-form")
const registerMessage = document.querySelector("#register-message")

const passwordInput = document.querySelector("#password")
const confirmPasswordInput = document.querySelector("#confirm-password")

const firstNameError = document.querySelector("#first-name-error")
const lastNameError = document.querySelector("#last-name-error")
const emailError = document.querySelector("#email-error")
const passwordError = document.querySelector("#password-error")
const confirmPasswordError = document.querySelector("#confirm-password-error")

const displayRegistrationError = (data) => {
    const errors = data.errors

    if (errors?.first_name) {
        firstNameError.textContent = errors.first_name
    }

    if (errors?.last_name) {
        lastNameError.textContent = errors.last_name
    }

    if (errors?.email) {
        emailError.textContent = errors.email
    }

    if (errors?.password) {
        passwordError.textContent = errors.password
    }

    if (errors?.general) {
        registerMessage.textContent = errors.general
    }
}

const clearRegistrationErrors = () => {
    firstNameError.textContent = ""
    lastNameError.textContent = ""
    emailError.textContent = ""
    passwordError.textContent = ""
    confirmPasswordError.textContent = ""
    registerMessage.textContent = ""
}


registerForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    clearRegistrationErrors()

    const firstName = document.querySelector("#first-name").value
    const lastName = document.querySelector("#last-name").value
    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value
    const confirmPassword = document.querySelector("#confirm-password").value

    if(password !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match."
        return
    }
   
    try {
        const data = await registerUser(firstName, lastName, email, password)

        localStorage.setItem("token", data.token)

        window.location.href = "index.html"
    } catch (error) {
        const data = error.response?.data

        if (data?.errors) {
            displayRegistrationError(data)
        } else {
            registerMessage.textContent = data?.message || "Unable to create account"
        }
    }
})

document.querySelector("#first-name").addEventListener("input", () => {
    firstNameError.textContent = ""
})

document.querySelector("#last-name").addEventListener("input", () => {
    lastNameError.textContent = ""
})

document.querySelector("#email").addEventListener("input", () => {
    emailError.textContent = ""
})

passwordInput.addEventListener("input", () => {
    passwordError.textContent = ""
    confirmPasswordError.textContent = ""
})

confirmPasswordInput.addEventListener("input", () => {
    confirmPasswordError.textContent = ""
})