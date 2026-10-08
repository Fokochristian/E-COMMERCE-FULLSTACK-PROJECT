const getToken = () => {
    return localStorage.getItem("token")

}


const getCurrentUser = () => {
    const token = getToken()

    if(!token) return null

    try {
        const payload = JSON.parse(atob(token.split(".")[1]))

        return {
            userId: payload.userId,
            role: payload.role
        }
    } catch (error) {
        return null
    }
}

const isAuthenticated = () => {

    return Boolean(getToken())
}

const isAdmin = () => {
    const user = getCurrentUser()

    return user?.role === "admin"
}

const requireAuth = () => {
    if(!isAuthenticated()) {
        const isAdminPage = window.location.pathname.includes("/admin/")

        if(isAdminPage) {
            window.location.href = "../login.html"
        } else {
            window.location.href = "login.html"
        }
    }
}

const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "../index.html"
}

export {getToken, isAuthenticated, requireAuth, getCurrentUser, isAdmin, logout}


