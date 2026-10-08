const validator = require('validator')

const validateFirstname = (first_name) => {
    if(!first_name) {
        return "First name is required"
    }

    if(first_name.length < 2) {
        return "First name must contain atleast 2 characters"
    }

    if(!/^[a-zA-Z]+$/.test(first_name)) {
        return "First name must contain only letters"
    }

    return null
}

const validateLastname = (last_name) => {
    if(!last_name) {
        return "Last name is required"
    }

    if(last_name.length < 2) {
        return "Last name must contain atleast 2 characters"
    }

    if(!/^[a-zA-Z]+$/.test(last_name)) {
        return "Last name must contain only letters"
    }

    return null
}

const validateEmail = (email) => {
    if(!email) {
        return "Email is required"
    }

    if(!validator.isEmail(email)) {
        return "Please enter a valid email"
    }

    return null
}

const validatePassword = (password) => {
    if(password === undefined || password === null || password === "") {
        return "Password is required"
    }

    if (typeof password !== "string") { 
        return "Password must be a string" 
    }
    
    if(password.length < 8) {
        return "Password must contain at least 8 characters"
    }

    return null
}


const validateRegistration = (data) => {
    const errors = {}

    const allowedFields = ["first_name", "last_name", "email", "password"]

    const unknownFields = Object.keys(data).filter(
        field => !allowedFields.includes(field)
    )

    if (unknownFields.length > 0) {
        errors.general = `Unknown field(s): ${unknownFields.join(", ")}`
    }

    const firstnameError = validateFirstname(data.first_name)
    if (firstnameError) {
        errors.first_name = firstnameError
    }

    const lastnameError = validateLastname(data.last_name)
    if (lastnameError) {
        errors.last_name = lastnameError
    }

    const emailError = validateEmail(data.email)
    if (emailError) {
        errors.email = emailError
    }

    const passwordError = validatePassword(data.password)
    if (passwordError) {
        errors.password = passwordError
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}

const validateLogin = (data) => {
    const errors = {}

    const allowedFields = ["email", "password"]

    const unknownFields = Object.keys(data).filter(field => !allowedFields.includes(field))

    if(unknownFields.length > 0) {
        errors.push(`Unknown field(s): ${unknownFields.join(", ")}`)
    }

    const emailError = validateEmail(data.email)

    if(emailError) {
        errors.email = emailError
    }

   const passwordError = validatePassword(data.password)

   if(passwordError) {
    errors.password = passwordError
   }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}

module.exports = { validateRegistration, validateLogin}