import { loginUser } from "./api.js"

const loginForm = document.querySelector("#login-form")
const loginMessage = document.querySelector("#login-message")

const emailError = document.querySelector("#email-error")
const passwordError = document.querySelector("#password-error")

const displayLoginError = (data) => {
    const errors = data.errors

    if (errors?.email) {
        emailError.textContent = errors.email
    }

    if (errors?.password) {
        passwordError.textContent = errors.password
    }
}

const clearLoginErrors =  () => {
    emailError.textContent = ""
    passwordError.textContent = ""
}



loginForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    loginMessage.textContent = ""

    clearLoginErrors()


    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value

    try {
        const data = await loginUser(email, password)

        localStorage.setItem("token", data.token)

        window.location.href = "index.html"
    } catch (error) {
        const data = error.response?.data

        if(data?.errors) {
            displayLoginError(data)
        } else {
            loginMessage.textContent = error.response?.data?.message || "Login failed"
            
        }
        
    }

})

document.querySelector("#email").addEventListener("input", () => {
    emailError.textContent = ""
})

document.querySelector("#password").addEventListener("input", () => {
    passwordError.textContent = ""
})