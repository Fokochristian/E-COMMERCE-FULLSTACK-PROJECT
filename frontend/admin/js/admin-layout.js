const setupAdminDeviceMessage = () => {
    const layout = document.querySelector(".admin-layout")

    if (!layout) return

    const message = document.createElement("div")

    message.className = "admin-device-message"

    message.innerHTML = `
        <div class="admin-device-message-content">
            <i class="fa-solid fa-tablet-screen-button"></i>

            <h1>Admin Panel</h1>

            <p>
                Please use a tablet or larger screen
                for the best admin experience.
            </p>
        </div>
    `

    document.body.appendChild(message)
}


const setupAdminSidebar = () => {
    const sidebar = document.querySelector(".admin-sidebar")
    const topbar = document.querySelector(".admin-topbar")

    if (!sidebar || !topbar) return

    const menuButton = document.createElement("button")

    menuButton.type = "button"
    menuButton.className = "admin-menu-button"
    menuButton.setAttribute("aria-label", "Open admin navigation")
    menuButton.setAttribute("aria-expanded", "false")

    menuButton.innerHTML = `
        <i class="fa-solid fa-bars"></i>
    `


    const closeButton = document.createElement("button")

    closeButton.type = "button"
    closeButton.className = "admin-sidebar-close-button"
    closeButton.setAttribute("aria-label", "Close admin navigation")

    closeButton.innerHTML = `
        <i class="fa-solid fa-xmark"></i>
    `

    sidebar.prepend(closeButton)


    const overlay = document.createElement("div")

    overlay.className = "admin-sidebar-overlay"
    overlay.setAttribute("aria-hidden", "true")


    topbar.prepend(menuButton)

    document
        .querySelector(".admin-layout")
        .appendChild(overlay)


    const closeSidebar = () => {
        sidebar.classList.remove("open")
        overlay.classList.remove("visible")

        menuButton.setAttribute("aria-expanded", "false")

        menuButton.setAttribute(
            "aria-label",
            "Open admin navigation"
        )
    }


    const openSidebar = () => {
        sidebar.classList.add("open")
        overlay.classList.add("visible")

        menuButton.setAttribute("aria-expanded", "true")

        menuButton.setAttribute(
            "aria-label",
            "Close admin navigation"
        )
    }


    menuButton.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("open")

        if (isOpen) {
            closeSidebar()
        } else {
            openSidebar()
        }
    })


    closeButton.addEventListener("click", closeSidebar)


    overlay.addEventListener("click", closeSidebar)


    const navigationLinks = document.querySelectorAll(
        ".admin-nav-link"
    )

    navigationLinks.forEach((link) => {
        link.addEventListener("click", closeSidebar)
    })


    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            closeSidebar()
        }
    })
}


setupAdminDeviceMessage()
setupAdminSidebar()